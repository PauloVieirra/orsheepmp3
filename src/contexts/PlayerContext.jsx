import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useStorage } from './StorageContext'
import { useNavigate } from 'react-router-dom'
import ErrorNotification from '../components/ErrorNotification'
import BufferProgress from '../components/BufferProgress'
import { setupMediaSession, updateMediaSessionState, updatePositionState } from '../services/MediaSessionService'
import audioBufferService from '../services/AudioBufferService'
import audioService from '../services/AudioService'

const PlayerContext = createContext({})

export const PlayerProvider = ({ children }) => {
  const navigate = useNavigate()
  const { saveRecentTracks, getRecentTracks, savePlaylists, getPlaylists: getStoragePlaylists, getSettings, saveSettings } = useStorage()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [backgroundPlay, setBackgroundPlay] = useState(false)
  const [queue, setQueue] = useState([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [userAction, setUserAction] = useState(null)
  const [lastPlayedTime, setLastPlayedTime] = useState(0)
  const [playerInstance, setPlayerInstance] = useState(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState(null)
  
  // Estados do buffer
  const [isBuffering, setIsBuffering] = useState(false)
  const [bufferProgress, setBufferProgress] = useState(0)
  const [showBufferProgress, setShowBufferProgress] = useState(false)
  const [bufferInfo, setBufferInfo] = useState(null)
  
  const playerRef = useRef(null)

  useEffect(() => {
    loadSettings()
    setupBufferCallbacks()
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Quando a página volta a ficar visível, atualiza o estado do player
        if (playerInstance) {
          const playerState = playerInstance.getPlayerState()
          setIsPlaying(playerState === 1)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [playerInstance])

  const loadSettings = async () => {
    try {
      const settings = await getSettings()
      setAutoPlay(settings?.autoPlay ?? false)
      setVolume(settings?.volume ?? 1)
      setBackgroundPlay(settings?.backgroundPlay ?? false)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const toggleAutoPlay = useCallback(async () => {
    try {
      const newValue = !autoPlay
      setAutoPlay(newValue)
      const settings = await getSettings()
      await saveSettings({ ...settings, autoPlay: newValue })
    } catch (error) {
      console.error('Erro ao salvar configuração de autoPlay:', error)
    }
  }, [autoPlay, getSettings, saveSettings])

  const handleProgress = useCallback(({ playedSeconds }) => {
    setCurrentTime(playedSeconds)
    setProgress(playedSeconds / duration)
    // Atualiza a posição no MediaSession
    updatePositionState({
      duration,
      currentTime: playedSeconds,
      playbackRate: 1
    })
  }, [duration])

  const handleDuration = useCallback((duration) => {
    setDuration(duration)
  }, [])

  const togglePlay = useCallback((forcedState) => {
    const newState = typeof forcedState === 'boolean' ? forcedState : !isPlaying
    setIsPlaying(newState)
    
    if (playerInstance) {
      if (newState) {
        playerInstance.playVideo()
      } else {
        playerInstance.pauseVideo()
      }
    }
  }, [isPlaying, playerInstance])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handlePlayerError = useCallback((errorCode) => {
    let errorMessage = 'Ops, houve um erro aqui. Tente outra música ou volte mais tarde.'
    setError(errorMessage)
    setIsPlaying(false)
    
    // Se estiver em uma playlist, tenta passar para a próxima música
    if (queue.length > currentQueueIndex + 1) {
      setTimeout(() => {
        const nextIndex = currentQueueIndex + 1
        const nextTrack = queue[nextIndex]
        if (nextTrack) {
          setCurrentQueueIndex(nextIndex)
          playTrack(nextTrack, true, queue, nextIndex)
          clearError()
        }
      }, 2000)
    }
  }, [queue, currentQueueIndex, clearError])

  const seekTo = useCallback((time) => {
    if (playerInstance) {
      playerInstance.seekTo(time)
      setCurrentTime(time)
    }
    setProgress(time / duration)
    return time
  }, [playerInstance, duration])

  const updateCurrentIndex = useCallback((track) => {
    const queueIndex = queue.findIndex(t => t.id === track.id)
    if (queueIndex !== -1) {
      setCurrentQueueIndex(queueIndex)
    }
  }, [queue])

  const handleSetQueue = useCallback((tracks) => {
    setQueue(tracks)
    setCurrentQueueIndex(0)
  }, [])

  // Configura os callbacks do buffer
  const setupBufferCallbacks = useCallback(() => {
    audioBufferService.setCallbacks({
      onProgress: (progress) => {
        setBufferProgress(progress)
        setShowBufferProgress(true)
      },
      onComplete: (track) => {
        setIsBuffering(false)
        setBufferProgress(100)
        setShowBufferProgress(false)
        updateBufferInfo()
        console.log(`Buffer completo para: ${track.title}`)
      },
      onError: (track, error) => {
        setIsBuffering(false)
        setShowBufferProgress(false)
        console.error(`Erro no buffer de ${track.title}:`, error)
      }
    })
  }, [])

  // Atualiza informações do buffer
  const updateBufferInfo = useCallback(() => {
    const info = audioBufferService.getBufferInfo()
    setBufferInfo(info)
  }, [])

  // Inicia o buffer para uma faixa
  const startBuffer = useCallback(async (track, queueTracks = []) => {
    if (!track) return
    setIsBuffering(true)
    setBufferProgress(0)
    setShowBufferProgress(true)
    try {
      await audioBufferService.startBuffer(track, queueTracks)
    } catch (error) {
      console.error('Erro ao iniciar buffer:', error)
      setIsBuffering(false)
      setShowBufferProgress(false)
    }
  }, [])

  // Verifica se uma faixa está em buffer
  const isTrackBuffered = useCallback((trackId) => {
    return audioBufferService.isTrackBuffered(trackId)
  }, [])

  // Obtém áudio bufferizado
  const getBufferedAudio = useCallback((trackId) => {
    return audioBufferService.getBufferedAudio(trackId)
  }, [])

  // Limpa buffer de uma faixa
  const clearTrackBuffer = useCallback((trackId) => {
    audioBufferService.clearTrackBuffer(trackId)
    updateBufferInfo()
  }, [updateBufferInfo])

  // Limpa todo o buffer
  const clearAllBuffers = useCallback(() => {
    audioBufferService.clearAllBuffers()
    updateBufferInfo()
  }, [updateBufferInfo])

  // Fecha o painel de progresso do buffer
  const closeBufferProgress = useCallback(() => {
    setShowBufferProgress(false)
  }, [])

  const playTrack = useCallback(async (track, shouldAutoPlay = true, playlistTracks = [], index = -1, shouldNavigate = false) => {
    try {
      clearError()
      const isSameTrack = currentTrack?.id === track.id
      
      if (isSameTrack) {
        togglePlay(shouldAutoPlay)
        return
      }

      // Limpa o estado anterior
      if (playerInstance) {
        playerInstance.stopVideo()
      }
      
      // Reseta o estado do player
      setCurrentTrack(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setLastPlayedTime(0)
      setProgress(0)
      
      // Pequeno delay para garantir que o estado anterior foi limpo
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Define o novo estado
      setCurrentTrack(track)
      setIsPlaying(shouldAutoPlay)
      
      if (playlistTracks.length > 0) {
        setQueue(playlistTracks)
        setCurrentQueueIndex(index)
      } else {
        setQueue([track])
        setCurrentQueueIndex(0)
      }

      // Salvar na lista de reprodução recente
      const recentTracks = await getRecentTracks() || []
      const updatedRecentTracks = [track, ...(recentTracks.filter(t => t?.id !== track.id) || [])].slice(0, 20)
      await saveRecentTracks(updatedRecentTracks)

      // Persiste o estado atual
      localStorage.setItem('currentPlayerState', JSON.stringify({
        track,
        isPlaying: shouldAutoPlay,
        queue: playlistTracks.length > 0 ? playlistTracks : [track],
        currentQueueIndex: index >= 0 ? index : 0
      }))

      // Inicia o buffer para a faixa atual e próximas faixas
      const queueToBuffer = playlistTracks.length > 0 ? playlistTracks : [track]
      startBuffer(track, queueToBuffer)

      // Se o player já estiver pronto, inicia a reprodução imediatamente
      if (playerInstance) {
        playerInstance.loadVideoById({
          videoId: track.id,
          startSeconds: 0,
          suggestedQuality: 'small'
        })
        
        if (shouldAutoPlay) {
          // Sistema de retry mais agressivo para iniciar a reprodução
          let retryCount = 0
          const maxRetries = 10
          
          const tryPlay = () => {
            try {
              if (retryCount >= maxRetries) return
              
              playerInstance.playVideo()
              const state = playerInstance.getPlayerState()
              
              if (state !== 1) {
                retryCount++
                setTimeout(tryPlay, 100)
              }
            } catch (error) {
              console.error('Erro ao iniciar reprodução:', error)
              retryCount++
              setTimeout(tryPlay, 100)
            }
          }
          
          tryPlay()
        }
      }
    } catch (error) {
      console.error('Erro ao reproduzir vídeo:', error)
      handlePlayerError()
    }
  }, [currentTrack, playerInstance, isPlaying, clearError, getRecentTracks, saveRecentTracks, handlePlayerError, togglePlay, startBuffer])

  const nextTrack = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex < queue.length - 1) {
      const nextIndex = currentQueueIndex + 1
      setCurrentQueueIndex(nextIndex)
      const nextTrack = queue[nextIndex]
      if (nextTrack) {
        playTrack(nextTrack, true, queue, nextIndex)
      }
    }
  }, [queue, currentQueueIndex, playTrack])

  const previousTrack = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1
      setCurrentQueueIndex(prevIndex)
      const prevTrack = queue[prevIndex]
      if (prevTrack) {
        playTrack(prevTrack, true, queue, prevIndex)
      }
    }
  }, [queue, currentQueueIndex, playTrack])

  const playPlaylist = useCallback((playlist) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
      console.warn('Playlist vazia ou inválida')
      return
    }

    setCurrentPlaylist(playlist)
    setQueue(playlist.tracks)
    setCurrentQueueIndex(0)
    playTrack(playlist.tracks[0], true, playlist.tracks, 0, false)
  }, [playTrack])

  const addToPlaylist = useCallback(async (track, playlistId) => {
    const playlists = await getStoragePlaylists()
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          tracks: [...playlist.tracks, track]
        }
      }
      return playlist
    })
    await savePlaylists(updatedPlaylists)
    return updatedPlaylists
  }, [getStoragePlaylists, savePlaylists])

  const createPlaylist = useCallback(async (name) => {
    const playlists = await getStoragePlaylists()
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: []
    }
    const updatedPlaylists = [...playlists, newPlaylist]
    await savePlaylists(updatedPlaylists)
    return newPlaylist
  }, [getStoragePlaylists, savePlaylists])

  const getPlaylists = useCallback(async () => {
    return await getStoragePlaylists()
  }, [getStoragePlaylists])

  const setupMediaSessionHandlers = useCallback(() => {
    if ('mediaSession' in navigator) {
      setupMediaSession({
        title: currentTrack?.title || '',
        artist: currentTrack?.artist || 'YouTube Music',
        artwork: currentTrack ? `https://img.youtube.com/vi/${currentTrack.id}/maxresdefault.jpg` : '',
        onPlay: () => togglePlay(true),
        onPause: () => togglePlay(false),
        onPrevious: previousTrack,
        onNext: nextTrack,
        onSeekTo: (time) => seekTo(time)
      })
    }
  }, [currentTrack, togglePlay, previousTrack, nextTrack, seekTo])

  useEffect(() => {
    if (currentTrack) {
      setupMediaSessionHandlers()
    }
  }, [currentTrack, setupMediaSessionHandlers])

  const onPlayerReady = useCallback((player) => {
    console.log('Player ready')
    playerRef.current = player
    const internalPlayer = player.getInternalPlayer()
    setPlayerInstance(internalPlayer)
    
    // Configura o player para permitir reprodução em segundo plano
    if (internalPlayer) {
      // Força configurações para reprodução em segundo plano
      internalPlayer.setPlaybackQuality('small')
      internalPlayer.setPlaybackRate(1)
      internalPlayer.setPlaybackQualityRange('small', 'small')
      
      // Configura o player para manter a reprodução em segundo plano
      try {
        internalPlayer.setOption('playerVars', {
          'autoplay': 1,
          'playsinline': 1,
          'controls': 0,
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1,
          'enablejsapi': 1,
          'origin': window.location.origin,
          'widget_referrer': window.location.href
        })
      } catch (error) {
        console.error('Erro ao configurar player:', error)
      }
    }
    
    // Se houver uma música atual, carrega ela
    if (currentTrack) {
      internalPlayer.loadVideoById({
        videoId: currentTrack.id,
        startSeconds: 0,
        suggestedQuality: 'small'
      })
      if (isPlaying) {
        // Força o início da reprodução com múltiplas tentativas
        const tryPlay = () => {
          try {
            internalPlayer.playVideo()
            // Verifica se realmente começou a tocar
            if (internalPlayer.getPlayerState() !== 1) {
              setTimeout(tryPlay, 50)
            }
          } catch (error) {
            console.error('Erro ao iniciar reprodução:', error)
            setTimeout(tryPlay, 50)
          }
        }
        tryPlay()
      }
    }
  }, [currentTrack, isPlaying])

  const handlePlayerStateChange = useCallback((state) => {
    console.log('Player state changed:', state)
    
    // YouTube player states:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    switch (state) {
      case -1: // unstarted
        if (isPlaying && playerInstance) {
          // Sistema de retry mais agressivo para iniciar a reprodução
          let retryCount = 0
          const maxRetries = 30 // Aumentado para mais tentativas
          
          const tryPlay = () => {
            try {
              if (retryCount >= maxRetries) return
              
              playerInstance.playVideo()
              const currentState = playerInstance.getPlayerState()
              
              if (currentState !== 1) {
                retryCount++
                setTimeout(tryPlay, 50)
              }
            } catch (error) {
              console.error('Erro ao iniciar reprodução:', error)
              retryCount++
              setTimeout(tryPlay, 50)
            }
          }
          
          tryPlay()
        }
        break
      case 0: // ended
        setIsPlaying(false)
        updateMediaSessionState('none')
        // Verifica se há próxima música e se auto play está ativado
        if (queue.length > currentQueueIndex + 1 && autoPlay) {
          // Força a reprodução da próxima música imediatamente
          const nextIndex = currentQueueIndex + 1
          const nextTrack = queue[nextIndex]
          if (nextTrack) {
            setCurrentQueueIndex(nextIndex)
            // Força a reprodução imediata
            if (playerInstance) {
              // Carrega o próximo vídeo com configurações otimizadas
              playerInstance.loadVideoById({
                videoId: nextTrack.id,
                startSeconds: 0,
                suggestedQuality: 'small'
              })
              
              // Sistema de retry mais agressivo para iniciar a reprodução
              let retryCount = 0
              const maxRetries = 30
              
              const tryPlay = () => {
                try {
                  if (retryCount >= maxRetries) return
                  
                  playerInstance.playVideo()
                  const currentState = playerInstance.getPlayerState()
                  
                  if (currentState !== 1) {
                    retryCount++
                    setTimeout(tryPlay, 50)
                  }
                } catch (error) {
                  console.error('Erro ao iniciar reprodução:', error)
                  retryCount++
                  setTimeout(tryPlay, 50)
                }
              }
              
              tryPlay()
            }
            playTrack(nextTrack, true, queue, nextIndex)
          }
        }
        break
      case 1: // playing
        setIsPlaying(true)
        updateMediaSessionState('playing')
        clearError()
        break
      case 2: // paused
        setIsPlaying(false)
        updateMediaSessionState('paused')
        break
      case 3: // buffering
        // Mantém o estado de reprodução
        break
      case 5: // video cued
        if (isPlaying && playerInstance) {
          // Sistema de retry mais agressivo para iniciar a reprodução
          let retryCount = 0
          const maxRetries = 30
          
          const tryPlay = () => {
            try {
              if (retryCount >= maxRetries) return
              
              playerInstance.playVideo()
              const currentState = playerInstance.getPlayerState()
              
              if (currentState !== 1) {
                retryCount++
                setTimeout(tryPlay, 50)
              }
            } catch (error) {
              console.error('Erro ao iniciar reprodução:', error)
              retryCount++
              setTimeout(tryPlay, 50)
            }
          }
          
          tryPlay()
        }
        break
    }
  }, [isPlaying, playerInstance, queue, currentQueueIndex, autoPlay, playTrack, clearError])

  const onEnded = useCallback(() => {
    // Verifica se há próxima música e se auto play está ativado
    if (queue.length > 0 && currentQueueIndex < queue.length - 1 && autoPlay) {
      // Força a reprodução da próxima música imediatamente
      const nextIndex = currentQueueIndex + 1
      const nextTrack = queue[nextIndex]
      if (nextTrack) {
        setCurrentQueueIndex(nextIndex)
        // Força a reprodução imediata
        if (playerInstance) {
          // Carrega o próximo vídeo com configurações otimizadas
          playerInstance.loadVideoById({
            videoId: nextTrack.id,
            startSeconds: 0,
            suggestedQuality: 'small'
          })
          
          // Sistema de retry mais agressivo para iniciar a reprodução
          let retryCount = 0
          const maxRetries = 30
          
          const tryPlay = () => {
            try {
              if (retryCount >= maxRetries) return
              
              playerInstance.playVideo()
              const currentState = playerInstance.getPlayerState()
              
              if (currentState !== 1) {
                retryCount++
                setTimeout(tryPlay, 50)
              }
            } catch (error) {
              console.error('Erro ao iniciar reprodução:', error)
              retryCount++
              setTimeout(tryPlay, 50)
            }
          }
          
          tryPlay()
        }
        playTrack(nextTrack, true, queue, nextIndex)
      }
    } else {
      setIsPlaying(false)
      updateMediaSessionState('none')
    }
  }, [queue, currentQueueIndex, autoPlay, playTrack, playerInstance])

  const changeVolume = useCallback(async (value) => {
    try {
      setVolume(value)
      const settings = await getSettings()
      await saveSettings({ ...settings, volume: value })
    } catch (error) {
      console.error('Erro ao salvar configuração de volume:', error)
    }
  }, [getSettings, saveSettings])

  const removeTrack = useCallback(async (trackId) => {
    if (window.confirm('Tem certeza que deseja remover esta música da playlist?')) {
      if (currentPlaylist) {
        // Se a música está em uma playlist, remove da playlist
        const playlists = await getStoragePlaylists()
        const updatedPlaylists = playlists.map(playlist => {
          if (playlist.id === currentPlaylist.id) {
            return {
              ...playlist,
              tracks: playlist.tracks.filter(track => track.id !== trackId)
            }
          }
          return playlist
        })

        await savePlaylists(updatedPlaylists)
        
        // Atualiza a playlist atual
        const updatedCurrentPlaylist = updatedPlaylists.find(p => p.id === currentPlaylist.id)
        setCurrentPlaylist(updatedCurrentPlaylist)
        
        // Atualiza a fila
        if (updatedCurrentPlaylist) {
          setQueue(updatedCurrentPlaylist.tracks)
        }
      } else {
        // Se não está em uma playlist, apenas remove da fila
        setQueue(prevQueue => prevQueue.filter(track => track.id !== trackId))
      }

      // Se a música removida é a atual
      if (currentTrack?.id === trackId) {
        setIsPlaying(false)
        setCurrentTrack(null)
        navigate('/')
      }
    }
  }, [currentPlaylist, currentTrack, getStoragePlaylists, savePlaylists, navigate])

  const deleteTrack = useCallback(async (trackId) => {
    if (!trackId) return false

    try {
      // 1. Remove de todas as playlists
      const playlists = await getStoragePlaylists() || []
      const updatedPlaylists = playlists.map(playlist => ({
        ...playlist,
        tracks: playlist.tracks.filter(track => track.id !== trackId)
      }))
      await savePlaylists(updatedPlaylists)

      // 2. Remove do localStorage
      const storageKeys = [
        'favoriteTracks',
        'recentTracks',
        'lastSearchResults',
        'currentPlayerState'
      ]

      storageKeys.forEach(key => {
        try {
          const items = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(items)) {
            const filtered = items.filter(item => item?.id !== trackId)
            localStorage.setItem(key, JSON.stringify(filtered))
          }
        } catch (e) {
          console.warn(`Erro ao processar ${key}:`, e)
        }
      })

      // 3. Se for a música atual, limpa o player
      if (currentTrack?.id === trackId) {
        setIsPlaying(false)
        setCurrentTrack(null)
        setCurrentTime(0)
        setDuration(0)
      }

      // 4. Remove da fila atual
      setQueue(prevQueue => prevQueue.filter(track => track.id !== trackId))

      return true
    } catch (error) {
      console.error('Erro ao excluir música:', error)
      return false
    }
  }, [currentTrack, getStoragePlaylists, savePlaylists])

  const removeTrackFromPlaylist = useCallback(async (trackId, playlistId) => {
    try {
      // Busca todas as playlists
      const playlists = await getStoragePlaylists()
      
      // Encontra a playlist específica
      const playlistToUpdate = playlists.find(p => p.id === playlistId)
      if (!playlistToUpdate) return

      // Remove a música da playlist
      const updatedTracks = playlistToUpdate.tracks.filter(track => track.id !== trackId)
      const updatedPlaylist = { ...playlistToUpdate, tracks: updatedTracks }
      
      // Atualiza a lista de playlists
      const updatedPlaylists = playlists.map(p => 
        p.id === playlistId ? updatedPlaylist : p
      )
      
      // Salva as playlists atualizadas
      await savePlaylists(updatedPlaylists)

      // Se a playlist atual é a mesma da qual a música foi removida
      if (currentPlaylist?.id === playlistId) {
        // Atualiza a playlist atual
        setCurrentPlaylist(updatedPlaylist)
        
        // Se a música removida está na fila de reprodução, atualiza a fila
        if (queue.some(track => track.id === trackId)) {
          const updatedQueue = queue.filter(track => track.id !== trackId)
          setQueue(updatedQueue)
          
          // Se a música removida está antes da música atual, ajusta o índice
          if (currentQueueIndex > 0) {
            const removedBefore = queue.findIndex(track => track.id === trackId) < currentQueueIndex
            if (removedBefore) {
              setCurrentQueueIndex(prev => prev - 1)
            }
          }
          
          // Se a música atual foi removida, passa para a próxima
          if (currentTrack?.id === trackId) {
            const nextTrackIndex = currentQueueIndex
            const nextTrack = updatedQueue[nextTrackIndex]
            
            if (nextTrack) {
              playTrack(nextTrack, true, updatedQueue, nextTrackIndex)
            } else if (updatedQueue.length > 0) {
              // Se não há próxima música no índice atual, volta para o início
              playTrack(updatedQueue[0], true, updatedQueue, 0)
            } else {
              // Se não há mais músicas, limpa o player
              setCurrentTrack(null)
              setIsPlaying(false)
              setCurrentQueueIndex(-1)
              if (playerInstance) {
                playerInstance.stopVideo()
              }
            }
          }
        }
      }

      return updatedPlaylists
    } catch (error) {
      console.error('Erro ao remover música da playlist:', error)
      return null
    }
  }, [currentPlaylist, queue, currentQueueIndex, currentTrack, playerInstance, getStoragePlaylists, savePlaylists, playTrack])

  const toggleBackgroundPlay = useCallback(async () => {
    try {
      const newValue = !backgroundPlay
      setBackgroundPlay(newValue)
      audioService.setBackgroundPlayEnabled(newValue)
      const settings = await getSettings()
      await saveSettings({ ...settings, backgroundPlay: newValue })
    } catch (error) {
      console.error('Erro ao salvar configuração de backgroundPlay:', error)
    }
  }, [backgroundPlay, getSettings, saveSettings])

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    currentPlaylist,
    currentTrackIndex,
    autoPlay,
    shuffle,
    backgroundPlay,
    playTrack,
    togglePlay,
    seekTo,
    nextTrack,
    previousTrack,
    playPlaylist,
    addToPlaylist,
    createPlaylist,
    getPlaylists,
    toggleAutoPlay,
    toggleBackgroundPlay,
    toggleShuffle: () => setShuffle(prev => !prev),
    queue,
    setQueue: handleSetQueue,
    onPlayerReady,
    onPlayerStateChange: handlePlayerStateChange,
    onProgress: handleProgress,
    onDuration: handleDuration,
    currentQueueIndex,
    progress,
    volume,
    onEnded,
    changeVolume,
    removeTrack,
    handlePlayerError,
    removeTrackFromPlaylist,
    hasQueue: queue.length > 1,
    isBuffering,
    bufferProgress,
    showBufferProgress,
    bufferInfo,
    startBuffer,
    isTrackBuffered,
    getBufferedAudio,
    clearTrackBuffer,
    clearAllBuffers,
    closeBufferProgress
  }
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
      {error && (
        <ErrorNotification
          message={error}
          onClose={clearError}
          duration={5000}
        />
      )}
      <BufferProgress
        isVisible={showBufferProgress}
        isBuffering={isBuffering}
        progress={bufferProgress}
        currentTrack={currentTrack}
        bufferInfo={bufferInfo}
        onClose={closeBufferProgress}
      />
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

export default PlayerContext