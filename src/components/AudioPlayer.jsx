import React from 'react'
import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'
import YouTubePlayer from './YouTubePlayer'

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
    onEnded
  } = usePlayer()

  if (!currentTrack) return null

  return (
    <HiddenPlayer>
      {/* Apenas o player principal */}
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