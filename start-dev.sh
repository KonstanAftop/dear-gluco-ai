#!/bin/bash

# DearGluco.ai Development Startup Script
# This script helps you start both backend and frontend for testing

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🩺 DearGluco.ai Development Startup${NC}"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from dear-gluco-ai directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env file with LiveKit credentials..."
    cat > .env << 'EOF'
# LiveKit Configuration (Backend)
LIVEKIT_URL=wss://deargluco-osjqzqt1.livekit.cloud
LIVEKIT_API_KEY=APIqgtD429iMEQ2
LIVEKIT_API_SECRET=NlalfCw3Vi4uouR4CSavl0a5IB6Athx8v1jpzaT7Eqf

# LiveKit Configuration (Frontend - Vite requires VITE_ prefix)
VITE_LIVEKIT_URL=wss://deargluco-osjqzqt1.livekit.cloud
VITE_LIVEKIT_API_KEY=APIqgtD429iMEQ2
VITE_LIVEKIT_API_SECRET=NlalfCw3Vi4uouR4CSavl0a5IB6Athx8v1jpzaT7Eqf

# OpenAI Configuration (Frontend)
VITE_OPENAI_API_KEY=your_openai_key_here
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please add your OpenAI API key to .env${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

# Check if backend agent is running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Backend agent is already running on port 8081${NC}"
else
    echo -e "${YELLOW}⚠ Backend agent not running${NC}"
    echo ""
    echo "To start the backend agent, open a new terminal and run:"
    echo -e "${BLUE}cd diabetes-agent-server${NC}"
    echo -e "${BLUE}source venv/bin/activate${NC}"
    echo -e "${BLUE}python run_agent.py start${NC}"
    echo ""
    read -p "Press Enter when backend is running, or Ctrl+C to exit..."
fi

echo ""
echo -e "${GREEN}Starting frontend development server...${NC}"
echo ""
echo -e "${BLUE}Frontend will be available at: http://localhost:5173${NC}"
echo -e "${BLUE}Backend agent running on: http://localhost:8081${NC}"
echo ""
echo "======================================"
echo "Press Ctrl+C to stop the frontend"
echo "======================================"
echo ""

# Start the frontend
npm run dev
