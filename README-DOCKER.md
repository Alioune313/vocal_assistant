# Docker - Guide d'Utilisation

Ce guide explique comment utiliser Docker pour lancer l'application de transcription vocale.

## 📋 Prérequis

- Docker installé ([Docker Desktop](https://www.docker.com/products/docker-desktop))
- Docker Compose (inclus avec Docker Desktop)
- Fichier `.env.local` avec vos variables d'environnement

## 🚀 Démarrage Rapide

### 1. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# LiveKit Configuration
LIVEKIT_API_KEY=votre_api_key
LIVEKIT_API_SECRET=votre_api_secret
LIVEKIT_URL=https://votre-livekit-server-url

# Agent Configuration (optionnel)
AGENT_NAME=

# n8N Integration (optionnel)
N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/transcription-webhook

# Next.js Configuration (optionnel)
NEXT_PUBLIC_CONN_DETAILS_ENDPOINT=
```

### 2. Build et Lancement en Production

```bash
# Build et lancer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

L'application sera accessible sur `http://localhost:3000`

### 3. Mode Développement

```bash
# Lancer en mode développement (avec hot-reload)
docker-compose -f docker-compose.dev.yml up

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

## 🛠️ Commandes Utiles

### Build de l'image

```bash
# Build uniquement
docker-compose build

# Build sans cache
docker-compose build --no-cache

# Build et lancer
docker-compose up -d --build
```

### Gestion du conteneur

```bash
# Voir les logs
docker-compose logs -f app

# Entrer dans le conteneur
docker-compose exec app sh

# Redémarrer le conteneur
docker-compose restart app

# Arrêter le conteneur
docker-compose stop app

# Supprimer le conteneur et les volumes
docker-compose down -v
```

### Vérifier l'état

```bash
# Voir les conteneurs en cours
docker-compose ps

# Voir l'utilisation des ressources
docker stats agent-starter-react
```

## 📦 Structure Docker

```
.
├── Dockerfile              # Image de production
├── Dockerfile.dev          # Image de développement
├── docker-compose.yml      # Configuration production
├── docker-compose.dev.yml  # Configuration développement
└── .dockerignore          # Fichiers à ignorer
```

## 🔧 Configuration Avancée

### Modifier le port

Dans `docker-compose.yml`, modifiez :

```yaml
ports:
  - "8080:3000"  # Port externe:Port interne
```

### Ajouter des volumes

Pour persister des données :

```yaml
volumes:
  - ./data:/app/data
  - ./logs:/app/logs
```

### Variables d'environnement supplémentaires

Ajoutez dans `docker-compose.yml` :

```yaml
environment:
  - MA_VARIABLE=valeur
```

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker-compose logs app

# Vérifier les variables d'environnement
docker-compose config
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Ou changer le port dans docker-compose.yml
```

### Rebuild complet

```bash
# Supprimer tout et reconstruire
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problèmes de permissions

```bash
# Sur Linux/Mac, ajuster les permissions
sudo chown -R $USER:$USER .
```

## 📊 Production

### Optimisations pour la production

1. **Utiliser une image Alpine** (déjà fait - node:22-alpine)
2. **Multi-stage build** (déjà fait)
3. **Utilisateur non-root** (déjà fait)
4. **Health checks** (déjà configuré)

### Déploiement

```bash
# Build l'image
docker build -t agent-starter-react:latest .

# Tag pour un registry
docker tag agent-starter-react:latest votre-registry/agent-starter-react:latest

# Push vers le registry
docker push votre-registry/agent-starter-react:latest
```

### Utilisation avec Kubernetes

Le Dockerfile est compatible avec Kubernetes. Vous pouvez créer un deployment Kubernetes en utilisant cette image.

## 🔒 Sécurité

- L'application tourne avec un utilisateur non-root
- Les secrets ne sont pas dans l'image Docker
- Utilisez des secrets Docker ou des variables d'environnement
- Ne commitez jamais `.env.local`

## 📝 Notes

- Le mode `standalone` de Next.js est activé pour optimiser la taille de l'image
- Les fichiers statiques sont copiés séparément pour un meilleur caching
- Le healthcheck vérifie que l'application répond correctement

## 🆘 Support

Pour plus d'aide :
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
