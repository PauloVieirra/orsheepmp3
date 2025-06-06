import { setupMediaSession, updateMediaSessionState, updatePositionState } from './MediaSessionService'

class AudioService {
  constructor() {
    this.player = null
    this.wakeLock = null
    this.audioContext = null
    this.onStateChange = null
    this.backgroundPlayEnabled = false
  }

  async initialize() {
    // Inicializa o contexto de áudio (necessário para alguns navegadores)
    if (!this.audioContext && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }

    // Solicita permissão para manter a tela ativa
    await this.requestWakeLock()

    // Configura handlers para eventos do sistema
    this.setupSystemEvents()

    // Carrega a configuração de reprodução em segundo plano
    this.loadBackgroundPlaySettings()
  }

  loadBackgroundPlaySettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
      this.backgroundPlayEnabled = settings.backgroundPlay ?? true
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      this.backgroundPlayEnabled = true
    }
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator && this.backgroundPlayEnabled) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen')
        console.log('Wake Lock ativado')
      } catch (err) {
        console.log('Wake Lock não suportado:', err)
      }
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release()
        this.wakeLock = null
        console.log('Wake Lock liberado')
      } catch (err) {
        console.error('Erro ao liberar Wake Lock:', err)
      }
    }
  }

  setupSystemEvents() {
    // Reconecta o wakeLock quando a tela é reativada
    document.addEventListener('visibilitychange', async () => {
      if (this.backgroundPlayEnabled) {
        if (document.visibilityState === 'visible' && !this.wakeLock) {
          await this.requestWakeLock()
        } else if (document.visibilityState === 'hidden') {
          // Mantém a reprodução em segundo plano
          if (this.player && this.player.isPlaying()) {
            // Notifica o service worker
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'BACKGROUND_AUDIO',
                payload: { 
                  title: this.player.getCurrentTrack()?.title,
                  playing: true
                }
              })
            }
          }
        }
      }
    })

    // Trata eventos de áudio do sistema
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.onStateChange?.({ type: 'play' })
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        this.onStateChange?.({ type: 'pause' })
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.onStateChange?.({ type: 'previous' })
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.onStateChange?.({ type: 'next' })
      })
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        this.onStateChange?.({ type: 'seek', time: details.seekTime })
      })
    }
  }

  setBackgroundPlayEnabled(enabled) {
    this.backgroundPlayEnabled = enabled
    if (enabled) {
      this.requestWakeLock()
    } else {
      this.releaseWakeLock()
    }

    // Salva a configuração
    try {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
      settings.backgroundPlay = enabled
      localStorage.setItem('appSettings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  setPlayer(player) {
    this.player = player
  }

  setOnStateChange(callback) {
    this.onStateChange = callback
  }

  updateMediaInfo(track, playing) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'OrSheep Music',
        artwork: [
          {
            src: `https://img.youtube.com/vi/${track.id}/maxresdefault.jpg`,
            sizes: '1280x720',
            type: 'image/jpeg'
          }
        ]
      })
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    }
  }

  updatePosition(currentTime, duration) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: currentTime
      })
    }
  }

  cleanup() {
    if (this.wakeLock) {
      this.wakeLock.release()
      this.wakeLock = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// Exporta uma única instância
const audioService = new AudioService()
export default audioService 