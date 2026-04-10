/**
 * Consultation Session Component for DearGluco.ai
 *
 * This component handles the active LiveKit consultation session with the AI agent,
 * including audio visualization, chat transcript, and session controls.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Phone,
  MessageCircle,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDiabetesConsultation } from '../../hooks/useDiabetesConsultation';
import { useConnectionState, useSessionInfo } from '../consultation/LiveKitProvider';

/**
 * Audio Waveform Visualization Component
 */
const AudioWaveform = ({ isActive, barCount = 5 }: { isActive: boolean; barCount?: number }) => (
  <div className="flex items-center justify-center gap-1 h-10">
    {Array.from({ length: barCount }).map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full transition-all duration-300 ${
          isActive ? 'bg-teal-light animate-waveform' : 'bg-muted'
        }`}
        style={{
          height: isActive ? `${8 + Math.random() * 16}px` : '4px',
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

/**
 * Session Timer Component
 */
const SessionTimer = ({ duration }: { duration: number }) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

/**
 * Main Consultation Session Component
 */
export default function ConsultationSession() {
  const {
    messages,
    isListening,
    isSpeaking,
    isThinking,
    showTranscript,
    emergencyTriggered,
    endConsultation,
    toggleTranscript,
    toggleMicrophone,
    isMicrophoneEnabled,
    sendChatMessage,
  } = useDiabetesConsultation();

  const { isConnected, isConnecting, hasError, lastError } = useConnectionState();
  const { sessionDuration } = useSessionInfo();

  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const micEnabled = isMicrophoneEnabled();

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (textInput.trim()) {
      sendChatMessage(textInput.trim());
      setTextInput('');
    }
  };

  // Get current agent state for visualization
  const getAgentState = () => {
    if (!isConnected) return 'disconnected';
    if (isThinking) return 'thinking';
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'idle';
  };

  const agentState = getAgentState();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40">
      <div className="w-full max-w-[440px] bg-card rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "95vh" }}>

        {/* Header */}
        <div className="gradient-hero rounded-t-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            } animate-pulse`} />
            <h3 className="text-primary-foreground font-bold text-lg">Konsultasi AI</h3>
          </div>

          <div className="flex items-center gap-2">
            <SessionTimer duration={sessionDuration} />
            <Button
              variant="ghost"
              size="icon"
              onClick={endConsultation}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Emergency Alert */}
        {emergencyTriggered && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <p className="font-medium text-sm">Kondisi Darurat Terdeteksi</p>
                <p className="text-xs mt-1">Segera hubungi 119 atau pergi ke UGD terdekat!</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="flex items-center justify-center gap-2 p-3 bg-muted border-b">
            {isConnecting ? (
              <>
                <Activity className="h-4 w-4 animate-spin text-orange-600" />
                <span className="text-sm text-muted-foreground">Menghubungkan...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">
                  {hasError ? lastError : 'Koneksi Terputus'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Messages / Transcript */}
        {showTranscript && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Konsultasi akan dimulai...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.speaker === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.speaker === 'patient'
                        ? 'bg-navy text-primary-foreground'
                        : message.type === 'emergency'
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : message.type === 'glucose_reading'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-teal-light text-accent-foreground'
                    }`}
                  >
                    {message.content}

                    {/* Timestamp */}
                    <div className={`text-xs mt-1 opacity-70 ${
                      message.speaker === 'patient' ? 'text-primary-foreground' : 'text-current'
                    }`}>
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Agent thinking indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-teal-light text-accent-foreground rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm">Sedang berpikir...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Audio Visualization */}
        {!showTranscript && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <h4 className="text-lg font-medium mb-2">
                {agentState === 'listening' && 'Mendengarkan...'}
                {agentState === 'thinking' && 'Sedang berpikir...'}
                {agentState === 'speaking' && 'AI sedang berbicara...'}
                {agentState === 'idle' && 'Siap mendengarkan'}
                {agentState === 'disconnected' && 'Koneksi terputus'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Bicaralah dengan jelas tentang kondisi Anda
              </p>
            </div>

            <AudioWaveform
              isActive={agentState === 'listening' || agentState === 'speaking'}
              barCount={8}
            />
          </div>
        )}

        {/* Text Input */}
        {showTextInput && (
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pesan..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                autoFocus
              />
              <Button onClick={handleSendText} disabled={!textInput.trim()}>
                Kirim
              </Button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 border-t border-border">
          {/* Chat Toggle */}
          <div className="flex items-center justify-center mb-4">
            <Button
              variant={showTranscript ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (!showTranscript) toggleTranscript();
                setShowTextInput(!showTextInput);
              }}
              className="flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Chat</span>
            </Button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Microphone Control */}
            <div className="relative">
              {(isListening || isSpeaking) && (
                <div className="absolute inset-0 rounded-full bg-orange-vibrant animate-pulse-ring" />
              )}
              <Button
                variant={micEnabled ? "hero" : "outline"}
                size="lg"
                className="relative z-10 rounded-full h-14 w-14 p-0"
                onClick={toggleMicrophone}
                disabled={!isConnected}
              >
                {micEnabled ? (
                  <Mic className="h-6 w-6" />
                ) : (
                  <MicOff className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14 p-0"
              onClick={endConsultation}
            >
              <Phone className="h-6 w-6 transform rotate-180" />
            </Button>
          </div>

          {/* Status Text */}
          <div className="text-center mt-3">
            <span className="text-xs text-muted-foreground">
              {!isConnected && 'Tidak terhubung'}
              {isConnected && micEnabled && (agentState === 'listening' ? 'Mendengarkan...' : 'Ketuk untuk bicara')}
              {isConnected && !micEnabled && 'Mikrofon nonaktif'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}