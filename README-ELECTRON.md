# Build Electron Application (.exe)

Ce guide explique comment créer un fichier .exe installable pour Windows.

## Prérequis

- Node.js 22 ou supérieur
- pnpm installé
- Windows (pour créer un .exe Windows)

## Installation des dépendances

```bash
pnpm install
```

## Build de l'application

### 1. Build Next.js en mode standalone

```bash
pnpm build
```

### 2. Créer l'exécutable Windows

```bash
pnpm electron:build:win
```

Le fichier .exe sera créé dans le dossier `dist/`.

## Scripts disponibles

- `pnpm electron:dev` - Lance l'application Electron en mode développement
- `pnpm electron:build` - Build pour la plateforme actuelle
- `pnpm electron:build:win` - Build pour Windows (.exe)
- `pnpm electron:build:mac` - Build pour macOS (.dmg)
- `pnpm electron:build:linux` - Build pour Linux (.AppImage)

## Installation

Une fois le build terminé, vous trouverez dans le dossier `dist/` :

- **Windows** : Un installateur `.exe` (NSIS)
- **macOS** : Un fichier `.dmg`
- **Linux** : Un fichier `.AppImage`

### Installation sur Windows

1. Double-cliquez sur le fichier `.exe` dans le dossier `dist/`
2. Suivez les instructions de l'installateur
3. L'application sera installée et un raccourci sera créé sur le bureau

## Configuration

Les fichiers de configuration sont :

- `electron/main.js` - Point d'entrée Electron
- `electron-builder.config.js` - Configuration de build

## Notes

- En mode production, l'application démarre un serveur Next.js local sur le port 3000
- Assurez-vous que le port 3000 est disponible
- Les variables d'environnement doivent être configurées dans `.env.local`
