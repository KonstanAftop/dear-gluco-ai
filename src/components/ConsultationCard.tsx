import { Calendar, Clock, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsultationCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  onRecord?: (doctorName: string) => void;
}

const ConsultationCard = ({ doctorName, specialty, date, time, onRecord }: ConsultationCardProps) => (
  <div className="bg-card rounded-xl p-4 border border-teal-light/30 shadow-sm animate-fade-in">
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-bold text-navy text-base">{doctorName}</h4>
        <p className="text-sm text-muted-foreground mb-3">{specialty}</p>
      </div>
      {onRecord && (
        <Button
          onClick={() => onRecord(doctorName)}
          size="sm"
          className="bg-teal hover:bg-teal/90 text-primary-foreground rounded-lg h-8 text-xs gap-1"
        >
          <Mic className="h-3 w-3" />
          Rekam
        </Button>
      )}
    </div>
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
