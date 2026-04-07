import { useState } from "react";
import { Shield, Mic, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Role = "patient" | "doctor";

interface ConsentPageProps {
  role: Role;
  partnerName: string;
  onConsent: () => void;
  onDecline: () => void;
}

const consentPoints = {
  patient: [
    "Saya menyetujui percakapan konsultasi ini direkam untuk tujuan dokumentasi medis.",
    "Rekaman hanya akan digunakan untuk catatan kesehatan pribadi saya.",
    "Saya dapat meminta penghapusan rekaman kapan saja.",
    "Rekaman akan disimpan secara terenkripsi dan aman.",
  ],
  doctor: [
    "Saya menyetujui percakapan konsultasi ini direkam untuk tujuan dokumentasi medis.",
    "Rekaman hanya akan digunakan untuk catatan kesehatan pasien.",
    "Saya memahami bahwa pasien dapat meminta penghapusan rekaman.",
    "Rekaman akan disimpan sesuai regulasi kerahasiaan medis.",
  ],
};

const ConsentPage = ({ role, partnerName, onConsent, onDecline }: ConsentPageProps) => {
  const [checks, setChecks] = useState<boolean[]>(new Array(consentPoints[role].length).fill(false));
  const allChecked = checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto h-14 w-14 rounded-full bg-teal/10 flex items-center justify-center">
          <Shield className="h-7 w-7 text-teal" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Persetujuan Rekaman</h2>
        <p className="text-sm text-muted-foreground">
          {role === "patient" ? "Sebagai Pasien" : "Sebagai Dokter"}
        </p>
      </div>

      {/* Info card */}
      <div className="bg-card rounded-xl p-4 border border-teal-light/30 space-y-2">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-teal" />
          <p className="text-sm font-medium text-foreground">Rekaman Konsultasi</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Konsultasi dengan <span className="font-semibold text-foreground">{partnerName}</span> akan
          direkam. Kedua pihak harus memberikan persetujuan sebelum perekaman dimulai.
        </p>
      </div>

      {/* Consent checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-navy" />
          <p className="text-sm font-bold text-foreground">Syarat & Ketentuan</p>
        </div>
        {consentPoints[role].map((point, i) => (
          <label
            key={i}
            className="flex items-start gap-3 bg-card rounded-xl p-3.5 border border-border cursor-pointer hover:border-teal/40 transition-colors"
          >
            <Checkbox
              checked={checks[i]}
              onCheckedChange={() => toggleCheck(i)}
              className="mt-0.5 data-[state=checked]:bg-teal data-[state=checked]:border-teal"
            />
            <span className="text-sm text-foreground leading-relaxed">{point}</span>
          </label>
        ))}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 bg-orange-soft/10 rounded-xl p-3 border border-orange-soft/30">
        <AlertTriangle className="h-4 w-4 text-orange-vibrant mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Rekaman tidak dapat dimulai tanpa persetujuan kedua belah pihak.
          Anda dapat membatalkan persetujuan kapan saja selama konsultasi.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <Button
          onClick={onConsent}
          disabled={!allChecked}
          className="w-full bg-teal hover:bg-teal/90 text-primary-foreground font-semibold h-12 rounded-xl"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Saya Setuju
        </Button>
        <Button
          onClick={onDecline}
          variant="outline"
          className="w-full border-navy/20 text-navy font-medium h-11 rounded-xl"
        >
          Tolak & Kembali
        </Button>
      </div>
    </div>
  );
};

export default ConsentPage;
