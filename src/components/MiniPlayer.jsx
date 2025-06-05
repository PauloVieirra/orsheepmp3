import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { AiFillPlayCircle, AiFillPauseCircle, AiOutlineStepBackward, AiOutlineStepForward } from 'react-icons/ai'

const Container = styled.div`
  position: fixed;
  bottom: 72px;
  left: 0;
  right: 0;
  height: 64px;
  background: #1e1e1e;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const TrackInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    overflow: hidden;

    h3 {
      margin: 0;
      font-size: 0.9rem;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    &:active {
      transform: scale(0.95);
    }

    &.play-pause {
      color: #8B5CF6;
      font-size: 2rem;

      &:hover {
        color: #7C3AED;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        background: none;
        color: white;
      }
    }
  }
`

const ProgressBar = styled.div.attrs(props => ({
  style: {
    width: `${props.$progress}%`
  }
}))`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(139, 92, 246, 0.2);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #8B5CF6;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
    transition: width 0.1s linear;
  }

  &:hover {
    height: 5px;
    background: rgba(139, 92, 246, 0.3);

    &::after {
      background: #7C3AED;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
    }
  }
`

const MiniPlayer = () => {
  const navigate = useNavigate()
  const { 
    currentTrack,
    isPlaying,
    togglePlay,
    previousTrack,
    nextTrack,
    currentTime,
    duration,
    queue,
    currentQueueIndex
  } = usePlayer()

  const progress = duration ? (currentTime / duration) * 100 : 0

  const limitTitle = (title) => {
    return title.length > 24 ? `${title.substring(0, 16)}...` : title
  }

  if (!currentTrack) return null

  const handlePlayPause = (e) => {
    e.stopPropagation()
    togglePlay()
  }

  return (
    <Container>
      <ProgressBar $progress={progress} />

      <TrackInfo onClick={() => navigate('/player', { state: { track: currentTrack } })}>
        <img 
          src={`https://img.youtube.com/vi/${currentTrack.id}/default.jpg`}
          alt={currentTrack.title}
        />
        <div className="info">
          <h3>{limitTitle(currentTrack.title)}</h3>
          <p>YouTube Music</p>
        </div>
      </TrackInfo>

      <Controls>
        <button 
          onClick={previousTrack}
          disabled={!queue.length || currentQueueIndex === 0}
        >
          <AiOutlineStepBackward />
        </button>
        <button onClick={handlePlayPause} className="play-pause">
          {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
        </button>
        <button 
          onClick={nextTrack}
          disabled={!queue.length || currentQueueIndex === queue.length - 1}
        >
          <AiOutlineStepForward />
        </button>
      </Controls>
    </Container>
  )
}

export default MiniPlayer