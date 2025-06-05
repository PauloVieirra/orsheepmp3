import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  console.log('✅ Verificação de saúde realizada');
  res.json({ status: 'ok' });
});

// Rota para download
app.post('/download/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title } = req.body;

    console.log('\n🎵 Iniciando download da música:');
    console.log(`📌 Título: ${title}`);
    console.log(`🆔 ID do Vídeo: ${videoId}`);

    // Verificar se o ID do vídeo é válido
    if (!ytdl.validateID(videoId)) {
      console.log('❌ ID do vídeo inválido');
      return res.status(400).json({ error: 'ID do vídeo inválido' });
    }

    console.log('✅ ID do vídeo validado');

    // Configurar headers para download
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    console.log('🎯 Iniciando stream do YouTube...');

    // Criar stream do YouTube com apenas áudio na melhor qualidade
    const stream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    console.log('✅ Stream do YouTube iniciado');
    console.log('🔄 Iniciando conversão para MP3...');

    // Converter para MP3 usando ffmpeg
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log('📝 Logs do servidor:');
  console.log('------------------');
}); 