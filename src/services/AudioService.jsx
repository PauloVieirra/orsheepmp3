import { setupMediaSession, updateMediaSessionState, updatePositionState } from './MediaSessionService'

class AudioService {
  constructor() {
    this.player = null
    this.wakeLock = null
    this.audioContext = null
    this.onStateChange = null
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
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.log('Wake Lock não suportado:', err)
      }
    }
  }

  setupSystemEvents() {
    // Reconecta o wakeLock quando a tela é reativada
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && !this.wakeLock) {
        await this.requestWakeLock()
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
    }
  }

  setPlayer(player) {
    this.player = player
  }

  setOnStateChange(callback) {
    this.onStateChange = callback
  }

  updateMediaInfo(track, isPlaying) {
    if (track) {
      setupMediaSession({
        title: track.title,
        artist: 'YouTube Music',
        artwork: `https://img.youtube.com/vi/${track.id}/maxresdefault.jpg`,
        onPlay: () => this.onStateChange?.({ type: 'play' }),
        onPause: () => this.onStateChange?.({ type: 'pause' }),
        onPrevious: () => this.onStateChange?.({ type: 'previous' }),
        onNext: () => this.onStateChange?.({ type: 'next' }),
        onSeekTo: ({ seekTime }) => this.onStateChange?.({ type: 'seek', time: seekTime })
      })
      updateMediaSessionState(isPlaying ? 'playing' : 'paused')
    }
  }

  updatePosition(currentTime, duration) {
    updatePositionState({
      duration,
      currentTime,
      playbackRate: 1
    })
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

export default new AudioService() 