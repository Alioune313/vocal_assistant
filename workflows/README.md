# Workflow n8N pour Application de Transcription

Ce dossier contient les fichiers nécessaires pour intégrer votre application de transcription avec n8N.

## 📁 Fichiers

- `n8n-transcription-workflow.json` - Workflow n8N complet à importer
- `n8n-api-integration.md` - Guide d'intégration détaillé
- `README.md` - Ce fichier

## 🚀 Démarrage Rapide

### 1. Configuration de l'Application

Ajoutez dans votre `.env.local` :

```env
N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/transcription-webhook
```

### 2. Import du Workflow n8N

1. Ouvrez n8N
2. Cliquez sur "Workflows" > "Import from File"
3. Sélectionnez `n8n-transcription-workflow.json`
4. Le workflow sera importé

### 3. Configuration des Credentials

Configurez les credentials suivants dans n8N :
- Microsoft Outlook (pour emails)
- Google Drive (pour sauvegarde)
- Google Sheets (pour logging)
- Notion (optionnel)

### 4. Activation

1. Activez le workflow dans n8N
2. Copiez l'URL du webhook
3. Ajoutez-la dans `.env.local` comme `N8N_WEBHOOK_URL`

## 🎯 Fonctionnalités du Workflow

Le workflow n8N effectue automatiquement :

1. **Réception** - Reçoit les transcriptions via webhook
2. **Extraction** - Extrait les données (timestamp, participant, texte)
3. **Filtrage** - Filtre les messages de l'agent
4. **Formatage** - Formate pour Word/Outlook
5. **Analyse** - Analyse le contenu (sentiment, mots-clés, urgence)
6. **Envoi Email** - Envoie par email Outlook
7. **Sauvegarde** - Sauvegarde dans Google Drive
8. **Logging** - Enregistre dans Google Sheets
9. **Notion** - Sauvegarde dans Notion (optionnel)
10. **Alertes** - Envoie des emails urgents si nécessaire

## 📊 Utilisation dans l'Application

Dans le widget de transcription, vous verrez maintenant :
- Bouton "Copier" - Copie dans le presse-papiers
- Bouton "Envoyer à n8N" - Envoie vers n8N pour traitement automatique

## 🔧 Personnalisation

Vous pouvez modifier le workflow n8N pour :
- Ajouter d'autres destinations (Slack, Teams, etc.)
- Modifier l'analyse (IA, NLP, etc.)
- Changer les templates d'email
- Ajouter des conditions personnalisées

## 📝 Exemples de Cas d'Usage

### Support Client
- Transcription → Email au support
- Analyse → Création de ticket si urgent
- Sauvegarde → CRM

### Réunions
- Transcription → Google Drive (Word)
- Analyse → Extraction des actions
- Notification → Email avec résumé

### Documentation
- Transcription → Notion
- Formatage → Template personnalisé
- Archivage → Google Drive organisé

## 🆘 Support

Consultez `n8n-api-integration.md` pour plus de détails.
