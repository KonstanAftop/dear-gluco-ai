/**
 * LiveKit Provider for DearGluco.ai Diabetes Consultation
 *
 * This component provides LiveKit session context to consultation components,
 * handling connection, disconnection, and session state management.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  ConnectionState,
  Participant,
  Track,
  RemoteTrack,
  LocalTrack,
} from 'livekit-client';
// RoomAudioRenderer not needed - Room handles audio automatically
import { DIABETES_CONSULTATION_CONFIG, ROOM_CONFIG, ERROR_MESSAGES, UI_TEXT } from '../../lib/livekit-config';
import {
  getConsultationToken,
  createConsultationTokenRequest,
  validateTokenRequest,
  TokenRequest,
  TokenResponse,
} from '../../api/livekit-token';

/**
 * Session state for diabetes consultation
 */
export interface ConsultationSessionState {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;

  // Participants
  localParticipant: Participant | null;
  remoteParticipants: Participant[];
  agentParticipant: Participant | null;

  // Audio tracks
  localAudioTrack: LocalTrack | null;
  agentAudioTrack: RemoteTrack | null;

  // Session metadata
  roomName: string | null;
  sessionStartTime: Date | null;
  sessionDuration: number; // in seconds

  // Medical context
  glucoseLevel: number | null;
  sessionType: 'consultation' | 'emergency' | 'followup';

  // Error handling
  lastError: string | null;
  hasError: boolean;
}

/**
 * Session actions for controlling the consultation
 */
export interface ConsultationSessionActions {
  // Connection management
  connect: (tokenRequest: TokenRequest) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;

  // Audio controls
  toggleMicrophone: () => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  isMicrophoneEnabled: () => boolean;

  // Medical data
  updateGlucoseLevel: (level: number) => void;
  sendMedicalData: (data: Record<string, any>) => Promise<void>;

  // Error handling
  clearError: () => void;
}

/**
 * Complete consultation session context
 */
export interface ConsultationSessionContext {
  state: ConsultationSessionState;
  actions: ConsultationSessionActions;
  room: Room | null;
}

const ConsultationContext = createContext<ConsultationSessionContext | null>(null);

/**
 * Initial session state
 */
const initialState: ConsultationSessionState = {
  connectionState: ConnectionState.Disconnected,
  isConnected: false,
  isConnecting: false,
  localParticipant: null,
  remoteParticipants: [],
  agentParticipant: null,
  localAudioTrack: null,
  agentAudioTrack: null,
  roomName: null,
  sessionStartTime: null,
  sessionDuration: 0,
  glucoseLevel: null,
  sessionType: 'consultation',
  lastError: null,
  hasError: false,
};

/**
 * Props for the LiveKit provider
 */
export interface LiveKitProviderProps {
  children: React.ReactNode;
  onSessionStart?: (roomName: string) => void;
  onSessionEnd?: (duration: number) => void;
  onError?: (error: string) => void;
  onAgentMessage?: (message: string) => void;
}

/**
 * Main LiveKit Provider Component
 */
export function LiveKitProvider({
  children,
  onSessionStart,
  onSessionEnd,
  onError,
  onAgentMessage
}: LiveKitProviderProps) {
  const [state, setState] = useState<ConsultationSessionState>(initialState);
  const [room, setRoom] = useState<Room | null>(null);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);

  /**
   * Update session duration timer
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.sessionStartTime && state.isConnected) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - state.sessionStartTime!.getTime()) / 1000);

        setState(prev => ({ ...prev, sessionDuration: duration }));

        // Auto-disconnect after max duration
        if (duration >= DIABETES_CONSULTATION_CONFIG.maxSessionDuration * 60) {
          disconnect();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.sessionStartTime, state.isConnected]);

  /**
   * Handle room events
   */
  const setupRoomEventListeners = useCallback((room: Room) => {
    room.on(RoomEvent.Connected, () => {
      const ts = new Date().toISOString();
      console.log(`[DIAG ${ts}] ✅ Connected to consultation room`);
      console.log(`[DIAG ${ts}] Room name:`, room.name);
      console.log(`[DIAG ${ts}] Local participant:`, room.localParticipant.identity);
      console.log(`[DIAG ${ts}] Remote participants count:`, room.remoteParticipants.size);
      
      setState(prev => {
        const newState = {
          ...prev,
          connectionState: ConnectionState.Connected,
          isConnected: true,
          isConnecting: false,
          sessionStartTime: new Date(),
          localParticipant: room.localParticipant,
        };

        if (onSessionStart && prev.roomName) {
          onSessionStart(prev.roomName);
        }

        return newState;
      });
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from consultation room');
      const duration = state.sessionDuration;

      setState(prev => ({
        ...prev,
        connectionState: ConnectionState.Disconnected,
        isConnected: false,
        isConnecting: false,
        localParticipant: null,
        remoteParticipants: [],
        agentParticipant: null,
      }));

      if (onSessionEnd && duration > 0) {
        onSessionEnd(duration);
      }
    });

    room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      const ts = new Date().toISOString();
      console.log(`[DIAG ${ts}] 🤖 Participant connected:`, participant.identity);
      console.log(`[DIAG ${ts}] Participant name:`, participant.name);
      console.log(`[DIAG ${ts}] Is agent:`, participant.identity.includes('agent'));

      setState(prev => ({
        ...prev,
        remoteParticipants: [...prev.remoteParticipants, participant],
        // Assume the first remote participant is the AI agent
        agentParticipant: prev.agentParticipant || participant,
      }));
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
      console.log('Participant disconnected:', participant.identity);

      setState(prev => ({
        ...prev,
        remoteParticipants: prev.remoteParticipants.filter(p => p !== participant),
        agentParticipant: prev.agentParticipant === participant ? null : prev.agentParticipant,
      }));
    });

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: Participant) => {
      if (track.kind === Track.Kind.Audio) {
        const ts = new Date().toISOString();
        console.log(`[DIAG ${ts}] 🔊 Agent audio track subscribed from:`, participant.identity);
        console.log(`[DIAG ${ts}] Track SID:`, track.sid);
        console.log(`[DIAG ${ts}] Track source:`, track.source);
        
        // Attach audio track to an audio element for playback
        const audioElement = track.attach();
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioElement.volume = 1.0;
        audioElement.id = 'agent-audio-track';
        document.body.appendChild(audioElement);
        
        console.log('✅ Agent audio element attached and playing');
        console.log('Audio element:', audioElement);
        
        // Log when audio starts playing
        audioElement.addEventListener('play', () => {
          console.log('🎵 Audio playback started');
        });
        
        audioElement.addEventListener('error', (e) => {
          console.error('❌ Audio playback error:', e);
        });
        
        setState(prev => ({
          ...prev,
          agentAudioTrack: track,
        }));
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication, participant: Participant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('Agent audio track unsubscribed');
        
        // Remove audio element
        const audioElement = document.getElementById('agent-audio-track');
        if (audioElement) {
          audioElement.remove();
        }
        
        setState(prev => ({
          ...prev,
          agentAudioTrack: null,
        }));
      }
    });

    room.on(RoomEvent.DataReceived, (data: Uint8Array, participant?: Participant) => {
      const ts = new Date().toISOString();
      try {
        const message = new TextDecoder().decode(data);
        const parsed = JSON.parse(message);
        console.log(`[DIAG ${ts}] 📨 DataReceived from:`, participant?.identity ?? 'unknown', 'type:', parsed.type);

        if (parsed.type === 'agent_message' && onAgentMessage) {
          console.log(`[DIAG ${ts}] 📨 agent_message content:`, parsed.content?.substring(0, 80));
          onAgentMessage(parsed.content);
        }
      } catch (error) {
        console.error(`[DIAG ${ts}] Error parsing agent data:`, error);
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (connectionState: ConnectionState) => {
      setState(prev => ({
        ...prev,
        connectionState,
        isConnecting: connectionState === ConnectionState.Connecting,
      }));
    });

    // Error handling
    room.on(RoomEvent.Disconnected, (reason) => {
      if (reason) {
        const errorMessage = ERROR_MESSAGES.networkError;
        setState(prev => ({
          ...prev,
          lastError: errorMessage,
          hasError: true,
        }));

        if (onError) {
          onError(errorMessage);
        }
      }
    });
  }, [onSessionStart, onSessionEnd, onError, onAgentMessage, state.sessionDuration]);

  /**
   * Connect to LiveKit room
   */
  const connect = useCallback(async (tokenRequest: TokenRequest) => {
    try {
      // Validate token request
      const validation = validateTokenRequest(tokenRequest);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      setState(prev => ({
        ...prev,
        isConnecting: true,
        lastError: null,
        hasError: false,
        glucoseLevel: tokenRequest.glucoseLevel || null,
        sessionType: tokenRequest.sessionType || 'consultation',
      }));

      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the test stream, Room will create its own
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
      } catch (permError) {
        throw new Error(ERROR_MESSAGES.microphonePermission);
      }

      // Get access token
      const tokenResponse = await getConsultationToken(tokenRequest);
      setTokenData(tokenResponse);

      // Create and configure room
      const newRoom = new Room(ROOM_CONFIG);
      setupRoomEventListeners(newRoom);

      // Connect to room
      await newRoom.connect(tokenResponse.url, tokenResponse.accessToken, {
        autoSubscribe: true,
      });

      console.log('Connected to room:', tokenResponse.roomName);

      // Enable microphone after connection
      try {
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        console.log('Microphone enabled');
      } catch (micError) {
        console.warn('Failed to enable microphone:', micError);
      }

      setRoom(newRoom);
      setState(prev => ({
        ...prev,
        roomName: tokenResponse.roomName,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.connectionFailed;

      setState(prev => ({
        ...prev,
        isConnecting: false,
        lastError: errorMessage,
        hasError: true,
      }));

      if (onError) {
        onError(errorMessage);
      }

      throw error;
    }
  }, [setupRoomEventListeners, onError]);

  /**
   * Disconnect from room
   */
  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setTokenData(null);

      setState(prev => ({
        ...initialState,
        sessionDuration: prev.sessionDuration, // Keep duration for reporting
      }));
    }
  }, [room]);

  /**
   * Reconnect to room
   */
  const reconnect = useCallback(async () => {
    if (tokenData) {
      await disconnect();
      // Recreate token request from stored data
      const tokenRequest = createConsultationTokenRequest(
        tokenData.participantInfo.name,
        {
          glucoseLevel: state.glucoseLevel || undefined,
          sessionType: state.sessionType,
        }
      );
      await connect(tokenRequest);
    }
  }, [tokenData, state.glucoseLevel, state.sessionType, disconnect, connect]);

  /**
   * Toggle microphone
   */
  const toggleMicrophone = useCallback(async () => {
    if (room && room.localParticipant) {
      const currentState = await room.localParticipant.isMicrophoneEnabled();
      await room.localParticipant.setMicrophoneEnabled(!currentState);
      console.log('Microphone toggled to:', !currentState);
    }
  }, [room]);

  /**
   * Set microphone enabled/disabled
   */
  const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
    if (room && room.localParticipant) {
      await room.localParticipant.setMicrophoneEnabled(enabled);
      console.log('Microphone set to:', enabled);
    }
  }, [room]);

  /**
   * Check if microphone is enabled
   */
  const isMicrophoneEnabled = useCallback(() => {
    if (room && room.localParticipant) {
      const audioPublication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      return audioPublication ? !audioPublication.isMuted : false;
    }
    return false;
  }, [room]);

  /**
   * Update glucose level during session
   */
  const updateGlucoseLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, glucoseLevel: level }));
  }, []);

  /**
   * Send medical data to the AI agent
   */
  const sendMedicalData = useCallback(async (data: Record<string, any>) => {
    if (room) {
      const message = {
        type: 'medical_data',
        data,
        timestamp: new Date().toISOString(),
      };

      const encoder = new TextEncoder();
      await room.localParticipant?.publishData(encoder.encode(JSON.stringify(message)));
    }
  }, [room]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastError: null,
      hasError: false,
    }));
  }, []);

  // Actions object
  const actions: ConsultationSessionActions = {
    connect,
    disconnect,
    reconnect,
    toggleMicrophone,
    setMicrophoneEnabled,
    isMicrophoneEnabled,
    updateGlucoseLevel,
    sendMedicalData,
    clearError,
  };

  // Context value
  const contextValue: ConsultationSessionContext = {
    state,
    actions,
    room,
  };

  return (
    <ConsultationContext.Provider value={contextValue}>
      {/* Audio is automatically handled by the Room object */}
      {children}
    </ConsultationContext.Provider>
  );
}

/**
 * Hook to use the consultation session context
 */
export function useConsultationSession() {
  const context = useContext(ConsultationContext);

  if (!context) {
    throw new Error('useConsultationSession must be used within a LiveKitProvider');
  }

  return context;
}

/**
 * Hook to get current connection state
 */
export function useConnectionState() {
  const { state } = useConsultationSession();
  return {
    connectionState: state.connectionState,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    hasError: state.hasError,
    lastError: state.lastError,
  };
}

/**
 * Hook to get session info
 */
export function useSessionInfo() {
  const { state } = useConsultationSession();
  return {
    roomName: state.roomName,
    sessionStartTime: state.sessionStartTime,
    sessionDuration: state.sessionDuration,
    glucoseLevel: state.glucoseLevel,
    sessionType: state.sessionType,
  };
}