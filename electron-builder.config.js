const { join } = require('path');

module.exports = {
  appId: 'com.livekit.agent-starter',
  productName: 'LiveKit Agent Starter',
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  files: ['electron/**/*', 'package.json'],
  extraFiles: [
    {
      from: '.next/standalone',
      to: '.next/standalone',
      filter: ['**/*'],
    },
    {
      from: '.next/static',
      to: '.next/static',
      filter: ['**/*'],
    },
    {
      from: 'public',
      to: 'public',
      filter: ['**/*'],
    },
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    icon: 'build/icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'LiveKit Agent Starter',
  },
  mac: {
    target: ['dmg'],
    icon: 'build/icon.icns',
    category: 'public.app-category.productivity',
  },
  linux: {
    target: ['AppImage'],
    icon: 'build/icon.png',
    category: 'Utility',
  },
};
