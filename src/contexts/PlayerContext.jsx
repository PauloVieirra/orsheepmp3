import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useStorage } from './StorageContext'
import { useNavigate } from 'react-router-dom'

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
  const [queue, setQueue] = useState([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [userAction, setUserAction] = useState(null)
  const [lastPlayedTime, setLastPlayedTime] = useState(0)
  const [playerInstance, setPlayerInstance] = useState(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  
  const playerRef = useRef(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const settings = await getSettings()
    setAutoPlay(settings?.autoPlay || false)
  }

  const toggleAutoPlay = async (value) => {
    const settings = await getSettings()
    const newSettings = { ...settings, autoPlay: value }
    await saveSettings(newSettings)
    setAutoPlay(value)
  }

  const handleProgress = useCallback(({ playedSeconds }) => {
    setCurrentTime(playedSeconds)
    setProgress(playedSeconds / duration)
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

  const playTrack = useCallback(async (track, shouldAutoPlay = true, playlistTracks = [], index = -1) => {
    try {
      const isSameTrack = currentTrack?.id === track.id
      
      if (isSameTrack) {
        togglePlay(shouldAutoPlay)
        return
      }

      setCurrentTrack(track)
      setIsPlaying(shouldAutoPlay)
      setCurrentTime(0)
      setLastPlayedTime(0)
      
      if (playlistTracks.length > 0) {
        setQueue(playlistTracks)
        setCurrentQueueIndex(index)
      }

      // Salvar na lista de reprodução recente
      const recentTracks = await getRecentTracks() || []
      const updatedRecentTracks = [track, ...(recentTracks.filter(t => t?.id !== track.id) || [])].slice(0, 20)
      await saveRecentTracks(updatedRecentTracks)

      // Se não houver fila, cria uma com a música atual
      if (queue.length === 0) {
        setQueue([track])
        setCurrentQueueIndex(0)
      }

      // Persiste o estado atual
      localStorage.setItem('currentPlayerState', JSON.stringify({
        track,
        isPlaying: shouldAutoPlay,
        queue: queue.length === 0 ? [track] : queue,
        currentQueueIndex: queue.length === 0 ? 0 : currentQueueIndex
      }))
    } catch (error) {
      console.error('Erro ao reproduzir vídeo:', error)
    }
  }, [currentTrack, queue, currentQueueIndex, getRecentTracks, saveRecentTracks, togglePlay])

  const updateCurrentIndex = useCallback((track) => {
    const queueIndex = queue.findIndex(t => t.id === track.id)
    if (queueIndex !== -1) {
      setCurrentQueueIndex(queueIndex)
    }
  }, [queue])

  const seekTo = useCallback((time) => {
    if (playerInstance) {
      playerInstance.seekTo(time)
      setCurrentTime(time)
    }
    setProgress(time / duration)
    return time
  }, [playerInstance, duration])

  const nextTrack = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex < queue.length - 1) {
      const nextIndex = currentQueueIndex + 1
      setCurrentQueueIndex(nextIndex)
      playTrack(queue[nextIndex], true, queue, nextIndex)
    }
  }, [queue, currentQueueIndex, playTrack])

  const previousTrack = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1
      setCurrentQueueIndex(prevIndex)
      playTrack(queue[prevIndex], true, queue, prevIndex)
    }
  }, [queue, currentQueueIndex, playTrack])

  const handleSetQueue = useCallback((tracks) => {
    setQueue(tracks)
    setCurrentQueueIndex(0)
  }, [])

  const playPlaylist = useCallback((playlist) => {
    setCurrentPlaylist(playlist)
    handleSetQueue(playlist.tracks)
    playTrack(playlist.tracks[0], true, playlist.tracks, 0)
  }, [handleSetQueue, playTrack])

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

  const onPlayerReady = useCallback((player) => {
    playerRef.current = player
    setPlayerInstance(player.getInternalPlayer())
  }, [])

  const handlePlayerStateChange = useCallback((state) => {
    // YouTube player states:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    switch (state) {
      case 1: // playing
        setIsPlaying(true)
        break
      case 2: // paused
        setIsPlaying(false)
        break
      case 0: // ended
        setIsPlaying(false)
        if (autoPlay) {
          nextTrack()
        }
        break
    }
  }, [autoPlay, nextTrack])

  const onEnded = useCallback(() => {
    if (autoPlay && queue.length > 0 && currentQueueIndex < queue.length - 1) {
      nextTrack()
    } else {
      setIsPlaying(false)
    }
  }, [autoPlay, queue, currentQueueIndex, nextTrack])

  const changeVolume = useCallback((value) => {
    setVolume(value)
  }, [])

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

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    currentPlaylist,
    currentTrackIndex,
    autoPlay,
    shuffle,
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
    removeTrack
  }
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
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