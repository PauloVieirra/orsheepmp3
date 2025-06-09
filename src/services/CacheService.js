import localforage from 'localforage'

class CacheService {
  constructor() {
    this.musicStore = localforage.createInstance({
      name: 'orsheepmp3',
      storeName: 'musicCache',
      description: 'Cache de músicas offline'
    })
  }

  async init() {
    try {
      await this.musicStore.ready()
      return true
    } catch (error) {
      console.error('Erro ao inicializar CacheService:', error)
      return false
    }
  }

  async saveMusic(track, audioBlob) {
    if (!track || !audioBlob) return false

    try {
      const musicData = {
        id: track.id,
        title: track.title,
        downloadDate: new Date().toISOString(),
        size: audioBlob.size,
        blob: audioBlob
      }
      await this.musicStore.setItem(track.id, musicData)
      return true
    } catch (error) {
      console.error('Erro ao salvar música no cache:', error)
      return false
    }
  }

  async getMusic(trackId) {
    if (!trackId) return null

    try {
      return await this.musicStore.getItem(trackId)
    } catch (error) {
      console.error('Erro ao buscar música do cache:', error)
      return null
    }
  }

  async getAllMusic() {
    const tracks = []
    try {
      await this.musicStore.iterate((value) => {
        if (value) {
          // Não inclui o blob para economizar memória
          const { blob, ...trackInfo } = value
          tracks.push(trackInfo)
        }
      })
      return tracks
    } catch (error) {
      console.error('Erro ao listar músicas do cache:', error)
      return []
    }
  }

  async deleteMusic(trackId) {
    if (!trackId) return false

    try {
      await this.musicStore.removeItem(trackId)
      return true
    } catch (error) {
      console.error('Erro ao deletar música do cache:', error)
      return false
    }
  }

  async clearCache() {
    try {
      await this.musicStore.clear()
      return true
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      return false
    }
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }
}

const cacheService = new CacheService()
cacheService.init().catch(console.error)

export default cacheService 