"""
DearGluco.ai Diabetes Consultation Agent
Real-time AI diabetes consultant using LiveKit Agents framework (v1.5+)
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import traceback

from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    llm,
)
from livekit.plugins import silero
from livekit import rtc

from medical_knowledge import (
    get_glucose_assessment,
    get_symptom_assessment,
    MEDICAL_DISCLAIMERS,
    DIABETES_MEDICATIONS,
    LIFESTYLE_RECOMMENDATIONS,
    EMERGENCY_CONDITIONS,
    MEDICAL_TERMS,
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
Anda adalah Dr. DearGluco, asisten AI diabetes yang berpengalaman dan berempati, khusus membantu pasien diabetes di Indonesia.

IDENTITAS & PERAN:
- Nama: Dr. DearGluco
- Spesialisasi: Konsultasi diabetes dan edukasi pasien
- Bahasa: Bahasa Indonesia yang ramah dan mudah dipahami
- Gaya komunikasi: Profesional namun hangat, seperti dokter keluarga

KEMAMPUAN UTAMA:
1. Menganalisis kadar gula darah dan memberikan rekomendasi
2. Mengevaluasi gejala diabetes dan tingkat urgensi
3. Memberikan edukasi tentang obat diabetes
4. Menyarankan pola hidup sehat untuk diabetes
5. Mendeteksi kondisi darurat dan memberikan arahan tepat

PRINSIP MEDIS:
- Selalu prioritaskan keselamatan pasien
- Berikan informasi berdasarkan evidence-based medicine
- Tidak menggantikan konsultasi dokter langsung
- Rujuk ke dokter/UGD untuk kondisi darurat
- Hindari diagnosis pasti, gunakan "kemungkinan" atau "indikasi"

PEDOMAN KOMUNIKASI:
- Gunakan bahasa Indonesia yang mudah dimengerti
- Hindari istilah medis rumit tanpa penjelasan
- Berikan empati dan dukungan emosional
- Jawaban singkat dan langsung ke pokok masalah
- Selalu akhiri dengan pertanyaan untuk melanjutkan dialog

PROTOCOL DARURAT:
Jika gula darah < 54 mg/dL atau > 300 mg/dL, atau ada gejala darurat:
"⚠️ INI KONDISI DARURAT! Segera hubungi 119 atau pergi ke UGD terdekat. Jangan tunggu!"

BATASAN:
- Tidak meresepkan obat atau mengubah dosis
- Tidak mendiagnosis penyakit lain selain diabetes
- Tidak memberikan saran bedah atau prosedur invasif
- Selalu menyarankan konfirmasi dengan dokter untuk keputusan penting

Mulai setiap sesi dengan menyapa hangat dan menanyakan keluhan utama hari ini.
""".strip()


def get_glucose_response(glucose_level: float) -> str:
    assessment = get_glucose_assessment(glucose_level)

    response = f"Kadar gula darah Anda {glucose_level} mg/dL - {assessment['status']}.\n\n"
    response += f"Rekomendasi: {assessment['recommendation']}\n\n"

    if assessment["urgency"] == "emergency":
        response = "⚠️ DARURAT! " + response
        response += "\n🚨 Segera hubungi 119 atau pergi ke UGD terdekat!"
    elif assessment["urgency"] == "urgent":
        response += "\n⚡ Kondisi ini perlu perhatian segera."

    response += f"\n\n{MEDICAL_DISCLAIMERS['glucose_monitoring']}"
    return response


def get_medication_info(medication_name: str) -> str:
    med_name = medication_name.lower()
    for key, med_info in DIABETES_MEDICATIONS.items():
        if key in med_name or med_info["name"].lower() in med_name:
            response = f"Informasi tentang {med_info['name']}:\n\n"
            response += f"Jenis: {med_info['type']}\n"
            response += f"Cara kerja: {med_info['mechanism']}\n"
            response += f"Efek samping umum: {', '.join(med_info['side_effects'])}\n\n"
            response += f"{MEDICAL_DISCLAIMERS['medication']}"
            return response
    return (
        f"Maaf, saya tidak memiliki informasi lengkap tentang {medication_name}. "
        "Silakan konsultasi dengan dokter atau apoteker untuk informasi yang lebih detail."
    )


# ---------------------------------------------------------------------------
# LiveKit Agent Server (v1.5+ API)
# ---------------------------------------------------------------------------

server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="diabetes-consultant")
async def entrypoint(ctx: JobContext) -> None:
    t0 = datetime.now()
    logger.info("[DIAG] entrypoint called for room %s at %s", ctx.room.name, t0.isoformat())
    logger.info("[DIAG] participants in room: %d", len(ctx.room.remote_participants))

    session = AgentSession(
        stt=inference.STT("deepgram/nova-3", language="id"),
        llm=inference.LLM("openai/gpt-4o-mini"),
        tts=inference.TTS("openai/tts-1", voice="alloy"),
        vad=ctx.proc.userdata["vad"],
    )

    agent = Agent(instructions=SYSTEM_PROMPT)

    @ctx.room.on("data_received")
    def on_data_received(packet: rtc.DataPacket):
        try:
            message = json.loads(packet.data.decode())
            msg_type = message.get("type")
            payload = message.get("data", {})

            if msg_type == "medical_data":
                inner_type = payload.get("type", "")

                if inner_type == "chat_message":
                    text = payload.get("content", "")
                    logger.info("Chat message from patient: %s", text)
                    asyncio.create_task(
                        _handle_chat_message(ctx, session, text)
                    )
                else:
                    logger.info("Received medical data: %s", payload)
                    asyncio.create_task(
                        _handle_medical_data(ctx, session, payload)
                    )
        except Exception as exc:
            logger.error("Error processing data: %s", exc)

    t1 = datetime.now()
    logger.info("[DIAG] calling session.start() at %s", t1.isoformat())
    await session.start(agent=agent, room=ctx.room)
    t2 = datetime.now()
    logger.info("[DIAG] session.start() completed at %s (took %s ms)", t2.isoformat(), (t2 - t1).total_seconds() * 1000)
    logger.info("[DIAG] participants after session.start(): %d", len(ctx.room.remote_participants))

    # Wait for at least one remote participant before greeting
    if len(ctx.room.remote_participants) == 0:
        logger.info("[DIAG] no remote participants yet, waiting for participant...")
        try:
            await ctx.wait_for_participant()
            t_wait = datetime.now()
            logger.info("[DIAG] participant arrived at %s (waited %s ms)", t_wait.isoformat(), (t_wait - t2).total_seconds() * 1000)
        except Exception as wait_exc:
            logger.warning("[DIAG] wait_for_participant failed or not available: %s", wait_exc)
            logger.info("[DIAG] falling back to 2s delay")
            await asyncio.sleep(2)
    else:
        logger.info("[DIAG] participant already present, proceeding to greeting")

    logger.info("[DIAG] participants before greeting: %d", len(ctx.room.remote_participants))
    for p in ctx.room.remote_participants.values():
        logger.info("[DIAG]   participant: %s (name=%s)", p.identity, p.name)

    t3 = datetime.now()
    logger.info("[DIAG] calling generate_reply() for greeting at %s", t3.isoformat())
    try:
        await session.generate_reply(
            instructions=(
                "Sapa pasien dengan hangat. Perkenalkan diri sebagai Dr. DearGluco, "
                "asisten AI diabetes. Tanyakan keluhan atau pertanyaan mereka hari ini. "
                "Gunakan bahasa Indonesia."
            )
        )
        t4 = datetime.now()
        logger.info("[DIAG] generate_reply() SUCCEEDED at %s (took %s ms)", t4.isoformat(), (t4 - t3).total_seconds() * 1000)
    except Exception as greet_exc:
        t4 = datetime.now()
        logger.error("[DIAG] generate_reply() FAILED at %s (took %s ms): %s", t4.isoformat(), (t4 - t3).total_seconds() * 1000, greet_exc)
        traceback.print_exc()

        # Fallback: send text greeting via data channel
        logger.info("[DIAG] sending fallback text greeting via data channel")
        try:
            greeting_text = (
                "Halo! Saya Dr. DearGluco, asisten AI diabetes Anda. "
                "Ada yang bisa saya bantu hari ini mengenai kondisi diabetes Anda?"
            )
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "agent_message",
                    "content": greeting_text,
                    "timestamp": datetime.now().isoformat(),
                }).encode()
            )
            logger.info("[DIAG] fallback text greeting sent successfully")
        except Exception as fb_exc:
            logger.error("[DIAG] fallback text greeting also failed: %s", fb_exc)

    logger.info("[DIAG] agent is ready. Total setup time: %s ms", (datetime.now() - t0).total_seconds() * 1000)


async def _handle_chat_message(
    ctx: JobContext,
    session: AgentSession,
    text: str,
) -> None:
    """Process a text chat message from the patient.

    Tries the live voice session first.  If the session has crashed (e.g. due
    to an STT rate-limit error), falls back to a direct LLM call and sends the
    reply over the data channel so the patient still gets a text response.
    """
    if not text.strip():
        return

    try:
        await session.generate_reply(
            instructions=f'Pasien mengirim pesan teks berikut: "{text}". Jawab dalam bahasa Indonesia.'
        )
    except RuntimeError:
        logger.warning("Voice session not running – falling back to text-only reply")
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI()
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
                max_tokens=512,
            )
            reply = completion.choices[0].message.content or "Maaf, terjadi kesalahan."

            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "agent_message",
                    "content": reply,
                    "timestamp": datetime.now().isoformat(),
                }).encode()
            )
        except Exception as inner:
            logger.error("Fallback text reply failed: %s", inner)
            traceback.print_exc()
    except Exception as exc:
        logger.error("Error handling chat message: %s", exc)
        traceback.print_exc()


async def _handle_medical_data(
    ctx: JobContext,
    session: AgentSession,
    medical_data: dict,
) -> None:
    """Process structured medical data and respond via data channel + voice."""
    try:
        response_parts: list[str] = []

        if "glucose_level" in medical_data or "level" in medical_data:
            glucose = medical_data.get("glucose_level") or medical_data.get("level")
            if isinstance(glucose, (int, float)):
                response_parts.append(get_glucose_response(float(glucose)))

        if "symptoms" in medical_data:
            symptoms = medical_data.get("symptoms", [])
            if symptoms:
                assessment = get_symptom_assessment(symptoms)
                resp = "Berdasarkan gejala yang Anda sampaikan:\n"
                for i, symptom in enumerate(symptoms, 1):
                    resp += f"{i}. {symptom}\n"
                resp += f"\n{assessment['recommendation']}\n"
                if assessment["urgency"] == "emergency":
                    resp = "⚠️ GEJALA DARURAT TERDETEKSI!\n" + resp
                    resp += "\n🚨 Segera cari pertolongan medis!"
                response_parts.append(resp)

        if "medication" in medical_data:
            medication = medical_data.get("medication")
            if medication:
                response_parts.append(get_medication_info(medication))

        response = (
            "\n\n".join(response_parts)
            if response_parts
            else "Terima kasih atas informasinya. Ada yang ingin Anda tanyakan lebih lanjut?"
        )

        await ctx.room.local_participant.publish_data(
            json.dumps(
                {
                    "type": "agent_message",
                    "content": response,
                    "timestamp": datetime.now().isoformat(),
                }
            ).encode()
        )

        is_emergency = any(
            "DARURAT" in part or "emergency" in part.lower()
            for part in response_parts
        )
        if is_emergency:
            await session.generate_reply(
                instructions=f"Sampaikan pesan darurat berikut kepada pasien secara lisan: {response}"
            )

    except Exception as exc:
        logger.error("Error handling medical data: %s", exc)
        traceback.print_exc()


if __name__ == "__main__":
    cli.run_app(server)
