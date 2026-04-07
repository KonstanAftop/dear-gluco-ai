import { useState } from "react";
import { TrendingDown, TrendingUp, Minus, Calendar, Clock, Stethoscope, Droplets } from "lucide-react";

interface LogEntry {
  date: string;
  time: string;
  value: number;
  trend: "up" | "down" | "stable";
}

interface ConsultationEntry {
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  notes: string;
}

const logs: LogEntry[] = [
  { date: "7 Apr", time: "07:00", value: 95, trend: "stable" },
  { date: "7 Apr", time: "12:30", value: 142, trend: "up" },
  { date: "6 Apr", time: "07:00", value: 102, trend: "stable" },
  { date: "6 Apr", time: "19:00", value: 168, trend: "up" },
  { date: "5 Apr", time: "07:00", value: 88, trend: "down" },
  { date: "4 Apr", time: "07:00", value: 110, trend: "stable" },
  { date: "3 Apr", time: "18:00", value: 135, trend: "up" },
];

const consultations: ConsultationEntry[] = [
  { date: "1 Apr 2026", time: "10:00", doctorName: "Dr. Anisa Putri", specialty: "Endokrinologi", notes: "HbA1c turun ke 6.2%. Lanjutkan pola makan saat ini." },
  { date: "18 Mar 2026", time: "14:00", doctorName: "Dr. Budi Hartono", specialty: "Gizi Klinik", notes: "Kurangi karbohidrat olahan, tambah serat." },
  { date: "5 Mar 2026", time: "09:30", doctorName: "Dr. Anisa Putri", specialty: "Endokrinologi", notes: "Dosis metformin disesuaikan. Cek ulang 1 bulan." },
  { date: "20 Feb 2026", time: "11:00", doctorName: "Dr. Rina Sari", specialty: "Penyakit Dalam", notes: "Tekanan darah stabil. Tetap jaga pola hidup sehat." },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-orange-vibrant" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-teal" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const getValueColor = (v: number) => {
  if (v > 140) return "text-orange-vibrant font-bold";
  if (v < 70) return "text-destructive font-bold";
  return "text-teal font-bold";
};

type Tab = "gula" | "konsultasi";

const RiwayatScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>("gula");

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">Riwayat</h2>

      {/* Tab switcher */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab("gula")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "gula"
              ? "bg-card text-teal shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Droplets className="h-4 w-4" />
          Gula Darah
        </button>
        <button
          onClick={() => setActiveTab("konsultasi")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "konsultasi"
              ? "bg-card text-teal shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          Konsultasi
        </button>
      </div>

      {activeTab === "gula" ? (
        <>
          {/* Summary bar */}
          <div className="gradient-hero rounded-xl p-4 flex justify-around text-primary-foreground text-center">
            <div>
              <p className="text-2xl font-bold">88</p>
              <p className="text-[10px] opacity-80">Terendah</p>
            </div>
            <div className="border-l border-primary-foreground/20" />
            <div>
              <p className="text-2xl font-bold">120</p>
              <p className="text-[10px] opacity-80">Rata-rata</p>
            </div>
            <div className="border-l border-primary-foreground/20" />
            <div>
              <p className="text-2xl font-bold">168</p>
              <p className="text-[10px] opacity-80">Tertinggi</p>
            </div>
          </div>

          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{log.date}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${getValueColor(log.value)}`}>{log.value}</span>
                  <span className="text-xs text-muted-foreground">mg/dL</span>
                  <TrendIcon trend={log.trend} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-teal-light/30 shadow-sm">
              <h4 className="font-bold text-navy text-base">{c.doctorName}</h4>
              <p className="text-sm text-muted-foreground mb-2">{c.specialty}</p>
              <p className="text-sm text-foreground mb-3 bg-muted/50 rounded-lg p-2.5 leading-relaxed">
                {c.notes}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-teal" />
                  {c.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-teal" />
                  {c.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatScreen;
