import { CheckCircle2, FileAudio, Clock, User, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingCompleteProps {
  doctorName: string;
  duration: string;
  date: string;
  onSave: () => void;
  onDiscard: () => void;
}

const RecordingComplete = ({ doctorName, duration, date, onSave, onDiscard }: RecordingCompleteProps) => (
  <div className="space-y-5 animate-fade-in">
    {/* Success header */}
    <div className="text-center space-y-2">
      <div className="mx-auto h-14 w-14 rounded-full bg-teal/10 flex items-center justify-center">
        <CheckCircle2 className="h-7 w-7 text-teal" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Rekaman Selesai</h2>
      <p className="text-sm text-muted-foreground">Konsultasi berhasil direkam</p>
    </div>

    {/* Recording details */}
    <div className="bg-card rounded-xl p-5 border border-teal-light/30 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center">
          <FileAudio className="h-5 w-5 text-teal" />
        </div>
        <div>
          <p className="font-bold text-foreground">Rekaman Konsultasi</p>
          <p className="text-xs text-muted-foreground">Audio Recording</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Dokter</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{doctorName}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Durasi</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{duration}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">{date}</p>
    </div>

    {/* Actions */}
    <div className="space-y-2 pt-1">
      <Button
        onClick={onSave}
        className="w-full bg-teal hover:bg-teal/90 text-primary-foreground font-semibold h-12 rounded-xl"
      >
        <Download className="h-4 w-4 mr-2" />
        Simpan Rekaman
      </Button>
      <Button
        onClick={onDiscard}
        variant="outline"
        className="w-full border-destructive/30 text-destructive font-medium h-11 rounded-xl hover:bg-destructive/5"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Hapus Rekaman
      </Button>
    </div>
  </div>
);

export default RecordingComplete;
