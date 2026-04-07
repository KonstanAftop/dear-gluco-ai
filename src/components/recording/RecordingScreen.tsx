import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Square, Pause, Play, Clock, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingScreenProps {
  doctorName: string;
  onStop: (duration: string) => void;
  onCancel: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const RecordingScreen = ({ doctorName, onStop, onCancel }: RecordingScreenProps) => {
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, isPaused]);

  const handlePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const handleStop = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onStop(formatTime(elapsed));
  }, [elapsed, onStop]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Rekaman Aktif</h2>
        <button onClick={onCancel} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Doctor info */}
      <div className="bg-card rounded-xl p-4 border border-teal-light/30 text-center space-y-1">
        <p className="text-sm text-muted-foreground">Konsultasi dengan</p>
        <p className="text-lg font-bold text-navy">{doctorName}</p>
      </div>

      {/* Recording indicator */}
      <div className="flex flex-col items-center space-y-6 py-4">
        {/* Pulse circle */}
        <div className="relative">
          <div
            className={`h-28 w-28 rounded-full flex items-center justify-center transition-colors ${
              isPaused ? "bg-muted" : "bg-destructive/10"
            }`}
          >
            {isPaused ? (
              <MicOff className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Mic className="h-10 w-10 text-destructive" />
            )}
          </div>
          {!isPaused && isRecording && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-destructive/40 animate-pulse-ring" />
              <div className="absolute -inset-3 rounded-full border border-destructive/20 animate-pulse-ring [animation-delay:0.5s]" />
            </>
          )}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-3xl font-bold font-mono text-foreground">{formatTime(elapsed)}</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-orange-soft" : "bg-destructive animate-pulse"}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {isPaused ? "Dijeda" : "Merekam..."}
          </span>
        </div>
      </div>

      {/* Waveform placeholder */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-center gap-[3px] h-12">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                isPaused
                  ? "bg-muted-foreground/20 h-2"
                  : "bg-teal-light"
              }`}
              style={
                isPaused
                  ? {}
                  : {
                      height: `${Math.random() * 80 + 20}%`,
                      animation: `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }
              }
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <Button
          onClick={handlePause}
          variant="outline"
          className="h-14 w-14 rounded-full border-navy/20"
        >
          {isPaused ? <Play className="h-5 w-5 text-teal" /> : <Pause className="h-5 w-5 text-navy" />}
        </Button>
        <Button
          onClick={handleStop}
          className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 text-primary-foreground"
        >
          <Square className="h-6 w-6" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tekan tombol merah untuk menghentikan rekaman
      </p>
    </div>
  );
};

export default RecordingScreen;
