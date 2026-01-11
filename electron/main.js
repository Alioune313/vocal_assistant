const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let nextServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: join(__dirname, '../public/favicon.ico'),
    show: false,
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  if (isDev) {
    // In development, connect to Next.js dev server
    mainWindow.loadURL('http://localhost:3000');

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built Next.js app
    const port = process.env.PORT || 3000;
    mainWindow.loadURL(`http://localhost:${port}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  if (isDev) {
    // In development, Next.js dev server should be started separately
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // In production, start the Next.js server
    // In packaged app, files are in resources/app.asar or resources/app
    const appPath = app.isPackaged ? process.resourcesPath : app.getAppPath();

    const nextPath = app.isPackaged
      ? join(appPath, 'app', '.next', 'standalone')
      : join(appPath, '.next', 'standalone');

    const serverPath = join(nextPath, 'server.js');

    // Check if server file exists
    const fs = require('fs');
    if (!fs.existsSync(serverPath)) {
      console.error('Next.js server file not found at:', serverPath);
      reject(new Error('Next.js server not found'));
      return;
    }

    nextServer = spawn('node', [serverPath], {
      cwd: nextPath,
      env: {
        ...process.env,
        PORT: process.env.PORT || '3000',
        NODE_ENV: 'production',
      },
      stdio: 'pipe',
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js error: ${data}`);
    });

    nextServer.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      reject(err);
    });

    nextServer.on('exit', (code) => {
      console.log(`Next.js server exited with code ${code}`);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (nextServer && !nextServer.killed) {
        resolve(); // Resolve anyway to not block the app
      }
    }, 10000);
  });
}

app.whenReady().then(async () => {
  try {
    await startNextServer();
  } catch (err) {
    console.error('Error starting Next.js server:', err);
  }

  // Wait a bit for the server to start
  setTimeout(
    () => {
      createWindow();
    },
    isDev ? 1000 : 2000
  );

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});
