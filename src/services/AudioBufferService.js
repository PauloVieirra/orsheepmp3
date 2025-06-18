class AudioBufferService {
  constructor() {
    this.bufferSize = 20 * 60 * 1000; // 20 minutos em milissegundos
    this.bufferedTracks = new Map();
    this.currentTrack = null;
    this.isBuffering = false;
    this.bufferProgress = 0;
    this.onBufferProgress = null;
    this.onBufferComplete = null;
    this.onBufferError = null;
  }

  // Inicia o buffer para uma faixa específica
  async startBuffer(track, queue = []) {
    if (!track) return;

    this.currentTrack = track;
    this.isBuffering = true;
    this.bufferProgress = 0;

    try {
      // Verifica se já está em buffer
      if (this.bufferedTracks.has(track.id)) {
        this.isBuffering = false;
        this.onBufferComplete?.(track);
        return;
      }

      // Cria um elemento de áudio para buffer
      const audioElement = new Audio();
      audioElement.crossOrigin = 'anonymous';
      audioElement.preload = 'auto';

      // Configura o source do áudio usando servidores alternativos
      const audioUrl = await this.getAudioUrl(track.id);
      audioElement.src = audioUrl;

      // Monitora o progresso do buffer
      audioElement.addEventListener('progress', () => {
        this.updateBufferProgress(audioElement);
      });

      // Quando o buffer estiver pronto
      audioElement.addEventListener('canplaythrough', () => {
        this.completeBuffer(track, audioElement);
      });

      // Trata erros de buffer
      audioElement.addEventListener('error', (error) => {
        this.handleBufferError(track, error);
      });

      // Inicia o carregamento
      audioElement.load();

      // Buffer das próximas faixas da fila (até 20 minutos)
      await this.bufferQueue(queue, track);

    } catch (error) {
      this.handleBufferError(track, error);
    }
  }

  // Obtém URL de áudio de servidores alternativos
  async getAudioUrl(videoId) {
    const servers = [
      `https://invidious.snopyta.org/latest_version?id=${videoId}&itag=140`,
      `https://invidious.kavin.rocks/latest_version?id=${videoId}&itag=140`,
      `https://vid.puffyan.us/latest_version?id=${videoId}&itag=140`,
      `https://yt.artemislena.eu/latest_version?id=${videoId}&itag=140`
    ];

    for (const server of servers) {
      try {
        const response = await fetch(server, { method: 'HEAD' });
        if (response.ok) {
          return server;
        }
      } catch (error) {
        console.warn(`Servidor ${server} indisponível:`, error);
        continue;
      }
    }

    throw new Error('Nenhum servidor de áudio disponível');
  }

  // Atualiza o progresso do buffer
  updateBufferProgress(audioElement) {
    if (!audioElement.buffered.length) return;

    const buffered = audioElement.buffered;
    const duration = audioElement.duration || 0;
    
    if (duration > 0) {
      let bufferedEnd = 0;
      for (let i = 0; i < buffered.length; i++) {
        bufferedEnd = Math.max(bufferedEnd, buffered.end(i));
      }
      
      this.bufferProgress = Math.min((bufferedEnd / duration) * 100, 100);
      this.onBufferProgress?.(this.bufferProgress);
    }
  }

  // Completa o buffer de uma faixa
  completeBuffer(track, audioElement) {
    this.bufferedTracks.set(track.id, {
      audioElement,
      bufferedAt: new Date(),
      duration: audioElement.duration
    });

    this.isBuffering = false;
    this.onBufferComplete?.(track);
    
    console.log(`Buffer completo para: ${track.title}`);
  }

  // Trata erros de buffer
  handleBufferError(track, error) {
    this.isBuffering = false;
    console.error(`Erro no buffer de ${track.title}:`, error);
    this.onBufferError?.(track, error);
  }

  // Buffer das próximas faixas da fila
  async bufferQueue(queue, currentTrack) {
    if (!queue || queue.length === 0) return;

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    let totalBufferedTime = 0;
    const maxBufferTime = this.bufferSize;

    // Buffer das próximas faixas até atingir 20 minutos
    for (let i = currentIndex + 1; i < queue.length; i++) {
      const track = queue[i];
      
      // Verifica se já está em buffer
      if (this.bufferedTracks.has(track.id)) {
        const bufferedTrack = this.bufferedTracks.get(track.id);
        totalBufferedTime += bufferedTrack.duration * 1000;
        continue;
      }

      // Se já atingiu o limite de 20 minutos, para
      if (totalBufferedTime >= maxBufferTime) break;

      try {
        // Inicia buffer em background
        this.bufferTrackInBackground(track);
        
        // Estimativa de duração (assume 3-5 minutos por faixa)
        const estimatedDuration = 4 * 60 * 1000; // 4 minutos
        totalBufferedTime += estimatedDuration;
        
      } catch (error) {
        console.warn(`Erro ao buffer faixa ${track.title}:`, error);
      }
    }
  }

  // Buffer de uma faixa em background
  async bufferTrackInBackground(track) {
    try {
      const audioElement = new Audio();
      audioElement.crossOrigin = 'anonymous';
      audioElement.preload = 'auto';
      
      const audioUrl = await this.getAudioUrl(track.id);
      audioElement.src = audioUrl;

      audioElement.addEventListener('canplaythrough', () => {
        this.bufferedTracks.set(track.id, {
          audioElement,
          bufferedAt: new Date(),
          duration: audioElement.duration
        });
        console.log(`Buffer em background completo: ${track.title}`);
      });

      audioElement.addEventListener('error', (error) => {
        console.warn(`Erro no buffer em background de ${track.title}:`, error);
      });

      audioElement.load();
    } catch (error) {
      console.warn(`Erro ao iniciar buffer em background de ${track.title}:`, error);
    }
  }

  // Verifica se uma faixa está em buffer
  isTrackBuffered(trackId) {
    return this.bufferedTracks.has(trackId);
  }

  // Obtém o elemento de áudio bufferizado
  getBufferedAudio(trackId) {
    const bufferedTrack = this.bufferedTracks.get(trackId);
    return bufferedTrack?.audioElement || null;
  }

  // Limpa o buffer de uma faixa específica
  clearTrackBuffer(trackId) {
    const bufferedTrack = this.bufferedTracks.get(trackId);
    if (bufferedTrack?.audioElement) {
      bufferedTrack.audioElement.pause();
      bufferedTrack.audioElement.src = '';
      bufferedTrack.audioElement.load();
    }
    this.bufferedTracks.delete(trackId);
  }

  // Limpa todo o buffer
  clearAllBuffers() {
    this.bufferedTracks.forEach((bufferedTrack, trackId) => {
      this.clearTrackBuffer(trackId);
    });
    this.bufferedTracks.clear();
  }

  // Obtém informações do buffer
  getBufferInfo() {
    const bufferedTracks = Array.from(this.bufferedTracks.keys());
    const totalBufferedTime = Array.from(this.bufferedTracks.values())
      .reduce((total, track) => total + (track.duration || 0), 0);

    return {
      bufferedTracks,
      totalBufferedTime,
      bufferSize: this.bufferSize,
      isBuffering: this.isBuffering,
      bufferProgress: this.bufferProgress
    };
  }

  // Configura callbacks
  setCallbacks({ onProgress, onComplete, onError }) {
    this.onBufferProgress = onProgress;
    this.onBufferComplete = onComplete;
    this.onBufferError = onError;
  }

  // Limpa callbacks
  clearCallbacks() {
    this.onBufferProgress = null;
    this.onBufferComplete = null;
    this.onBufferError = null;
  }
}

// Exporta uma única instância
const audioBufferService = new AudioBufferService();
export default audioBufferService; 