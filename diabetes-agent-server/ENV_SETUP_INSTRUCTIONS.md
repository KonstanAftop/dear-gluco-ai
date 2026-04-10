# Environment Setup Instructions

## Current Status

✅ **Import Error Fixed**: The `ModuleNotFoundError` has been resolved.
✅ **LiveKit Credentials**: Updated with your LiveKit project credentials.
⚠️ **OpenAI API Key**: Still needs to be configured.

## What's Happening Now

The agent is trying to connect to LiveKit but getting a **401 Unauthorized** error. This could be due to:

1. **Missing OpenAI API Key** (most likely)
2. Invalid LiveKit credentials
3. HMAC key length warning (minor issue)

## Required: Add Your OpenAI API Key

You need to add your OpenAI API key to the `.env` file:

```bash
# Edit the .env file
nano /Users/itn.konstan.ndruru/Documents/My-Files/Competition/dearglucoo.ai/dear-gluco-ai/diabetes-agent-server/.env
```

Find this line:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace it with your actual OpenAI API key:
```
OPENAI_API_KEY=sk-proj-...your-actual-key...
```

## How to Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key and paste it in the `.env` file

## Current LiveKit Configuration

Your LiveKit credentials are already configured:
- **URL**: `wss://deargluco-osjqzqt1.livekit.cloud`
- **API Key**: `APIqgtD429iMEQ2`
- **API Secret**: `NlalfCw3Vi4uouR4CSavl0a5IB6Athx8v1jpzaT7Eqf`

## After Adding the OpenAI Key

1. Stop the current agent (Ctrl+C)
2. Restart the agent:
   ```bash
   cd /Users/itn.konstan.ndruru/Documents/My-Files/Competition/dearglucoo.ai/dear-gluco-ai/diabetes-agent-server
   source venv/bin/activate
   python run_agent.py start
   ```

## Alternative: Use Anthropic Instead

If you prefer to use Anthropic's Claude instead of OpenAI:

1. Get an Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
2. Update the `.env` file:
   ```
   # Comment out OpenAI
   # OPENAI_API_KEY=your_openai_api_key_here
   
   # Add Anthropic
   ANTHROPIC_API_KEY=sk-ant-...your-key...
   ```
3. Update the `diabetes_agent.py` to use Anthropic instead of OpenAI

## Troubleshooting the 401 Error

The error message shows:
```
WSServerHandshakeError: 401, message='Invalid response status', url='wss://deargluco-osjqzqt1.livekit.cloud/agent'
```

This typically means:
- ✅ The agent is starting correctly
- ✅ It's trying to connect to the right LiveKit URL
- ❌ Authentication is failing (likely due to missing OpenAI key or invalid LiveKit credentials)

## HMAC Key Warning (Minor)

You may see this warning:
```
InsecureKeyLengthWarning: The HMAC key is 28 bytes long, which is below the minimum recommended length of 32 bytes
```

This is a minor security warning about the LiveKit API secret length. It won't prevent the agent from working, but you may want to regenerate your LiveKit credentials for better security.

## Next Steps

1. **Add your OpenAI API key** to the `.env` file
2. **Restart the agent**
3. **Test the connection** - the agent should connect successfully
4. **Connect from the frontend** - your web app should be able to interact with the agent

## Quick Test Command

After adding the OpenAI key, test the agent:

```bash
cd /Users/itn.konstan.ndruru/Documents/My-Files/Competition/dearglucoo.ai/dear-gluco-ai/diabetes-agent-server
source venv/bin/activate
python run_agent.py start
```

You should see:
```
✅ process initialized
✅ connected to livekit
✅ Ready to accept diabetes consultation sessions!
```

Instead of:
```
❌ failed to connect to livekit, retrying...
```
