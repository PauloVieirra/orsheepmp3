const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota para download
app.post('/download/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title } = req.body;

    // Verificar se o ID do vídeo é válido
    if (!ytdl.validateID(videoId)) {
      return res.status(400).json({ error: 'ID do vídeo inválido' });
    }

    // Obter informações do vídeo
    const videoInfo = await ytdl.getInfo(videoId);
    
    // Configurar headers para download
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    // Criar stream do YouTube
    const stream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    // Converter para MP3 usando ffmpeg
    ffmpeg(stream)
      .toFormat('mp3')
      .audioBitrate(192)
      .on('error', (err) => {
        console.error('Erro na conversão:', err);
        res.status(500).json({ error: 'Erro na conversão do áudio' });
      })
      .pipe(res);

  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ error: 'Erro ao processar o download' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 