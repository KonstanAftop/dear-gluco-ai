"""
Configuration module for Diabetes Consultation Agent
Handles environment variables, settings, and feature flags
"""

import os
from typing import Optional, Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class AgentConfig:
    """Agent configuration settings"""

    # LiveKit Configuration
    livekit_api_key: str
    livekit_api_secret: str
    livekit_url: str

    # AI Service Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Agent Settings
    agent_name: str = "diabetes-consultant"
    agent_language: str = "id"  # Indonesian
    agent_voice: str = "alloy"

    # Medical Configuration
    max_session_duration: int = 1800  # 30 minutes
    emergency_glucose_low: float = 54.0
    emergency_glucose_high: float = 300.0
    urgent_glucose_low: float = 70.0
    urgent_glucose_high: float = 250.0

    # Feature Flags
    enable_glucose_monitoring: bool = True
    enable_symptom_analysis: bool = True
    enable_medication_info: bool = True
    enable_emergency_detection: bool = True
    enable_conversation_logging: bool = True

    # Logging and Monitoring
    log_level: str = "INFO"
    enable_prometheus: bool = False
    prometheus_port: int = 8080

    # Medical Compliance
    require_medical_disclaimer: bool = True
    enable_emergency_escalation: bool = True
    conversation_retention_days: int = 90

    # Development Settings
    debug: bool = False

def load_config() -> AgentConfig:
    """Load configuration from environment variables"""

    # Required configuration
    livekit_api_key = os.getenv("LIVEKIT_API_KEY")
    livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_url = os.getenv("LIVEKIT_URL")

    if not all([livekit_api_key, livekit_api_secret, livekit_url]):
        raise ValueError(
            "Missing required LiveKit configuration. Please set LIVEKIT_API_KEY, "
            "LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables."
        )

    # AI Service - require at least one
    openai_api_key = os.getenv("OPENAI_API_KEY")
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

    if not any([openai_api_key, anthropic_api_key]):
        raise ValueError(
            "Missing AI service API key. Please set either OPENAI_API_KEY or ANTHROPIC_API_KEY."
        )

    return AgentConfig(
        # Required LiveKit config
        livekit_api_key=livekit_api_key,
        livekit_api_secret=livekit_api_secret,
        livekit_url=livekit_url,

        # AI service config
        openai_api_key=openai_api_key,
        anthropic_api_key=anthropic_api_key,

        # Agent settings
        agent_name=os.getenv("AGENT_NAME", "diabetes-consultant"),
        agent_language=os.getenv("AGENT_LANGUAGE", "id"),
        agent_voice=os.getenv("AGENT_VOICE", "alloy"),

        # Medical configuration
        max_session_duration=int(os.getenv("MAX_SESSION_DURATION", "1800")),
        emergency_glucose_low=float(os.getenv("EMERGENCY_GLUCOSE_LOW", "54")),
        emergency_glucose_high=float(os.getenv("EMERGENCY_GLUCOSE_HIGH", "300")),
        urgent_glucose_low=float(os.getenv("URGENT_GLUCOSE_LOW", "70")),
        urgent_glucose_high=float(os.getenv("URGENT_GLUCOSE_HIGH", "250")),

        # Feature flags
        enable_glucose_monitoring=os.getenv("ENABLE_GLUCOSE_MONITORING", "true").lower() == "true",
        enable_symptom_analysis=os.getenv("ENABLE_SYMPTOM_ANALYSIS", "true").lower() == "true",
        enable_medication_info=os.getenv("ENABLE_MEDICATION_INFO", "true").lower() == "true",
        enable_emergency_detection=os.getenv("ENABLE_EMERGENCY_DETECTION", "true").lower() == "true",
        enable_conversation_logging=os.getenv("ENABLE_CONVERSATION_LOGGING", "true").lower() == "true",

        # Logging and monitoring
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        enable_prometheus=os.getenv("ENABLE_PROMETHEUS", "false").lower() == "true",
        prometheus_port=int(os.getenv("PROMETHEUS_PORT", "8080")),

        # Medical compliance
        require_medical_disclaimer=os.getenv("REQUIRE_MEDICAL_DISCLAIMER", "true").lower() == "true",
        enable_emergency_escalation=os.getenv("ENABLE_EMERGENCY_ESCALATION", "true").lower() == "true",
        conversation_retention_days=int(os.getenv("CONVERSATION_RETENTION_DAYS", "90")),

        # Development
        debug=os.getenv("DEBUG", "false").lower() == "true",
    )

def get_ai_service_config(config: AgentConfig) -> Dict[str, Any]:
    """Get AI service configuration"""
    if config.openai_api_key:
        return {
            "service": "openai",
            "api_key": config.openai_api_key,
            "model": "gpt-4o-mini",
            "tts_model": "tts-1",
            "stt_model": "whisper-1",
            "voice": config.agent_voice,
            "language": config.agent_language,
        }
    elif config.anthropic_api_key:
        return {
            "service": "anthropic",
            "api_key": config.anthropic_api_key,
            "model": "claude-3-haiku-20240307",
            # Note: Anthropic doesn't have built-in TTS/STT, would need separate services
        }
    else:
        raise ValueError("No AI service configured")

def validate_config(config: AgentConfig) -> bool:
    """Validate configuration settings"""
    errors = []

    # Validate glucose thresholds
    if config.emergency_glucose_low >= config.urgent_glucose_low:
        errors.append("Emergency glucose low threshold must be less than urgent threshold")

    if config.urgent_glucose_high >= config.emergency_glucose_high:
        errors.append("Urgent glucose high threshold must be less than emergency threshold")

    # Validate session duration
    if config.max_session_duration < 300:  # 5 minutes minimum
        errors.append("Maximum session duration must be at least 5 minutes (300 seconds)")

    if config.max_session_duration > 3600:  # 1 hour maximum
        errors.append("Maximum session duration cannot exceed 1 hour (3600 seconds)")

    # Validate retention period
    if config.conversation_retention_days < 1:
        errors.append("Conversation retention days must be at least 1")

    if errors:
        raise ValueError(f"Configuration validation errors: {'; '.join(errors)}")

    return True

# Global configuration instance
try:
    CONFIG = load_config()
    validate_config(CONFIG)
except Exception as e:
    print(f"Configuration error: {e}")
    CONFIG = None