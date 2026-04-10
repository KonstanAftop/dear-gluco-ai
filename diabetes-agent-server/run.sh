#!/bin/bash

# DearGluco.ai Diabetes Agent Runner Script
# This script helps you easily run the diabetes consultation agent

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🩺 DearGluco.ai Diabetes Agent Runner"
echo "======================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Virtual environment not found!${NC}"
    echo "Please run the following commands first:"
    echo "  python3.13 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo "Please create a .env file with your configuration."
    echo "See SETUP_GUIDE.md for details."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if activation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to activate virtual environment${NC}"
    exit 1
fi

echo -e "${GREEN}Virtual environment activated${NC}"
echo ""

# Run the agent with provided arguments or default to 'start'
if [ $# -eq 0 ]; then
    echo "Starting agent in production mode..."
    python run_agent.py start
else
    echo "Running agent with command: $@"
    python run_agent.py "$@"
fi
