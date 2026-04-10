import VoiceAIHero from "@/components/VoiceAIHero";
import ConsultationCard from "@/components/ConsultationCard";
import { Activity, Droplets } from "lucide-react";

const QuickStat = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 animate-fade-in">
    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

interface BerandaScreenProps {
  onStartRecording?: (doctor: string) => void;
}

const BerandaScreen = ({ onStartRecording }: BerandaScreenProps) => (
  <div className="space-y-5">
    <VoiceAIHero />

    <div className="grid grid-cols-2 gap-3">
      <QuickStat icon={Droplets} label="Gula Darah" value="110 mg/dL" color="bg-teal/10 text-teal" />
      <QuickStat icon={Activity} label="HbA1c" value="6.2%" color="bg-orange-soft/20 text-orange-vibrant" />
    </div>

    <div>
      <h3 className="font-bold text-foreground mb-3">Konsultasi Mendatang</h3>
      <div className="space-y-3">
        <ConsultationCard
          doctorName="Dr. Anisa Putri"
          specialty="Endokrinologi"
          date="12 Apr 2026"
          time="10:00"
          onRecord={onStartRecording}
        />
        <ConsultationCard
          doctorName="Dr. Budi Hartono"
          specialty="Gizi Klinik"
          date="15 Apr 2026"
          time="14:30"
          onRecord={onStartRecording}
        />
      </div>
    </div>
  </div>
);

export default BerandaScreen;
