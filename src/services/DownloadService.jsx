class DownloadService {
  constructor() {
    this.offlineTracks = []
    // URL base do servidor backend
    this.baseUrl = 'http://localhost:5000';
  }

  // Função para gerar um tamanho aleatório entre 3 e 8 MB
  generateFileSize() {
    return (Math.random() * (8 - 3) + 3).toFixed(1);
  }

  // Função para formatar o tamanho em MB
  formatFileSize(size) {
    return `${size} MB`
  }

  async isTrackDownloaded(trackId) {
    const offlineTracks = await this.getOfflineTracks();
    return offlineTracks.some(track => track.id === trackId);
  }

  async getOfflineTracks() {
    const tracks = localStorage.getItem('offlineTracks');
    return tracks ? JSON.parse(tracks) : [];
  }

  async saveOfflineTrack(track) {
    const offlineTracks = await this.getOfflineTracks();
    
    if (!offlineTracks.some(t => t.id === track.id)) {
      const updatedTracks = [...offlineTracks, {
        ...track,
        downloadDate: new Date().toISOString(),
        fileSize: this.generateFileSize()
      }];
      localStorage.setItem('offlineTracks', JSON.stringify(updatedTracks));
    }
  }

  // IndexedDB helpers
  openDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('OfflineMusicDB', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTrackBlob(trackId, blob) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.put({ id: trackId, blob });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getTrackBlob(trackId) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteTrackBlob(trackId) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.delete(trackId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

 

  async convertToMp3(inputBlob, inputName = 'input.webm', outputName = 'output.mp3') {
    const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg')
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js' // CDN fallback
    })

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }
    ffmpeg.FS('writeFile', inputName, await fetchFile(inputBlob))
    await ffmpeg.run('-i', inputName, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', outputName)
    const data = ffmpeg.FS('readFile', outputName)
    // Limpa arquivos temporários
    ffmpeg.FS('unlink', inputName)
    ffmpeg.FS('unlink', outputName)
    return new Blob([data.buffer], { type: 'audio/mp3' })
  }

  async downloadMusic(track) {
    try {
      // Verificar se já está baixada
      const isDownloaded = await this.isTrackDownloaded(track.id);
      if (isDownloaded) {
        return { success: true, message: 'Música já está baixada' };
      }
      // Verificar se o servidor está online
      try {
        const healthCheck = await fetch(`${this.baseUrl}/health`);
        if (!healthCheck.ok) throw new Error('Servidor indisponível');
      } catch (error) {
        console.error('Erro de conexão com o servidor:', error);
        return { 
          success: false, 
          message: 'Não foi possível conectar ao servidor. Verifique se o servidor backend está em execução.' 
        };
      }
      // Iniciar o download do áudio bruto
      const response = await fetch(`${this.baseUrl}/download/${track.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: track.title
        })
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro no servidor: ${errorMessage}`);
      }
      const inputBlob = await response.blob();
      // Converter para MP3 usando ffmpeg.wasm
      const mp3Blob = await this.convertToMp3(inputBlob)
      // Salvar blob MP3 no IndexedDB
      await this.saveTrackBlob(track.id, mp3Blob);
      // Salvar informações da música baixada
      await this.saveOfflineTrack(track);
      return { success: true, message: 'Download e conversão concluídos com sucesso!' };
    } catch (error) {
      console.error('Erro ao baixar/converter música:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao baixar/converter música. Verifique sua conexão e tente novamente.' 
      };
    }
  }

  async deleteOfflineTrack(trackId) {
    // Remove do localStorage
    const offlineTracks = await this.getOfflineTracks();
    const updatedTracks = offlineTracks.filter(t => t.id !== trackId);
    localStorage.setItem('offlineTracks', JSON.stringify(updatedTracks));
    // Remove do IndexedDB
    await this.deleteTrackBlob(trackId);
  }
}

export default new DownloadService(); 
