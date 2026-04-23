
import { spawn } from 'child_process';
import { app, BrowserWindow } from 'electron';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant
const __dirname = dirname(fileURLToPath(import.meta.url));

let javaProcess = null;
// Variable pour garder une référence à la fenêtre
let mainWindow;

/**
 * Démarrage du backend
 */
function startBackend() {
  const jarPath = join(__dirname, '../backend-tool/target-prod/task-tool-1.0.0-SNAPSHOT.jar');

  javaProcess = spawn(
    'java',
    [ '-jar', jarPath, '--spring.profiles.active=prod' ],
    { cwd: join(__dirname, '../backend-tool') }
  );

  javaProcess.stdout.on('data', data => {
    console.warn(`Java: ${ data }`);
  });

  javaProcess.stderr.on('data', data => {
    console.error(`Java error: ${ data }`);
  });
}
/**
 * Affichage de la fenêtre
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Désactivé pour la sécurité
      contextIsolation: true, // Activé pour la sécurité
      enableRemoteModule: false, // Désactivé pour la sécurité
    },
  });

  mainWindow.loadFile('../frontend-vanilla-tool/index.html');

  // Événement déclenché quand la fenêtre est fermée
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quand Electron est prêt, créer la fenêtre
app.whenReady()
  .then(() => {
    startBackend();

    // petit délai pour laisser Java démarrer
    setTimeout(createWindow, 6000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

app.on('will-quit', () => {
  if (javaProcess) {
    console.warn('Java: KILL PROCESS');
    javaProcess.kill();
  }
});

// Quitter l'application quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', error => {
  console.error('Erreur non capturée:', error);
});
