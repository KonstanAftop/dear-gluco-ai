import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceAIModal from "./VoiceAIModal";

const VoiceAIHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground animate-fade-in">
        <h2 className="text-lg font-bold mb-1">Asisten Kesehatan AI</h2>
        <p className="text-primary-foreground/80 text-sm mb-6">
          Tanya apa saja tentang diabetes Anda
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-vibrant animate-pulse-ring" />
            <Button
              variant="hero"
              size="lg"
              className="relative z-10 rounded-full h-16 w-16 p-0"
              onClick={() => setIsModalOpen(true)}
            >
              <Mic className="h-7 w-7" />
            </Button>
          </div>
          <span className="text-sm font-medium text-primary-foreground/90">
            Mulai Bicara
          </span>
        </div>
      </div>
      <VoiceAIModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default VoiceAIHero;
