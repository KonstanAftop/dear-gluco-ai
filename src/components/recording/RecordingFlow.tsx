import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ConsentPage from "./ConsentPage";
import RecordingScreen from "./RecordingScreen";
import RecordingComplete from "./RecordingComplete";
import { toast } from "sonner";

type Step = "consent-patient" | "consent-doctor" | "recording" | "complete";

interface RecordingFlowProps {
  doctorName: string;
  onClose: () => void;
}

const RecordingFlow = ({ doctorName, onClose }: RecordingFlowProps) => {
  const [step, setStep] = useState<Step>("consent-patient");
  const [duration, setDuration] = useState("");

  const handlePatientConsent = () => {
    toast.success("Persetujuan pasien diterima");
    setStep("consent-doctor");
  };

  const handleDoctorConsent = () => {
    toast.success("Persetujuan dokter diterima. Rekaman dimulai.");
    setStep("recording");
  };

  const handleRecordingStop = (dur: string) => {
    setDuration(dur);
    setStep("complete");
  };

  const handleSave = () => {
    toast.success("Rekaman berhasil disimpan");
    onClose();
  };

  const handleDiscard = () => {
    toast("Rekaman dihapus");
    onClose();
  };

  const stepTitle: Record<Step, string> = {
    "consent-patient": "Persetujuan Pasien",
    "consent-doctor": "Persetujuan Dokter",
    recording: "Rekaman",
    complete: "Selesai",
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] px-4 pt-4 pb-8">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div>
            <p className="text-sm font-bold text-foreground">{stepTitle[step]}</p>
            <p className="text-xs text-muted-foreground">
              {step === "consent-patient" && "Langkah 1 dari 2"}
              {step === "consent-doctor" && "Langkah 2 dari 2"}
              {step === "recording" && `Dengan ${doctorName}`}
              {step === "complete" && "Rekaman selesai"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {(step === "consent-patient" || step === "consent-doctor") && (
          <div className="flex gap-2 mb-6">
            <div className="flex-1 h-1.5 rounded-full bg-teal" />
            <div className={`flex-1 h-1.5 rounded-full ${step === "consent-doctor" ? "bg-teal" : "bg-muted"}`} />
          </div>
        )}

        {step === "consent-patient" && (
          <ConsentPage role="patient" partnerName={doctorName} onConsent={handlePatientConsent} onDecline={onClose} />
        )}
        {step === "consent-doctor" && (
          <ConsentPage role="doctor" partnerName="Pasien" onConsent={handleDoctorConsent} onDecline={onClose} />
        )}
        {step === "recording" && (
          <RecordingScreen doctorName={doctorName} onStop={handleRecordingStop} onCancel={onClose} />
        )}
        {step === "complete" && (
          <RecordingComplete
            doctorName={doctorName}
            duration={duration}
            date={new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        )}
      </div>
    </div>
  );
};

export default RecordingFlow;
