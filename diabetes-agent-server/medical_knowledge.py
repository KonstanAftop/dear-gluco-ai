"""
Medical Knowledge Base for Diabetes Consultation in Indonesian
Contains evidence-based diabetes management information for AI agent.
"""

# Normal Reference Ranges (Indonesian Medical Guidelines)
GLUCOSE_RANGES = {
    "normal_fasting": {"min": 70, "max": 100, "unit": "mg/dL"},
    "normal_random": {"min": 70, "max": 140, "unit": "mg/dL"},
    "normal_post_meal": {"min": 70, "max": 140, "unit": "mg/dL"},
    "pre_diabetes_fasting": {"min": 100, "max": 125, "unit": "mg/dL"},
    "pre_diabetes_random": {"min": 140, "max": 199, "unit": "mg/dL"},
    "diabetes_fasting": {"min": 126, "max": float('inf'), "unit": "mg/dL"},
    "diabetes_random": {"min": 200, "max": float('inf'), "unit": "mg/dL"},
    "hypoglycemia": {"min": 0, "max": 70, "unit": "mg/dL"},
    "severe_hypoglycemia": {"min": 0, "max": 54, "unit": "mg/dL"},
    "hyperglycemia": {"min": 250, "max": float('inf'), "unit": "mg/dL"},
    "critical_high": {"min": 300, "max": float('inf'), "unit": "mg/dL"}
}

# Common Diabetes Medications (Indonesian Names)
DIABETES_MEDICATIONS = {
    "metformin": {
        "name": "Metformin",
        "type": "Biguanide",
        "mechanism": "Mengurangi produksi glukosa hati",
        "side_effects": ["Mual", "Diare", "Sakit perut"],
        "contraindications": ["Gangguan ginjal berat", "Gagal jantung"]
    },
    "glimepiride": {
        "name": "Glimepiride",
        "type": "Sulfonilurea",
        "mechanism": "Meningkatkan produksi insulin",
        "side_effects": ["Hipoglikemia", "Kenaikan berat badan"],
        "contraindications": ["Diabetes tipe 1", "Kehamilan"]
    },
    "insulin": {
        "name": "Insulin",
        "type": "Hormon",
        "mechanism": "Menurunkan gula darah langsung",
        "side_effects": ["Hipoglikemia", "Kenaikan berat badan", "Iritasi kulit"],
        "contraindications": ["Hipoglikemia"]
    },
    "glibenclamide": {
        "name": "Glibenclamide",
        "type": "Sulfonilurea",
        "mechanism": "Meningkatkan sekresi insulin",
        "side_effects": ["Hipoglikemia", "Gangguan pencernaan"],
        "contraindications": ["Gangguan ginjal", "Gangguan hati"]
    }
}

# Diabetes Symptoms in Indonesian
DIABETES_SYMPTOMS = {
    "classic_triad": [
        "Poliuria (sering buang air kecil)",
        "Polidipsia (haus berlebihan)",
        "Polifagia (lapar terus menerus)"
    ],
    "other_symptoms": [
        "Kelelahan berlebihan",
        "Penglihatan buram",
        "Luka sulit sembuh",
        "Infeksi berulang",
        "Kesemutan di tangan/kaki",
        "Berat badan turun tanpa sebab",
        "Gatal-gatal pada kulit",
        "Mulut kering"
    ],
    "emergency_symptoms": [
        "Napas berbau buah (aseton)",
        "Mual dan muntah hebat",
        "Dehidrasi berat",
        "Kesadaran menurun",
        "Nyeri perut hebat",
        "Sesak napas"
    ]
}

# Emergency Situations
EMERGENCY_CONDITIONS = {
    "diabetic_ketoacidosis": {
        "symptoms": ["Napas berbau buah", "Mual muntah", "Nyeri perut", "Dehidrasi"],
        "glucose_level": "> 250 mg/dL",
        "action": "SEGERA ke UGD"
    },
    "severe_hypoglycemia": {
        "symptoms": ["Kesadaran menurun", "Kejang", "Tidak responsif"],
        "glucose_level": "< 54 mg/dL",
        "action": "SEGERA ke UGD atau hubungi 119"
    },
    "hyperosmolar_state": {
        "symptoms": ["Dehidrasi berat", "Kesadaran menurun", "Demam"],
        "glucose_level": "> 600 mg/dL",
        "action": "SEGERA ke UGD"
    }
}

# Lifestyle Recommendations
LIFESTYLE_RECOMMENDATIONS = {
    "diet": {
        "principles": [
            "Makan teratur 3 kali sehari dengan 2-3 selingan",
            "Batasi karbohidrat sederhana (gula, permen)",
            "Pilih karbohidrat kompleks (nasi merah, roti gandum)",
            "Perbanyak serat dari sayur dan buah",
            "Protein tanpa lemak (ikan, ayam tanpa kulit, tahu)"
        ],
        "avoid": [
            "Makanan manis (kue, permen, minuman berpemanis)",
            "Gorengan dan makanan berlemak tinggi",
            "Nasi putih berlebihan",
            "Buah yang sangat manis (mangga, anggur berlebihan)"
        ]
    },
    "exercise": {
        "recommendations": [
            "Olahraga aerobik 150 menit per minggu",
            "Jalan cepat 30 menit, 5 hari per minggu",
            "Latihan beban 2-3 kali per minggu",
            "Aktivitas ringan setelah makan"
        ],
        "precautions": [
            "Cek gula darah sebelum olahraga",
            "Bawa makanan ringan jika hipoglikemia",
            "Mulai perlahan jika baru memulai",
            "Konsultasi dokter jika ada komplikasi"
        ]
    }
}

# Medical Disclaimers in Indonesian
MEDICAL_DISCLAIMERS = {
    "general": "Informasi ini hanya untuk edukasi dan tidak menggantikan konsultasi dengan dokter.",
    "emergency": "Jika ini darurat medis, segera hubungi 119 atau pergi ke UGD terdekat.",
    "medication": "Jangan mengubah dosis obat tanpa konsultasi dokter.",
    "glucose_monitoring": "Selalu konfirmasi hasil dengan alat glukometer yang terkalibrasi."
}

# Monitoring Guidelines
MONITORING_GUIDELINES = {
    "glucose_targets": {
        "pre_meal": "80-130 mg/dL",
        "post_meal": "< 180 mg/dL",
        "bedtime": "100-140 mg/dL",
        "hba1c": "< 7% untuk kebanyakan dewasa"
    },
    "monitoring_frequency": {
        "type1": "4-8 kali per hari",
        "type2_insulin": "2-4 kali per hari",
        "type2_medication": "1-2 kali per hari",
        "gestational": "4 kali per hari"
    }
}

# Indonesian Medical Terminology
MEDICAL_TERMS = {
    "diabetes_mellitus": "Diabetes mellitus/Kencing manis",
    "blood_glucose": "Gula darah/Glukosa darah",
    "insulin": "Insulin/Hormon insulin",
    "hypoglycemia": "Hipoglikemia/Gula darah rendah",
    "hyperglycemia": "Hiperglikemia/Gula darah tinggi",
    "hba1c": "HbA1c/Gula darah rata-rata 3 bulan",
    "diabetic_foot": "Kaki diabetes",
    "diabetic_retinopathy": "Retinopati diabetik/Gangguan mata diabetes",
    "diabetic_nephropathy": "Nefropati diabetik/Gangguan ginjal diabetes"
}

def get_glucose_assessment(glucose_level: float, meal_status: str = "unknown") -> dict:
    """
    Assess glucose level and return recommendation in Indonesian
    """
    assessment = {
        "level": glucose_level,
        "status": "",
        "category": "",
        "recommendation": "",
        "urgency": "normal"
    }

    if glucose_level < 54:
        assessment.update({
            "status": "DARURAT - Hipoglikemia Berat",
            "category": "critical",
            "recommendation": "SEGERA minum jus manis atau makan permen, dan hubungi dokter/UGD",
            "urgency": "emergency"
        })
    elif glucose_level < 70:
        assessment.update({
            "status": "Hipoglikemia",
            "category": "low",
            "recommendation": "Minum jus manis atau makan 15g karbohidrat cepat, cek ulang dalam 15 menit",
            "urgency": "urgent"
        })
    elif glucose_level <= 100:
        assessment.update({
            "status": "Normal",
            "category": "normal",
            "recommendation": "Kadar gula darah dalam batas normal, pertahankan pola hidup sehat",
            "urgency": "normal"
        })
    elif glucose_level <= 125:
        assessment.update({
            "status": "Pre-diabetes (puasa) atau Normal (setelah makan)",
            "category": "borderline",
            "recommendation": "Perhatikan pola makan dan olahraga teratur, konsultasi dokter untuk evaluasi",
            "urgency": "normal"
        })
    elif glucose_level <= 180:
        assessment.update({
            "status": "Sedikit Tinggi",
            "category": "elevated",
            "recommendation": "Batasi makanan manis, perbanyak aktivitas fisik, monitor ketat",
            "urgency": "normal"
        })
    elif glucose_level <= 250:
        assessment.update({
            "status": "Tinggi",
            "category": "high",
            "recommendation": "Hindari makanan manis, minum air putih, konsultasi dokter segera",
            "urgency": "urgent"
        })
    elif glucose_level <= 300:
        assessment.update({
            "status": "Sangat Tinggi",
            "category": "very_high",
            "recommendation": "Monitor gejala dehidrasi/mual, hubungi dokter hari ini",
            "urgency": "urgent"
        })
    else:
        assessment.update({
            "status": "DARURAT - Hiperglikemia Berat",
            "category": "critical",
            "recommendation": "SEGERA ke UGD atau hubungi dokter untuk evaluasi ketoasidosis",
            "urgency": "emergency"
        })

    return assessment

def get_symptom_assessment(symptoms: list) -> dict:
    """
    Assess symptoms and return urgency level
    """
    emergency_keywords = ["napas berbau", "muntah hebat", "kesadaran", "kejang", "sesak"]
    urgent_keywords = ["haus berlebih", "sering kencing", "berat badan turun", "penglihatan buram"]

    symptom_text = " ".join(symptoms).lower()

    if any(keyword in symptom_text for keyword in emergency_keywords):
        return {
            "urgency": "emergency",
            "recommendation": "SEGERA cari pertolongan medis darurat"
        }
    elif any(keyword in symptom_text for keyword in urgent_keywords):
        return {
            "urgency": "urgent",
            "recommendation": "Segera konsultasi dokter dalam 24-48 jam"
        }
    else:
        return {
            "urgency": "normal",
            "recommendation": "Monitor gejala dan konsultasi dokter jika memburuk"
        }