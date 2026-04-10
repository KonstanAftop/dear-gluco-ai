#!/usr/bin/env python3
"""
DearGluco.ai Diabetes Agent Server Launcher
Starts the LiveKit AI agent for diabetes consultation
"""

import os
import sys
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv()

from livekit.agents import cli
from diabetes_agent import server

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("diabetes_agent.log")
        if not os.getenv("NO_FILE_LOGGING")
        else logging.NullHandler(),
    ],
)

logger = logging.getLogger(__name__)


def check_environment() -> bool:
    required_vars = ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_URL"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        logger.error("Missing required environment variables: %s", ", ".join(missing))
        return False

    return True


def print_agent_info():
    print("\n" + "=" * 60)
    print("  DearGluco.ai Diabetes Consultation Agent")
    print("=" * 60)
    print(f"  Agent Name : diabetes-consultant")
    print(f"  Language   : Indonesian (id)")
    print(f"  Voice      : alloy (OpenAI TTS)")
    print(f"  LiveKit URL: {os.getenv('LIVEKIT_URL', 'not set')}")
    print(f"  AI Service : LiveKit Inference (unified)")
    print("=" * 60)
    print("  Ready to accept diabetes consultation sessions!")
    print("  Ctrl+C to stop the agent")
    print("=" * 60 + "\n")


def main():
    try:
        logger.info("Starting DearGluco.ai Diabetes Agent...")

        if not check_environment():
            sys.exit(1)

        print_agent_info()

        debug = os.getenv("DEBUG", "false").lower() == "true"
        if debug:
            logging.getLogger().setLevel(logging.DEBUG)

        logger.info("Launching LiveKit Agent...")
        cli.run_app(server)

    except KeyboardInterrupt:
        logger.info("Agent shutdown requested by user")
    except Exception as e:
        logger.error("Failed to start agent: %s", e)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
