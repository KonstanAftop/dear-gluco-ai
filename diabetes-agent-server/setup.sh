#!/bin/bash

# DearGluco.ai Diabetes Agent Setup Script
# This script helps set up the development environment

set -e

echo "🩺 DearGluco.ai Diabetes Agent Setup"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.11+ is installed
check_python() {
    print_status "Checking Python installation..."

    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11 or later."
        exit 1
    fi

    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    REQUIRED_VERSION="3.11"

    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_status "Python $PYTHON_VERSION is installed ✓"
    else
        print_error "Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION or later is required"
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    print_status "Checking pip installation..."

    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip."
        exit 1
    fi

    print_status "pip is installed ✓"
}

# Create virtual environment
setup_venv() {
    print_status "Setting up Python virtual environment..."

    if [ ! -d "venv" ]; then
        python3.13 -m venv venv
        print_status "Virtual environment created ✓"
    else
        print_status "Virtual environment already exists ✓"
    fi

    # Activate virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated ✓"

    # Upgrade pip
    pip install --upgrade pip
    print_status "pip upgraded ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."

    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_status "Dependencies installed ✓"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_status "Setting up environment configuration..."

    if [ ! -f ".env" ]; then
        # Create .env from template if it doesn't exist
        cat > .env << 'EOF'
# LiveKit Configuration (REQUIRED)
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud

# AI Service Configuration (choose one)
OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Agent Configuration
AGENT_NAME=diabetes-consultant
AGENT_LANGUAGE=id
AGENT_VOICE=alloy

# Medical Configuration
MAX_SESSION_DURATION=1800
EMERGENCY_GLUCOSE_LOW=54
EMERGENCY_GLUCOSE_HIGH=300
URGENT_GLUCOSE_LOW=70
URGENT_GLUCOSE_HIGH=250

# Logging
LOG_LEVEL=INFO
DEBUG=false
ENABLE_CONVERSATION_LOGGING=true

# Medical Compliance
REQUIRE_MEDICAL_DISCLAIMER=true
ENABLE_EMERGENCY_ESCALATION=true
CONVERSATION_RETENTION_DAYS=90
EOF
        print_warning ".env file created with template values"
        print_warning "Please edit .env and add your actual API keys"
    else
        print_status ".env file already exists ✓"
    fi
}

# Make scripts executable
setup_scripts() {
    print_status "Making scripts executable..."

    chmod +x run_agent.py
    chmod +x setup.sh

    print_status "Scripts are now executable ✓"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."

    # Source the .env file
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    fi

    # Check required variables
    missing_vars=()

    if [ -z "$LIVEKIT_API_KEY" ] || [ "$LIVEKIT_API_KEY" = "your_livekit_api_key_here" ]; then
        missing_vars+=("LIVEKIT_API_KEY")
    fi

    if [ -z "$LIVEKIT_API_SECRET" ] || [ "$LIVEKIT_API_SECRET" = "your_livekit_api_secret_here" ]; then
        missing_vars+=("LIVEKIT_API_SECRET")
    fi

    if [ -z "$LIVEKIT_URL" ] || [ "$LIVEKIT_URL" = "wss://your-project.livekit.cloud" ]; then
        missing_vars+=("LIVEKIT_URL")
    fi

    if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
        missing_vars+=("OPENAI_API_KEY or ANTHROPIC_API_KEY")
    fi

    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_warning "The following environment variables need to be configured:"
        for var in "${missing_vars[@]}"; do
            print_warning "  - $var"
        done
        print_warning "Please edit .env file with your actual values"
        return 1
    else
        print_status "All required environment variables are configured ✓"
        return 0
    fi
}

# Run tests
run_tests() {
    print_status "Running configuration tests..."

    python3 -c "
try:
    from config import load_config, validate_config
    config = load_config()
    validate_config(config)
    print('✓ Configuration is valid')
except Exception as e:
    print(f'✗ Configuration error: {e}')
    exit(1)
"
}

# Print usage instructions
print_usage() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your actual API keys"
    echo "2. Run the agent: python3 run_agent.py"
    echo "3. Or use Docker: docker-compose up"
    echo ""
    echo "Development commands:"
    echo "  python3 run_agent.py          - Start the agent"
    echo "  docker-compose up             - Run with Docker"
    echo "  docker-compose up -d          - Run in background"
    echo "  docker-compose logs -f        - View logs"
    echo "  docker-compose down           - Stop services"
    echo ""
    echo "For monitoring (optional):"
    echo "  docker-compose --profile monitoring up"
    echo ""
}

# Main setup process
main() {
    echo ""
    print_status "Starting setup process..."
    echo ""

    check_python
    check_pip
    setup_venv
    install_dependencies
    setup_env
    setup_scripts

    # Test configuration (non-blocking)
    if check_env_vars; then
        run_tests
    else
        print_warning "Skipping configuration tests due to missing environment variables"
    fi

    print_usage
}

# Run main function
main