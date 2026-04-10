# DearGluco.ai Diabetes Consultation Agent

🩺 LiveKit-powered AI agent untuk konsultasi diabetes real-time dalam Bahasa Indonesia.

## Overview

Diabetes Consultation Agent adalah AI agent yang menggunakan LiveKit framework untuk memberikan konsultasi diabetes real-time melalui voice chat. Agent ini dirancang khusus untuk pasien diabetes di Indonesia dengan kemampuan:

- **Real-time Voice Consultation** - Konsultasi suara langsung dengan AI
- **Medical Knowledge Base** - Database medis diabetes dalam Bahasa Indonesia
- **Emergency Detection** - Deteksi kondisi darurat otomatis
- **Glucose Monitoring** - Analisis kadar gula darah real-time
- **Indonesian Language** - Komunikasi penuh dalam Bahasa Indonesia

## Features

### 🔊 Voice Consultation
- Real-time voice chat dengan AI diabetes specialist
- Indonesian Text-to-Speech (TTS) dan Speech-to-Text (STT)
- WebRTC connection untuk kualitas audio tinggi

### 🩸 Medical Analysis
- Analisis kadar gula darah dengan rekomendasi
- Evaluasi gejala diabetes dan tingkat urgensi
- Informasi obat diabetes lengkap
- Deteksi kondisi darurat otomatis

### 🚨 Emergency Detection
- Alert otomatis untuk hipoglikemia berat (<54 mg/dL)
- Alert untuk hiperglikemia kritis (>300 mg/dL)
- Protokol eskalasi darurat ke UGD/119

### 📊 Medical Compliance
- Medical disclaimers sesuai regulasi Indonesia
- Logging konsultasi untuk audit trail
- Batas waktu sesi konsultasi (30 menit)

## Quick Start

### 1. Prerequisites

- Python 3.11+
- pip atau pipenv
- LiveKit Cloud account
- OpenAI API key atau Anthropic API key

### 2. Setup

```bash
# Clone repository
cd diabetes-agent-server

# Run setup script
chmod +x setup.sh
./setup.sh

# Edit environment variables
nano .env
```

### 3. Configuration

Edit `.env` file dengan kredensial Anda:

```env
# LiveKit Configuration (REQUIRED)
LIVEKIT_API_KEY=your_actual_api_key
LIVEKIT_API_SECRET=your_actual_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# AI Service (choose one)
OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Run

```bash
# Development
python3 run_agent.py

# Production with Docker
docker-compose up -d
```

## Development

### Local Development

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run agent
python3 run_agent.py
```

### Docker Development

```bash
# Build and run
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f diabetes-agent

# Stop
docker-compose down
```

### With Monitoring

```bash
# Run with Prometheus and Grafana
docker-compose --profile monitoring up

# Access:
# - Agent: http://localhost:8080 (if Prometheus enabled)
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000 (admin/admin)
```

## Architecture

### Core Components

1. **DiabetesConsultationAgent** - Main AI agent dengan medical knowledge
2. **MedicalKnowledgeBase** - Database diabetes dalam Bahasa Indonesia
3. **LiveKit Integration** - Real-time communication layer
4. **Emergency Handler** - Sistem deteksi dan eskalasi darurat

### Medical Knowledge Base

- **Glucose Ranges** - Normal, pre-diabetes, diabetes, emergency levels
- **Medications** - Database obat diabetes Indonesia (Metformin, Glimepiride, dll)
- **Symptoms** - Gejala diabetes dan tingkat urgensi
- **Lifestyle** - Rekomendasi diet dan olahraga

### Safety Features

- **Emergency Detection** - Otomatis detect kondisi darurat
- **Medical Disclaimers** - Peringatan medis sesuai regulasi
- **Session Limits** - Batas waktu konsultasi (default: 30 menit)
- **Audit Trail** - Logging semua interaksi untuk compliance

## API Integration

### Frontend Integration

Agent ini terintegrasi dengan frontend React melalui:

```typescript
// Frontend connection
import { useConsultationSession } from './hooks/useDiabetesConsultation';

const { connect, sendMedicalData } = useConsultationSession();

// Send glucose data
await sendMedicalData({
  glucose_level: 120,
  symptoms: ['haus berlebihan', 'sering kencing'],
  medication: 'metformin'
});
```

### Medical Data Format

```json
{
  "type": "medical_data",
  "data": {
    "glucose_level": 150,
    "symptoms": ["haus berlebihan", "lemas"],
    "medication": "metformin",
    "meal_status": "setelah_makan"
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LIVEKIT_API_KEY` | LiveKit API Key | Required |
| `LIVEKIT_API_SECRET` | LiveKit API Secret | Required |
| `LIVEKIT_URL` | LiveKit Server URL | Required |
| `OPENAI_API_KEY` | OpenAI API Key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic API Key | Optional |
| `AGENT_LANGUAGE` | Agent Language | `id` (Indonesian) |
| `MAX_SESSION_DURATION` | Max session time (seconds) | `1800` (30 min) |
| `EMERGENCY_GLUCOSE_LOW` | Emergency low glucose | `54` mg/dL |
| `EMERGENCY_GLUCOSE_HIGH` | Emergency high glucose | `300` mg/dL |

### Medical Configuration

```env
# Glucose Thresholds
EMERGENCY_GLUCOSE_LOW=54      # mg/dL
EMERGENCY_GLUCOSE_HIGH=300    # mg/dL
URGENT_GLUCOSE_LOW=70         # mg/dL
URGENT_GLUCOSE_HIGH=250       # mg/dL

# Features
ENABLE_GLUCOSE_MONITORING=true
ENABLE_SYMPTOM_ANALYSIS=true
ENABLE_EMERGENCY_DETECTION=true
```

## Deployment

### Production Deployment

1. **Docker Deployment**
   ```bash
   # Build production image
   docker build --target production -t deargluco-agent .

   # Run with docker-compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Cloud Deployment**
   - Deploy ke Google Cloud Run, AWS Fargate, atau Azure Container Instances
   - Set environment variables di cloud provider
   - Configure health checks pada port 8080

3. **Monitoring**
   - Enable Prometheus metrics dengan `ENABLE_PROMETHEUS=true`
   - Setup Grafana dashboard untuk monitoring
   - Configure alerts untuk emergency conditions

## Security

### Medical Data Protection

- **No Data Storage** - Agent tidak menyimpan data medis
- **Encrypted Communication** - WebRTC encryption untuk audio
- **Session Isolation** - Setiap sesi terisolasi
- **Audit Logging** - Log semua interaksi tanpa data sensitif

### API Security

- **Token Validation** - JWT tokens untuk authentication
- **Rate Limiting** - Batasi request per session
- **Input Validation** - Sanitasi input medis
- **Error Handling** - Tidak expose internal errors

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: Failed to connect to LiveKit
   ```
   - Check LIVEKIT_URL, API_KEY, dan API_SECRET
   - Verify LiveKit project is active

2. **AI Service Error**
   ```
   Error: No AI service configured
   ```
   - Set OPENAI_API_KEY atau ANTHROPIC_API_KEY
   - Check API key validity

3. **Module Import Error**
   ```
   ModuleNotFoundError: No module named 'livekit'
   ```
   - Run `pip install -r requirements.txt`
   - Check virtual environment is activated

### Debug Mode

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=DEBUG
```

### Health Check

```bash
# Check agent health
curl http://localhost:8080/health

# Check configuration
python3 -c "from config import CONFIG; print('OK' if CONFIG else 'FAIL')"
```

## Contributing

1. Fork repository
2. Create feature branch
3. Add tests untuk medical functions
4. Submit pull request

### Code Style

- Follow PEP 8 untuk Python code
- Use type hints untuk semua functions
- Add docstrings untuk medical functions
- Test dengan Indonesian medical scenarios

## License

Proprietary - DearGluco.ai

## Support

- Issues: GitHub Issues
- Medical Questions: Konsultasi dengan dokter
- Technical Support: Developer team

---

🩺 **DearGluco.ai** - Empowering diabetes management through AI technology