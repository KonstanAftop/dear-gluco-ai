import { Calendar, Clock } from "lucide-react";

interface ConsultationCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}

const ConsultationCard = ({ doctorName, specialty, date, time }: ConsultationCardProps) => (
  <div className="bg-card rounded-xl p-4 border border-teal-light/30 shadow-sm animate-fade-in">
    <h4 className="font-bold text-navy text-base">{doctorName}</h4>
    <p className="text-sm text-muted-foreground mb-3">{specialty}</p>
    <div className="flex gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5 text-teal" />
        {date}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-teal" />
        {time}
      </span>
    </div>
  </div>
);

export default ConsultationCard;
