import { useState } from "react";
import { X, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceAIModalProps {
  open: boolean;
  onClose: () => void;
}

const Waveform = () => (
  <div className="flex items-center justify-center gap-1 h-10">
    {[0, 0.15, 0.3, 0.15, 0.25, 0.35, 0.1, 0.2].map((delay, i) => (
      <div
        key={i}
        className="w-1 rounded-full bg-teal-light animate-waveform"
        style={{ animationDelay: `${delay}s`, height: "8px" }}
      />
    ))}
  </div>
);

const VoiceAIModal = ({ open, onClose }: VoiceAIModalProps) => {
  const [isListening, setIsListening] = useState(false);

  const messages = [
    { role: "user" as const, text: "Berapa kadar gula darah normal?" },
    {
      role: "ai" as const,
      text: "Kadar gula darah normal saat puasa adalah 70-100 mg/dL. Setelah makan, normalnya di bawah 140 mg/dL.",
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40">
      <div className="w-full max-w-[440px] bg-card rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="gradient-hero rounded-t-3xl p-4 flex items-center justify-between">
          <h3 className="text-primary-foreground font-bold text-lg">Asisten AI</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-navy text-primary-foreground"
                    : "bg-teal-light text-accent-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Waveform & controls */}
        <div className="p-6 flex flex-col items-center gap-4 border-t border-border">
          {isListening && <Waveform />}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-orange-vibrant animate-pulse-ring" />
            )}
            <Button
              variant={isListening ? "hero" : "default"}
              size="icon"
              className="relative z-10 rounded-full h-14 w-14"
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {isListening ? "Mendengarkan..." : "Ketuk untuk bicara"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceAIModal;
