import { app, BrowserWindow } from 'electron';
import path from 'path';
import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar servidor Express
const server = express();
server.use(cors());
server.use(express.json());

// Rota de verificação de saúde
server.get('/health', (req, res) => {
  console.log('✅ Verificação de saúde realizada');
  res.json({ status: 'ok' });
});

// Rota para download
server.post('/download/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title } = req.body;

    console.log('\n🎵 Iniciando download da música:');
    console.log(`📌 Título: ${title}`);
    console.log(`🆔 ID do Vídeo: ${videoId}`);

    if (!ytdl.validateID(videoId)) {
      console.log('❌ ID do vídeo inválido');
      return res.status(400).json({ error: 'ID do vídeo inválido' });
    }

    console.log('✅ ID do vídeo validado');
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    console.log('🎯 Iniciando stream do YouTube...');
    const stream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    console.log('✅ Stream do YouTube iniciado');
    console.log('🔄 Iniciando conversão para MP3...');

    ffmpeg(stream)
      .toFormat('mp3')
      .audioBitrate(192)
      .on('start', () => {
        console.log('🎼 Conversão iniciada');
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`⏳ Progresso: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('✅ Conversão finalizada com sucesso');
      })
      .on('error', (err) => {
        console.error('❌ Erro na conversão:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro na conversão do áudio' });
        }
      })
      .pipe(res);

    console.log('📤 Iniciando transferência do arquivo...');
  } catch (error) {
    console.error('❌ Erro no download:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao processar o download' });
    }
  }
});

// Iniciar servidor na porta 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log('📝 Logs do servidor:');
  console.log('------------------');
});

// Função para criar a janela do Electron
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Em desenvolvimento, carrega o servidor de desenvolvimento do Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega o arquivo index.html buildado
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(createWindow);

// Fecha a aplicação quando todas as janelas forem fechadas (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cria uma nova janela quando o aplicativo é ativado (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 