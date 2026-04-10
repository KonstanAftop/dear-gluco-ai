import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessToken } from 'livekit-server-sdk';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';

interface TokenRequestBody {
  participantName: string;
  roomName?: string;
  glucoseLevel?: number;
  sessionType?: 'consultation' | 'emergency' | 'followup';
  metadata?: Record<string, unknown>;
}

function generateRoomName(sessionType: string = 'consultation'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `diabetes_${sessionType}_${timestamp}_${random}`;
}

function generateParticipantIdentity(participantName: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `patient_${participantName.replace(/\s+/g, '_')}_${timestamp}_${random}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    console.error('Missing LiveKit server credentials');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const body = req.body as TokenRequestBody;

  if (!body?.participantName?.trim()) {
    return res.status(400).json({ error: 'participantName is required' });
  }

  try {
    const roomName = body.roomName || generateRoomName(body.sessionType);
    const participantIdentity = generateParticipantIdentity(body.participantName);

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: body.participantName,
      ttl: 60 * 60,
      metadata: JSON.stringify({
        sessionType: body.sessionType || 'consultation',
        glucoseLevel: body.glucoseLevel,
        timestamp: Date.now(),
        ...body.metadata,
      }),
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({ agentName: 'diabetes-consultant' }),
      ],
    });

    const jwt = await token.toJwt();

    return res.status(200).json({
      accessToken: jwt,
      url: wsUrl,
      participantInfo: {
        identity: participantIdentity,
        name: body.participantName,
        metadata: token.metadata || '',
        permission: {
          canSubscribe: true,
          canPublish: true,
          canPublishData: true,
          canUpdateMetadata: true,
        },
      },
      roomName,
    });
  } catch (error) {
    console.error('Token generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}
