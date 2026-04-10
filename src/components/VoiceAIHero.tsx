import { useState } from "react";
import { Mic, MicOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveKitProvider } from "./consultation/LiveKitProvider";
import { useDiabetesConsultation } from "../hooks/useDiabetesConsultation";
import ConsultationSession from "./consultation/ConsultationSession";
import PreConsultationForm from "./consultation/PreConsultationForm";

const VoiceAIHeroContent = () => {
  const [showPreConsultation, setShowPreConsultation] = useState(false);
  const {
    isActive,
    isPreparing,
    isConnected,
    isConnecting,
    currentView,
    startConsultation,
    isPreConsultationComplete,
  } = useDiabetesConsultation();

  const handleStartConsultation = () => {
    if (isActive) {
      // Session is already active, show the consultation interface
      return;
    }
    setShowPreConsultation(true);
  };

  const handleStartActualConsultation = async (participantName: string) => {
    try {
      await startConsultation(participantName);
      setShowPreConsultation(false);
    } catch (error) {
      console.error('Failed to start consultation:', error);
      // Error handling is managed by the hook
    }
  };

  // Show consultation session if active
  if (isActive || currentView === 'consultation') {
    return <ConsultationSession />;
  }

  // Show pre-consultation form
  if (showPreConsultation) {
    return (
      <PreConsultationForm
        onStart={handleStartActualConsultation}
        onCancel={() => setShowPreConsultation(false)}
        isStarting={isPreparing || isConnecting}
      />
    );
  }

  // Default hero view
  return (
    <>
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground animate-fade-in">
        <h2 className="text-lg font-bold mb-1">Asisten Kesehatan AI</h2>
        <p className="text-primary-foreground/80 text-sm mb-6">
          Konsultasi real-time tentang diabetes Anda
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Animated ring for visual appeal */}
            <div className="absolute inset-0 rounded-full bg-orange-vibrant animate-pulse-ring" />
            <Button
              variant="hero"
              size="lg"
              className="relative z-10 rounded-full h-16 w-16 p-0"
              onClick={handleStartConsultation}
              disabled={isPreparing || isConnecting}
            >
              {isPreparing || isConnecting ? (
                <Activity className="h-7 w-7 animate-spin" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </Button>
          </div>
          <span className="text-sm font-medium text-primary-foreground/90">
            {isPreparing || isConnecting ? "Mempersiapkan..." : "Mulai Konsultasi"}
          </span>
        </div>

        {/* Connection status indicator */}
        {isConnected && (
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-primary-foreground/70">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Terhubung dengan AI Konsultan</span>
          </div>
        )}
      </div>
    </>
  );
};

const VoiceAIHero = () => {
  return (
    <LiveKitProvider
      onSessionStart={(roomName) => {
        console.log('Consultation session started:', roomName);
      }}
      onSessionEnd={(duration) => {
        console.log('Consultation session ended, duration:', duration, 'seconds');
      }}
      onError={(error) => {
        console.error('Consultation error:', error);
        // Could show toast notification here
      }}
      onAgentMessage={(message) => {
        console.log('Agent message:', message);
      }}
    >
      <VoiceAIHeroContent />
    </LiveKitProvider>
  );
};

export default VoiceAIHero;
