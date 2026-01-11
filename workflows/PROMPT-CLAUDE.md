# Prompt pour Claude - Création d'un Workflow n8N

Copiez et collez ce prompt dans Claude pour créer un workflow n8N personnalisé pour votre application de transcription.

---

## PROMPT À DONNER À CLAUDE

````
Je veux créer un workflow n8N pour automatiser le traitement des transcriptions d'une application de transcription vocale en temps réel.

## Contexte de l'Application

J'ai une application Next.js/React qui permet :
- Interaction vocale en temps réel avec un agent IA (LiveKit)
- Transcription automatique des conversations (utilisateur ↔ agent)
- Export des transcriptions vers le presse-papiers
- Widget flottant pour copier facilement les transcriptions

## Format des Données

L'application envoie des transcriptions via un webhook POST avec ce format JSON :

```json
{
  "timestamp": "2025-01-13T14:30:15.123Z",
  "transcription": "Le texte transcrit de la conversation",
  "participant": "Agent" ou "Utilisateur",
  "sessionId": "session_1234567890",
  "messageId": "msg_abc123",
  "messageType": "chatMessage"
}
````

## Objectifs du Workflow n8N

Je veux un workflow n8N qui :

1. **Reçoit les transcriptions** via webhook POST
2. **Extrait et structure** les données (timestamp, participant, texte)
3. **Filtre** les messages (par exemple, seulement les messages de l'agent)
4. **Formate** les transcriptions pour différents formats :
   - Format Word/Outlook (avec date, participant, texte)
   - Format texte simple
   - Format JSON structuré
5. **Analyse le contenu** :
   - Détecte le sentiment (positif/négatif/neutre)
   - Extrait les mots-clés importants
   - Détecte les actions à faire (mots comme "faire", "créer", "envoyer")
   - Détecte les questions
   - Détecte l'urgence (mots comme "urgent", "important", "immédiatement")
6. **Envoie par email** (Microsoft Outlook) :
   - Email standard avec la transcription formatée
   - Email urgent si détecté
7. **Sauvegarde** :
   - Google Drive (fichier Word/DOCX)
   - Google Sheets (logging avec colonnes : timestamp, participant, transcription, sentiment)
   - Notion (base de données avec propriétés : Title, Content, Date, Sentiment)
8. **Actions conditionnelles** :
   - Si urgent → Email spécial + Création de tâche
   - Si action détectée → Création de tâche dans un système de gestion
   - Si question → Envoi à un système de FAQ

## Intégrations Souhaitées

- Microsoft Outlook (envoi d'emails)
- Google Drive (sauvegarde de fichiers)
- Google Sheets (logging)
- Notion (base de données)
- Optionnel : Slack, Teams, Zapier, IFTTT

## Format de Sortie

Le workflow doit :

- Retourner une réponse JSON au webhook avec le statut
- Gérer les erreurs gracieusement
- Logger toutes les actions
- Permettre la personnalisation facile

## Spécifications Techniques

- Format du workflow : JSON n8N standard
- Langue : Français pour les labels et messages
- Format de date : ISO 8601 ou format français (dd/mm/yyyy HH:mm)
- Gestion des erreurs : Continue le workflow même si une étape échoue
- Performance : Traite les transcriptions rapidement (< 5 secondes)

## Exemples de Cas d'Usage

1. **Support Client** : Transcription → Email support → CRM → Ticket si urgent
2. **Réunions** : Transcription → Google Drive → Extraction actions → Email résumé
3. **Documentation** : Transcription → Notion → Formatage → Archivage
4. **Formation** : Transcription → Google Drive → Analyse → Statistiques

## Instructions

Crée-moi un workflow n8N complet avec :

- Tous les nœuds nécessaires
- Les connexions entre les nœuds
- Les configurations de chaque nœud
- Les credentials nécessaires (à configurer dans n8N)
- Les variables d'environnement à définir
- Un guide d'installation et de configuration

Le workflow doit être prêt à être importé dans n8N et fonctionnel après configuration des credentials.

Format de sortie souhaité :

- Fichier JSON du workflow n8N
- Documentation d'installation
- Guide de configuration des credentials
- Exemples de personnalisation

```

---

## Comment Utiliser ce Prompt

1. **Copiez le prompt ci-dessus** (tout le contenu entre les lignes de séparation)
2. **Collez-le dans Claude** (ou un autre assistant IA)
3. **Claude générera** :
   - Un workflow n8N complet en JSON
   - La documentation d'installation
   - Les instructions de configuration

## Personnalisation

Vous pouvez modifier le prompt pour :
- Ajouter d'autres intégrations (Slack, Teams, CRM, etc.)
- Modifier les règles d'analyse
- Changer les formats de sortie
- Ajouter des conditions spécifiques
- Intégrer avec des systèmes IA (OpenAI, Anthropic, etc.)

## Exemple de Personnalisation

Si vous voulez ajouter l'analyse IA, ajoutez dans le prompt :

```

7. **Analyse IA** (optionnel) :
   - Envoie la transcription à OpenAI/Anthropic pour :
     - Résumé automatique
     - Extraction d'entités nommées
     - Classification par catégorie
     - Traduction si nécessaire

```

## Notes

- Le workflow généré sera compatible avec n8N version récente
- Tous les nœuds utiliseront les dernières versions disponibles
- Les credentials devront être configurés manuellement dans n8N
- Les variables d'environnement doivent être définies dans n8N
```
