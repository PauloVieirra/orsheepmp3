import { setupMediaSession, updateMediaSessionState, updatePositionState } from './MediaSessionService'
import React, { useState, useRef, useEffect } from 'react';

class AudioService {
  constructor() {
    this.player = null
    this.wakeLock = null
    this.audioContext = null
    this.onStateChange = null
    this.backgroundPlayEnabled = false
  }

  async initialize() {
    // Carrega configurações salvas
    try {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
      this.backgroundPlayEnabled = settings.backgroundPlay || false
      if (this.backgroundPlayEnabled) {
        await this.requestWakeLock()
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }

    // Inicializa o contexto de áudio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.error('Erro ao inicializar contexto de áudio:', error)
    }

    this.setupSystemEvents()
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen')
        
        // Adiciona listener para reaquirir o wakeLock quando a tela é reativada
        this.wakeLock.addEventListener('release', async () => {
          if (this.backgroundPlayEnabled && document.visibilityState !== 'hidden') {
            await this.requestWakeLock()
          }
        })
        
        return true
      } catch (error) {
        console.error('Erro ao solicitar wakeLock:', error)
        return false
      }
    }
    return false
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release()
        this.wakeLock = null
      } catch (error) {
        console.error('Erro ao liberar wakeLock:', error)
      }
    }
  }

  setupSystemEvents() {
    // Reconecta o wakeLock quando a tela é reativada
    document.addEventListener('visibilitychange', async () => {
      if (this.backgroundPlayEnabled) {
        if (document.visibilityState === 'visible' && !this.wakeLock) {
          await this.requestWakeLock()
        }
        
        // Mantém a reprodução em segundo plano independente do estado da tela
        if (this.player && this.player.getInternalPlayer()) {
          const isPlaying = this.player.getInternalPlayer().getPlayerState() === 1
          
          // Notifica o service worker
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'BACKGROUND_AUDIO',
              payload: { 
                title: this.player.getCurrentTrack()?.title,
                playing: isPlaying
              }
            })
          }

          // Se estiver tocando, garante que continue tocando
          if (isPlaying) {
            this.player.getInternalPlayer().playVideo()
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