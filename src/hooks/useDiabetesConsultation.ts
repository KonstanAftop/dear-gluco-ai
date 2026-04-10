/**
 * Diabetes Consultation Hook for DearGluco.ai
 *
 * This hook integrates LiveKit consultation sessions with diabetes management features,
 * providing a high-level interface for consultation workflows.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useConsultationSession, useConnectionState, useSessionInfo } from '../components/consultation/LiveKitProvider';
import { createConsultationTokenRequest, TokenRequest } from '../api/livekit-token';
import { DIABETES_CONSULTATION_CONFIG, UI_TEXT, ERROR_MESSAGES } from '../lib/livekit-config';

/**
 * Pre-consultation data collection
 */
export interface PreConsultationData {
  glucoseLevel?: number;
  symptoms: string[];
  medications: string[];
  lastMealTime?: Date;
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  notes?: string;
}

/**
 * Consultation session data
 */
export interface ConsultationSessionData {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  transcript: ConsultationMessage[];
  recommendations: string[];
  followUpRequired: boolean;
  emergencyAlerted: boolean;
  glucoseReadings: Array<{ value: number; timestamp: Date }>;
}

/**
 * Consultation message for transcript
 */
export interface ConsultationMessage {
  id: string;
  timestamp: Date;
  speaker: 'patient' | 'agent';
  content: string;
  type: 'voice' | 'text' | 'glucose_reading' | 'emergency';
  metadata?: Record<string, any>;
}

/**
 * Consultation state
 */
export interface DiabetesConsultationState {
  // Session state
  isActive: boolean;
  isPreparing: boolean;
  isCompleting: boolean;

  // Pre-consultation
  preConsultationData: PreConsultationData;
  isPreConsultationComplete: boolean;

  // Current session
  currentSession: ConsultationSessionData | null;
  messages: ConsultationMessage[];

  // Audio state
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;

  // Medical monitoring
  glucoseAlerts: Array<{ level: number; timestamp: Date; severity: 'low' | 'high' | 'critical' }>;
  emergencyTriggered: boolean;

  // UI state
  showTranscript: boolean;
  showGlucoseInput: boolean;
  currentView: 'preparation' | 'consultation' | 'summary';
}

/**
 * Initial state
 */
const initialState: DiabetesConsultationState = {
  isActive: false,
  isPreparing: false,
  isCompleting: false,
  preConsultationData: {
    symptoms: [],
    medications: [],
    urgencyLevel: 'normal',
  },
  isPreConsultationComplete: false,
  currentSession: null,
  messages: [],
  isListening: false,
  isSpeaking: false,
  isThinking: false,
  glucoseAlerts: [],
  emergencyTriggered: false,
  showTranscript: true,
  showGlucoseInput: false,
  currentView: 'preparation',
};

/**
 * Main diabetes consultation hook
 */
export function useDiabetesConsultation() {
  const [state, setState] = useState<DiabetesConsultationState>(initialState);
  const { state: sessionState, actions: sessionActions, room } = useConsultationSession();
  const { isConnected, isConnecting, hasError, lastError } = useConnectionState();
  const { sessionStartTime, sessionDuration, glucoseLevel } = useSessionInfo();

  const messageIdCounter = useRef(0);

  /**
   * Generate unique message ID
   */
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdCounter.current}`;
  }, []);

  /**
   * Update pre-consultation data
   */
  const updatePreConsultationData = useCallback((data: Partial<PreConsultationData>) => {
    setState(prev => ({
      ...prev,
      preConsultationData: { ...prev.preConsultationData, ...data },
      isPreConsultationComplete: validatePreConsultationData({ ...prev.preConsultationData, ...data }),
    }));
  }, []);

  /**
   * Validate pre-consultation data completeness
   */
  const validatePreConsultationData = useCallback((data: PreConsultationData) => {
    return data.symptoms.length > 0 ||
           data.glucoseLevel !== undefined ||
           data.urgencyLevel === 'emergency';
  }, []);

  /**
   * Start consultation session
   */
  const startConsultation = useCallback(async (participantName: string) => {
    try {
      setState(prev => ({
        ...prev,
        isPreparing: true,
        currentView: 'consultation',
        currentSession: {
          sessionId: `session_${Date.now()}`,
          startTime: new Date(),
          duration: 0,
          transcript: [],
          recommendations: [],
          followUpRequired: false,
          emergencyAlerted: false,
          glucoseReadings: [],
        }
      }));

      // Create token request with medical context
      const tokenRequest = createConsultationTokenRequest(participantName, {
        glucoseLevel: state.preConsultationData.glucoseLevel,
        sessionType: mapUrgencyToSessionType(state.preConsultationData.urgencyLevel),
        symptoms: state.preConsultationData.symptoms,
        medicationList: state.preConsultationData.medications,
        lastMealTime: state.preConsultationData.lastMealTime,
      });

      // Connect to LiveKit session
      await sessionActions.connect(tokenRequest);

      // Send initial medical context to agent
      await sessionActions.sendMedicalData({
        preConsultationData: state.preConsultationData,
        patientName: participantName,
        language: 'indonesian',
      });

      setState(prev => ({
        ...prev,
        isPreparing: false,
        isActive: true,
        messages: [
          {
            id: generateMessageId(),
            timestamp: new Date(),
            speaker: 'agent',
            content: `Selamat datang ${participantName}. Saya adalah asisten AI diabetes Anda. Mari kita mulai konsultasi.`,
            type: 'voice',
          }
        ]
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isPreparing: false,
        currentView: 'preparation',
      }));
      throw error;
    }
  }, [state.preConsultationData, sessionActions, generateMessageId]);

  /**
   * End consultation session
   */
  const endConsultation = useCallback(async () => {
    setState(prev => ({ ...prev, isCompleting: true }));

    try {
      const sessionData = state.currentSession;
      if (sessionData) {
        sessionData.endTime = new Date();
        sessionData.duration = sessionDuration;
      }

      await sessionActions.disconnect();
    } catch (error) {
      console.error('Error ending consultation:', error);
    } finally {
      setState(prev => ({
        ...prev,
        isActive: false,
        isCompleting: false,
        currentView: 'preparation',
      }));
    }
  }, [state.currentSession, sessionDuration, sessionActions]);

  /**
   * Add message to transcript (local state only)
   */
  const addMessage = useCallback((speaker: 'patient' | 'agent', content: string, type: ConsultationMessage['type'] = 'voice') => {
    const message: ConsultationMessage = {
      id: generateMessageId(),
      timestamp: new Date(),
      speaker,
      content,
      type,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        transcript: [...prev.currentSession.transcript, message],
      } : prev.currentSession,
    }));
  }, [generateMessageId]);

  /**
   * Send a chat text message to the AI agent via LiveKit data channel
   */
  const sendChatMessage = useCallback(async (content: string) => {
    addMessage('patient', content, 'text');

    await sessionActions.sendMedicalData({
      type: 'chat_message',
      content,
    });
  }, [addMessage, sessionActions]);

  /**
   * Handle glucose reading during consultation
   */
  const addGlucoseReading = useCallback(async (level: number) => {
    const timestamp = new Date();
    const severity = evaluateGlucoseLevel(level);

    // Update session glucose readings
    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        glucoseReadings: [...prev.currentSession.glucoseReadings, { value: level, timestamp }],
      } : prev.currentSession,
    }));

    // Add glucose alert if needed
    if (severity !== 'normal') {
      setState(prev => ({
        ...prev,
        glucoseAlerts: [...prev.glucoseAlerts, { level, timestamp, severity }],
      }));
    }

    // Send to AI agent
    await sessionActions.sendMedicalData({
      type: 'glucose_reading',
      level,
      timestamp: timestamp.toISOString(),
      severity,
    });

    // Update LiveKit session
    sessionActions.updateGlucoseLevel(level);

    // Add to message transcript
    addMessage('patient', `Kadar gula darah: ${level} mg/dL`, 'glucose_reading');

    // Handle emergency levels
    if (severity === 'critical') {
      setState(prev => ({ ...prev, emergencyTriggered: true }));
      addMessage('agent', 'PERHATIAN: Kadar gula darah Anda berada dalam level berbahaya. Segera hubungi dokter atau layanan darurat!', 'emergency');
    }
  }, [sessionActions, addMessage]);

  /**
   * Toggle transcript visibility
   */
  const toggleTranscript = useCallback(() => {
    setState(prev => ({ ...prev, showTranscript: !prev.showTranscript }));
  }, []);

  /**
   * Toggle glucose input
   */
  const toggleGlucoseInput = useCallback(() => {
    setState(prev => ({ ...prev, showGlucoseInput: !prev.showGlucoseInput }));
  }, []);

  /**
   * Reset consultation state
   */
  const resetConsultation = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Handle agent messages from LiveKit
   */
  const handleAgentMessage = useCallback((message: string) => {
    addMessage('agent', message, 'voice');

    // Parse for recommendations or alerts
    if (message.toLowerCase().includes('rekomendasi') || message.toLowerCase().includes('saran')) {
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          recommendations: [...prev.currentSession.recommendations, message],
        } : prev.currentSession,
      }));
    }
  }, [addMessage]);

  /**
   * Listen for session state changes.
   * Resetting currentView here ensures every hook instance (parent + child)
   * returns to the preparation screen when the connection drops.
   */
  useEffect(() => {
    if (isConnected && !state.isActive) {
      setState(prev => ({ ...prev, isActive: true, isPreparing: false }));
    }

    if (!isConnected && state.isActive) {
      setState(prev => ({
        ...prev,
        isActive: false,
        isCompleting: false,
        currentView: 'preparation',
      }));
    }
  }, [isConnected, state.isActive]);

  /**
   * Listen for agent messages arriving via the LiveKit data channel
   */
  useEffect(() => {
    if (!room) return;

    const handleData = (data: Uint8Array) => {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(data));
        if (parsed.type === 'agent_message' && parsed.content) {
          addMessage('agent', parsed.content, 'text');
        }
      } catch {
        // ignore non-JSON payloads
      }
    };

    room.on('dataReceived', handleData);
    return () => { room.off('dataReceived', handleData); };
  }, [room, addMessage]);

  return {
    // State
    ...state,

    // Connection state
    isConnected,
    isConnecting,
    hasError,
    lastError,

    // Session info
    sessionStartTime,
    sessionDuration,
    currentGlucoseLevel: glucoseLevel,

    // Actions
    updatePreConsultationData,
    startConsultation,
    endConsultation,
    addMessage,
    sendChatMessage,
    addGlucoseReading,
    toggleTranscript,
    toggleGlucoseInput,
    resetConsultation,

    // Audio controls
    toggleMicrophone: sessionActions.toggleMicrophone,
    setMicrophoneEnabled: sessionActions.setMicrophoneEnabled,
    isMicrophoneEnabled: sessionActions.isMicrophoneEnabled,

    // Internal handlers
    handleAgentMessage,
  };
}

/**
 * Map urgency level to session type
 */
function mapUrgencyToSessionType(urgency: 'normal' | 'urgent' | 'emergency') {
  switch (urgency) {
    case 'emergency':
      return 'emergency';
    case 'urgent':
      return 'consultation';
    default:
      return 'consultation';
  }
}

/**
 * Evaluate glucose level severity
 */
function evaluateGlucoseLevel(level: number): 'low' | 'normal' | 'high' | 'critical' {
  if (level < 70) {
    return level < 54 ? 'critical' : 'low';
  } else if (level > 180) {
    return level > 300 ? 'critical' : 'high';
  }
  return 'normal';
}

/**
 * Hook for consultation history management
 */
export function useConsultationHistory() {
  const [history, setHistory] = useState<ConsultationSessionData[]>([]);

  const addToHistory = useCallback((session: ConsultationSessionData) => {
    setHistory(prev => [session, ...prev]);
  }, []);

  const getRecentSessions = useCallback((count: number = 5) => {
    return history.slice(0, count);
  }, [history]);

  const searchHistory = useCallback((query: string) => {
    return history.filter(session =>
      session.transcript.some(msg =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [history]);

  return {
    history,
    addToHistory,
    getRecentSessions,
    searchHistory,
  };
}