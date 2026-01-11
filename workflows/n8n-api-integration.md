# Intégration n8N avec l'Application de Transcription

Ce guide explique comment intégrer votre application de transcription avec n8N pour automatiser le traitement des transcriptions.

## Prérequis

1. n8N installé et configuré
2. Application de transcription en cours d'exécution
3. Credentials configurés dans n8N pour :
   - Microsoft Outlook
   - Google Drive
   - Google Sheets
   - Notion (optionnel)
   - IFTTT (optionnel)

## Configuration de l'Application

### 1. Ajouter un endpoint API pour envoyer les transcriptions

Créez un nouveau fichier `app/api/transcription-webhook/route.ts` :

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    // Envoyer vers n8N webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json({ error: 'N8N webhook URL not configured' }, { status: 500 });
    }

    // Formater les messages pour n8N
    const transcriptions = messages.map((msg: any) => ({
      timestamp: new Date(msg.timestamp).toISOString(),
      transcription: msg.message,
      participant: msg.from?.isLocal ? 'Utilisateur' : 'Agent',
      sessionId: sessionId,
    }));

    // Envoyer chaque transcription à n8N
    for (const transcription of transcriptions) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcription),
      });
    }

    return NextResponse.json({ success: true, count: transcriptions.length });
  } catch (error) {
    console.error('Error sending to n8N:', error);
    return NextResponse.json({ error: 'Failed to send transcription' }, { status: 500 });
  }
}
```

### 2. Modifier le widget de transcription

Ajoutez une option pour envoyer automatiquement vers n8N dans `components/app/transcript-widget.tsx` :

```typescript
const handleSendToN8N = useCallback(async () => {
  if (messages.length === 0) {
    toast.error('Aucune transcription à envoyer');
    return;
  }

  try {
    const response = await fetch('/api/transcription-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        sessionId: `session_${Date.now()}`,
      }),
    });

    if (response.ok) {
      toast.success('Transcription envoyée à n8N !');
    } else {
      throw new Error("Erreur lors de l'envoi");
    }
  } catch (error) {
    toast.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
  }
}, [messages]);
```

## Configuration n8N

### 1. Importer le workflow

1. Ouvrez n8N
2. Cliquez sur "Workflows" > "Import from File"
3. Sélectionnez le fichier `n8n-transcription-workflow.json`
4. Le workflow sera importé avec tous les nœuds

### 2. Configurer les Credentials

#### Microsoft Outlook

1. Allez dans "Credentials" > "Add Credential"
2. Sélectionnez "Microsoft Outlook OAuth2 API"
3. Suivez le processus d'authentification OAuth2
4. Configurez les permissions nécessaires

#### Google Drive

1. Créez un credential "Google Drive OAuth2 API"
2. Authentifiez-vous avec votre compte Google
3. Notez l'ID du dossier de destination

#### Google Sheets

1. Créez un credential "Google Sheets OAuth2 API"
2. Créez une nouvelle feuille de calcul
3. Notez l'ID de la feuille

#### Notion (optionnel)

1. Créez une intégration Notion
2. Obtenez votre token API
3. Créez une base de données pour les transcriptions

### 3. Configurer les Variables d'Environnement

Dans n8N, configurez ces variables d'environnement :

```env
EMAIL_FROM=votre-email@example.com
EMAIL_TO=destinataire@example.com
EMAIL_URGENT=urgent@example.com
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_SHEETS_ID=your-sheet-id
NOTION_DATABASE_ID=your-database-id
N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/transcription-webhook
```

### 4. Activer le Webhook

1. Dans le workflow n8N, cliquez sur le nœud "Webhook - Nouvelle Transcription"
2. Cliquez sur "Listen for Test Event"
3. Copiez l'URL du webhook
4. Ajoutez cette URL dans votre `.env.local` :

```env
N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/transcription-webhook
```

## Utilisation

### Mode Automatique

1. Activez le workflow dans n8N
2. Dans l'application, cliquez sur "Envoyer à n8N" dans le widget
3. Les transcriptions seront automatiquement :
   - Envoyées par email
   - Sauvegardées dans Google Drive
   - Loggées dans Google Sheets
   - Analysées pour détecter l'urgence
   - Sauvegardées dans Notion

### Mode Manuel

Vous pouvez aussi déclencher manuellement le webhook depuis votre application ou utiliser l'API directement.

## Personnalisation

### Ajouter d'autres destinations

Vous pouvez facilement ajouter d'autres nœuds dans n8N pour :

- Envoyer vers Slack
- Créer des tickets dans Jira
- Sauvegarder dans Airtable
- Envoyer vers Zapier
- Intégrer avec CRM (Salesforce, HubSpot)

### Modifier l'analyse

Le nœud "Analyser la Transcription" peut être modifié pour :

- Détecter des entités nommées
- Extraire des dates/heures
- Classifier par catégorie
- Détecter la langue
- Calculer le sentiment avec IA

## Exemples de Cas d'Usage

### 1. Support Client Automatisé

- Transcription → Email au support
- Analyse → Création de ticket si urgent
- Sauvegarde → Base de données CRM

### 2. Prise de Notes de Réunion

- Transcription → Google Drive (format Word)
- Analyse → Extraction des actions
- Notification → Email avec résumé

### 3. Documentation Automatique

- Transcription → Notion
- Formatage → Template personnalisé
- Archivage → Google Drive organisé par date

## Dépannage

### Le webhook ne reçoit pas les données

- Vérifiez que l'URL est correcte
- Vérifiez que le workflow est activé
- Vérifiez les logs n8N

### Les emails ne sont pas envoyés

- Vérifiez les credentials Outlook
- Vérifiez les permissions OAuth2
- Vérifiez les variables d'environnement

### Google Drive ne fonctionne pas

- Vérifiez l'ID du dossier
- Vérifiez les permissions du dossier
- Vérifiez les credentials Google

## Support

Pour plus d'aide, consultez :

- [Documentation n8N](https://docs.n8n.io/)
- [API n8N](https://docs.n8n.io/api/)
