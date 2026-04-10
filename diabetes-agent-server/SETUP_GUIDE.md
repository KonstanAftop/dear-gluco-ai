# DearGluco.ai Diabetes Agent - Setup Guide

## Issue Resolution Summary

### Problem
The original code was using an outdated LiveKit Agents API:
- `from livekit.agents.voice_assistant import VoiceAssistant` - This module no longer exists
- Python 3.14 compatibility issues with pydantic-core

### Solution Applied

1. **Python Version**: Created virtual environment with Python 3.13 (compatible with all dependencies)

2. **Dependencies Updated**:
   - Added `livekit-plugins-openai>=0.8.0`
   - Added `livekit-plugins-silero>=0.8.0`
   - Upgraded `livekit-agents` to version 1.5.2

3. **Code Changes**:
   - Changed import from `livekit.agents.voice_assistant` to `livekit.agents.voice`
   - Replaced `VoiceAssistant` class with `voice.Agent`
   - Updated the agent initialization and usage pattern
   - Modified the entrypoint function to use the new API

## Setup Instructions

### 1. Prerequisites
- Python 3.13 (recommended) or Python 3.11-3.13
- pip package manager

### 2. Installation

```bash
# Navigate to the diabetes-agent-server directory
cd diabetes-agent-server

# Create virtual environment with Python 3.13
python3.13 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

Create a `.env` file in the `diabetes-agent-server` directory with the following variables:

```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Agent Configuration (optional)
AGENT_NAME=diabetes-consultant
LANGUAGE=id
VOICE=alloy
MAX_SESSION_DURATION=1800
DEBUG=false
```

### 4. Running the Agent

```bash
# Activate virtual environment (if not already activated)
source venv/bin/activate

# Run the agent
python run_agent.py start

# Or run in development mode with auto-reload
python run_agent.py dev

# Or run in console mode for testing
python run_agent.py console
```

### 5. Available Commands

- `python run_agent.py start` - Start the agent in production mode
- `python run_agent.py dev` - Start in development mode with auto-reload
- `python run_agent.py console` - Run in console mode for testing
- `python run_agent.py --help` - Show all available commands

## Testing the Agent

1. Start the agent using one of the commands above
2. Connect to the LiveKit room using the frontend application
3. The agent will greet you in Indonesian and be ready to assist with diabetes consultations

## Key Features

- **Indonesian Language Support**: Uses OpenAI Whisper for Indonesian speech-to-text
- **Medical Knowledge**: Includes glucose assessment, symptom evaluation, and medication information
- **Emergency Detection**: Automatically detects and responds to emergency conditions
- **Real-time Voice Interaction**: Uses OpenAI TTS for natural voice responses

## Troubleshooting

### Import Errors
If you see `ModuleNotFoundError`, ensure:
- Virtual environment is activated
- All dependencies are installed: `pip install -r requirements.txt`

### Python Version Issues
If you encounter build errors:
- Use Python 3.13 or 3.12 (not 3.14)
- Recreate the virtual environment with the correct Python version

### LiveKit Connection Issues
- Verify your LiveKit credentials in `.env`
- Check that the LiveKit URL is correct
- Ensure your LiveKit project is active

## API Changes Reference

### Old API (v1.2.x)
```python
from livekit.agents.voice_assistant import VoiceAssistant

assistant = VoiceAssistant(
    llm=openai_model,
    stt=openai_stt,
    tts=openai_tts,
    chat_ctx=initial_ctx,
)
```

### New API (v1.5.x)
```python
from livekit.agents import voice

agent = voice.Agent(
    llm=openai_model,
    stt=openai_stt,
    tts=openai_tts,
    chat_ctx=initial_ctx,
)
```

## Additional Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit Python SDK](https://github.com/livekit/python-sdks)
- [OpenAI API Documentation](https://platform.openai.com/docs)
