import { NextResponse } from 'next/server';
import { type ReceivedMessage } from '@livekit/components-react';

type TranscriptionPayload = {
  messages: ReceivedMessage[];
  sessionId: string;
  timestamp?: string;
};

export async function POST(req: Request) {
  try {
    const body: TranscriptionPayload = await req.json();
    const { messages, sessionId } = body;

    // Vérifier que N8N_WEBHOOK_URL est configuré
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return NextResponse.json({ error: 'N8N webhook URL not configured' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Formater les messages pour n8N
    const transcriptions = messages.map((msg) => ({
      timestamp: new Date(msg.timestamp).toISOString(),
      transcription: msg.message || '',
      participant: msg.from?.isLocal ? 'Utilisateur' : 'Agent',
      sessionId: sessionId || `session_${Date.now()}`,
      messageId: msg.id,
      messageType: msg.type || 'chatMessage',
    }));

    // Envoyer chaque transcription à n8N
    const results = await Promise.allSettled(
      transcriptions.map(async (transcription) => {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transcription),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      })
    );

    // Compter les succès et échecs
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      total: transcriptions.length,
      successful,
      failed,
      message:
        failed > 0
          ? `${successful} transcriptions envoyées, ${failed} échecs`
          : 'Toutes les transcriptions ont été envoyées avec succès',
    });
  } catch (error) {
    console.error('Error sending to n8N:', error);
    return NextResponse.json(
      {
        error: 'Failed to send transcription',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
