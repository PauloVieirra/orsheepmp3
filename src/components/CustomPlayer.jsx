import React, { useRef, useCallback, useEffect } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import AudioService from '../services/AudioService'

const PlayerWrapper = styled.div`
  display: none; // Oculta o player visual
`

// Inicializa o AudioService uma única vez
AudioService.initialize()

const CustomPlayer = ({
  url,
  title,
  playing,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
  onDuration,
  onReady,
  onPrevious,
  onNext,
  onSeek
}) => {
  const playerRef = useRef(null)

  useEffect(() => {
    // Configura o callback para eventos do sistema
    AudioService.setOnStateChange((event) => {
      switch (event.type) {
        case 'play':
          onPlay?.()
          break
        case 'pause':
          onPause?.()
          break
        case 'previous':
          onPrevious?.()
          break
        case 'next':
          onNext?.()
          break
        case 'seek':
          onSeek?.(event.time)
          break
      }
    })
  }, [onPlay, onPause, onPrevious, onNext, onSeek])

  useEffect(() => {
    // Atualiza as informações da mídia quando a música mudar
    if (title) {
      AudioService.updateMediaInfo({ id: url, title }, playing)
    }
  }, [title, url, playing])

  const handleProgress = useCallback(({ playedSeconds, loadedSeconds }) => {
    if (onProgress) {
      onProgress({ playedSeconds, loadedSeconds })
    }
    // Atualiza a posição no MediaSession
    AudioService.updatePosition(playedSeconds, playerRef.current?.getDuration() || 0)
  }, [onProgress])

  const handleReady = useCallback((player) => {
    playerRef.current = player
    AudioService.setPlayer(player)
    if (onReady) {
      onReady(player)
    }
  }, [onReady])

  const handleStateChange = useCallback((state) => {
    // Atualiza o AudioService com o estado atual do player
    AudioService.updateMediaSessionState(state === 1 ? 'playing' : 'paused')
  }, [])

  return (
    <PlayerWrapper>
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${url}`}
        width="0"
        height="0"
        playing={playing}
        controls={false}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        onProgress={handleProgress}
        onDuration={onDuration}
        onReady={handleReady}
        onStateChange={handleStateChange}
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              origin: window.location.origin,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              showinfo: 0,
              playsinline: 1,
              rel: 0
            },
            embedOptions: {
              controls: 0,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              rel: 0
            }
          }
        }}
      />
    </PlayerWrapper>
  )
}

export default CustomPlayer 