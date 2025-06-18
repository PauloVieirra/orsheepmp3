import React from 'react'
import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'
import YouTubePlayer from './YouTubePlayer'
import BufferedAudioPlayer from './BufferedAudioPlayer'

const HiddenPlayer = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  pointer-events: none;
`

const AudioPlayer = () => {
  const { 
    currentTrack, 
    isPlaying,
    onPlayerReady, 
    onPlayerStateChange, 
    handlePlayerError,
    onProgress,
    onDuration,
    onEnded,
    isTrackBuffered
  } = usePlayer()

  if (!currentTrack) return null

  // Verifica se a faixa está em buffer
  const isBuffered = isTrackBuffered(currentTrack.id)

  return (
    <HiddenPlayer>
      {/* Player de áudio bufferizado (quando disponível) */}
      {isBuffered && (
        <BufferedAudioPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onProgress={onProgress}
          onDuration={onDuration}
          onEnded={onEnded}
          onError={handlePlayerError}
        />
      )}
      
      {/* Player do YouTube (fallback) */}
      <YouTubePlayer
        videoId={currentTrack.id}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        onError={handlePlayerError}
      />
    </HiddenPlayer>
  )
}

export default AudioPlayer 