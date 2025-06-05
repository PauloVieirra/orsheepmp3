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

      // Iniciar o download
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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Criar link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Limpar URL
      window.URL.revokeObjectURL(url);

      // Salvar informações da música baixada
      await this.saveOfflineTrack(track);
      
      return { success: true, message: 'Download concluído com sucesso!' };
    } catch (error) {
      console.error('Erro ao baixar música:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao baixar música. Verifique sua conexão e tente novamente.' 
      };
    }
  }
}

export default new DownloadService(); 
