/**
 * LiveKit Configuration for DearGluco.ai Diabetes Consultation
 *
 * This configuration defines how the LiveKit agent sessions work
 * within the diabetes management application context.
 */

export interface DiabetesConsultationConfig {
  // Agent Configuration
  agentName: string;

  // UI Configuration
  pageTitle: string;
  pageDescription: string;

  // Feature Toggles
  supportsChatInput: boolean;        // Allow text input for glucose readings
  supportsVideoInput: boolean;       // Camera access (disabled for privacy)
  supportsScreenShare: boolean;      // Screen sharing (not needed)
  isPreConnectBufferEnabled: boolean; // Loading state management

  // Audio Visualization
  audioVisualizerType: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor: string;      // Match app theme colors
  audioVisualizerBarCount: number;   // Number of bars for visualization

  // Session Configuration
  maxSessionDuration: number;        // Max consultation time in minutes
  enableSessionRecording: boolean;   // Record consultations for history
  autoDisconnectOnInactivity: number; // Minutes of inactivity before disconnect

  // Medical Configuration
  emergencyContactEnabled: boolean;   // Quick access to emergency services
  glucoseLevelInputEnabled: boolean;  // Pre-consultation glucose input
  medicationReminderIntegration: boolean; // Connect with existing reminders
}

export const DIABETES_CONSULTATION_CONFIG: DiabetesConsultationConfig = {
  // Agent Configuration
  agentName: 'diabetes-consultant',

  // UI Configuration
  pageTitle: 'DearGluco.ai - Konsultasi AI',
  pageDescription: 'Konsultasi diabetes real-time dengan AI assistant',

  // Feature Toggles
  supportsChatInput: true,           // Allow glucose readings and text input
  supportsVideoInput: false,         // Voice-only for privacy and mobile battery
  supportsScreenShare: false,        // Not needed for medical consultation
  isPreConnectBufferEnabled: true,   // Show loading state during connection

  // Audio Visualization - Match app's teal theme
  audioVisualizerType: 'wave',       // Calming wave animation
  audioVisualizerColor: '#059669',   // Teal-600 from app theme
  audioVisualizerBarCount: 5,        // Mobile-optimized bar count

  // Session Configuration
  maxSessionDuration: 30,            // 30 minutes max per consultation
  enableSessionRecording: true,      // Save for patient history
  autoDisconnectOnInactivity: 10,    // 10 minutes inactivity timeout

  // Medical Configuration
  emergencyContactEnabled: true,      // Quick emergency access
  glucoseLevelInputEnabled: true,     // Pre-consultation glucose input
  medicationReminderIntegration: true, // Connect with existing reminder system
};

/**
 * LiveKit Room Configuration
 * Based on agent-starter-react patterns
 */
export const ROOM_CONFIG = {
  // Audio settings optimized for voice consultation
  audio: {
    autoSubscribe: true,
    publishDefaults: {
      audioBitrate: 64000,  // Good quality for voice
      dtx: true,            // Discontinuous transmission for battery
      red: true,            // Redundancy for reliability
    },
  },

  // Video disabled for privacy and performance
  video: {
    autoSubscribe: false,
  },

  // Adaptive stream settings for mobile
  adaptiveStream: {
    pixelDensity: 'screen', // Match device pixel density
  },

  // Disconnection settings
  autoManageVideo: false,   // Manual video control
  dynacast: true,          // Adaptive bitrate
};

/**
 * Error Messages in Indonesian
 */
export const ERROR_MESSAGES = {
  connectionFailed: 'Koneksi gagal. Periksa jaringan internet Anda.',
  microphonePermission: 'Akses mikrofon diperlukan untuk konsultasi suara.',
  agentUnavailable: 'AI konsultan sedang tidak tersedia. Coba lagi nanti.',
  sessionTimeout: 'Sesi konsultasi telah berakhir karena tidak aktif.',
  networkError: 'Koneksi jaringan bermasalah. Mencoba menghubungkan ulang...',
  unknownError: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.',
};

/**
 * UI Text in Indonesian
 */
export const UI_TEXT = {
  connecting: 'Menghubungkan...',
  connected: 'Terhubung',
  listening: 'Mendengarkan...',
  thinking: 'Berpikir...',
  speaking: 'Berbicara...',
  disconnected: 'Terputus',
  startConsultation: 'Mulai Konsultasi',
  endConsultation: 'Akhiri Konsultation',
  enterGlucoseLevel: 'Masukkan kadar gula darah (mg/dL)',
  emergency: 'Darurat',
  microphoneOn: 'Mikrofon Aktif',
  microphoneOff: 'Mikrofon Nonaktif',
};