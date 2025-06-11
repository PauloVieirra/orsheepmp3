import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useStorage } from '../contexts/StorageContext'
import { AiOutlineArrowLeft, AiOutlinePlus, AiOutlineStepBackward, AiOutlineStepForward, AiFillPlayCircle, AiFillPauseCircle, AiOutlineHeart, AiFillHeart, AiOutlineCloud, AiOutlineDownload, AiOutlineSync } from 'react-icons/ai'
import { BiShuffle, BiRepeat } from 'react-icons/bi'
import AddToPlaylistModal from '../components/AddToPlaylistModal'
import DownloadService from '../services/DownloadService'

const Container = styled.div`
  height: 100vh;
  background: #121212;
  color: white;
  padding: 20px;
  padding-bottom: 100px;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  width: 100%;

  .left {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-left: 8px;

    button {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;

      &:hover {
        background: rgba(139, 92, 246, 0.1);
        color: #8B5CF6;
      }
    }

    span {
      font-size: 1.1rem;
      color: white;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;

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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background: none;
          color: white;
        }
      }
    }
  }
`

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 32px;
  
  
  img {
  width: 100%;
  height: 280px;
  object-fit: cover; 
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  h1 {
    font-size: 1.5rem;
    margin: 0 0 8px;
    color: white;
  }

  p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom:16px;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 16px;
    border-radius: 50%;

    &:hover {
      transform: scale(1.1);
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    &:active {
      transform: scale(0.95);
    }

    &.play-pause {
      font-size: 4rem;
      color: #8B5CF6;

      &:hover {
        color: #7C3AED;
      }
    }

    &.prev-next {
      font-size: 2rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        transform: none;
        background: none;
        color: white;
      }
    }
  }
`

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-bottom: 32px;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  margin-bottom: 8px;

  &:hover {
    height: 6px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: #8B5CF6;
    border-radius: 2px;
    transition: width 0.1s linear;
  }
`

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  width: 100%;
  padding: 0 2px;

  .current {
    color: white;
  }

  .total {
    opacity: 0.7;
  }
`

const AdditionalControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 1.5rem;
    transition: all 0.2s;

    &:hover {
      color: #8B5CF6;
    }

    span {
      font-size: 0.8rem;
    }

    &[data-active="true"] {
      color: #8B5CF6;
    }
  }
`

const QueueContainer = styled.div`
  width: 100%;
  margin-top: 48px;
  margin-bottom:100px;
`

const QueueTitle = styled.h2`
  font-size: 1.2rem;
  color: white;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`

const QueueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.1)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 4px;
      font-size: 1rem;
      color: ${props => props.$active ? '#8B5CF6' : 'white'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
`

const Thumbnail = styled.div`
  width: 280px;
  height: 280px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Progress = styled.div`
  height: 100%;
  background:rgb(246, 244, 92);
  border-radius: 2px;
  position: relative;
`

const ProgressHandle = styled.div`
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  right: -6px;
  top: -4px;
  transform: scale(0);
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  ${ProgressBar}:hover & {
    transform: scale(1);
  }
`

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: ${props => props.$primary ? '4rem' : '2rem'};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    transform: scale(1.1);
    background: rgba(139, 92, 246, 0.1);
    color: ${props => props.$primary ? '#8B5CF6' : '#7C3AED'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const PlayerPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = location
  const { 
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seekTo,
    nextTrack,
    previousTrack,
    queue,
    setQueue,
    currentQueueIndex,
    playTrack,
    hasQueue,
    autoPlay,
    toggleAutoPlay
  } = usePlayer()
  const { getFavoriteTracks, saveFavoriteTracks } = useStorage()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const fromHome = location.state?.fromHome

  useEffect(() => {
    if (state?.queue && state?.currentQueueIndex !== undefined) {
      setQueue(state.queue)
      if (state.track) {
        playTrack(state.track, true, state.queue, state.currentQueueIndex)
      }
    }
  }, [state])

  useEffect(() => {
    // Verifica se a música está nos favoritos
    const checkFavorite = async () => {
      const favorites = await getFavoriteTracks()
      setIsFavorite(favorites.some(fav => fav.id === currentTrack?.id))
    }
    checkFavorite()
  }, [currentTrack, getFavoriteTracks])

  useEffect(() => {
    if (currentTrack) {
      checkDownloadStatus()
    }
  }, [currentTrack])

  const checkDownloadStatus = async () => {
    if (currentTrack) {
      const downloaded = await DownloadService.isTrackDownloaded(currentTrack.id)
      setIsDownloaded(downloaded)
    }
  }

  const handleDownload = async () => {
    if (!currentTrack) return

    if (window.confirm('Deseja baixar esta música para ouvir offline?')) {
      setIsDownloading(true)
      try {
        const success = await DownloadService.downloadMusic(currentTrack)
        if (success) {
          setIsDownloaded(true)
          alert('Música baixada com sucesso!')
        } else {
          alert('Não foi possível baixar a música. Tente novamente.')
        }
      } catch (error) {
        console.error('Erro ao baixar:', error)
        alert('Erro ao baixar a música. Tente novamente.')
      } finally {
        setIsDownloading(false)
      }
    }
  }
  
  const handleSeekChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    seekTo(percent * duration)
  }
  
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleBack = () => {
    if (state?.from) {
      navigate(state.from)
    } else {
      navigate('/')
    }
  }
  
  const handleToggleFavorite = async () => {
    if (!currentTrack) return

    const favorites = await getFavoriteTracks()
    const trackIndex = favorites.findIndex(fav => fav.id === currentTrack.id)
    
    let newFavorites
    if (trackIndex === -1) {
      // Adiciona aos favoritos
      newFavorites = [...favorites, { ...currentTrack, addedAt: new Date().toISOString() }]
    } else {
      // Remove dos favoritos
      newFavorites = favorites.filter(fav => fav.id !== currentTrack.id)
    }
    
    await saveFavoriteTracks(newFavorites)
    setIsFavorite(!isFavorite)
  }
  
  if (!currentTrack) return null
  
  return (
    <Container>
      <Header>
        <div className="left">
          <button onClick={handleBack}>
            <AiOutlineArrowLeft />
          </button>
          <span></span>
        </div>
        <div className="right">
         
         
          <button onClick={() => setShowPlaylistModal(true)}>
            
          </button>
        </div>
      </Header>

      <Content>
        {currentTrack && (
          <>
           

            <TrackInfo className='TrackInfo'>
              <img src={currentTrack?.thumbnail || defaultThumbnail} alt={currentTrack?.title}/>
              <h1>{currentTrack?.title?.length > 34 ? `${currentTrack.title.substring(0, 46)}...` : currentTrack?.title}</h1>
              <p>{currentTrack?.artist || 'Artista Desconhecido'}</p>
            </TrackInfo>

            <ProgressContainer>
              <ProgressBar 
                onClick={handleSeekChange}
                $progress={(currentTime / duration) * 100 || 0}
              />
              <TimeInfo>
                <span className="current">{formatTime(currentTime)}</span>
                <span className="total">{formatTime(duration)}</span>
              </TimeInfo>
            </ProgressContainer>

            <Controls>
              <ControlButton 
                onClick={previousTrack} 
                disabled={!hasQueue || currentQueueIndex === 0}
                className="prev-next"
              >
                <AiOutlineStepBackward />
              </ControlButton>
              <ControlButton $primary onClick={togglePlay} className="play-pause">
                {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
              </ControlButton>
              <ControlButton 
                onClick={nextTrack} 
                disabled={!hasQueue || currentQueueIndex === queue.length - 1}
                className="prev-next"
              >
                <AiOutlineStepForward />
              </ControlButton>
            </Controls>

            <AdditionalControls>
              <button onClick={handleToggleFavorite} data-active={isFavorite}>
                {isFavorite ? <AiFillHeart /> : <AiOutlineHeart />}
                <span>Favoritar</span>
              </button>
              
              {hasQueue && (
                <button onClick={toggleAutoPlay} data-active={autoPlay}>
                  <AiOutlineSync />
                  <span>Autoplay</span>
                </button>
              )}
              
              <button onClick={() => setShowPlaylistModal(true)}>
                <AiOutlinePlus />
                <span>Playlist</span>
              </button>
              
              {!isDownloaded ? (
                <button onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? <AiOutlineCloud /> : <AiOutlineDownload />}
                  <span>{isDownloading ? 'Baixando...' : 'Baixar'}</span>
                </button>
              ) : (
                <button data-active={true}>
                  <AiOutlineCloud />
                  <span>Baixado</span>
                </button>
              )}
            </AdditionalControls>
          </>
        )}

        {hasQueue && (
          <QueueContainer>
            <QueueTitle>
              {fromHome ? 'Músicas da Playlist' : 'Próximas na fila'} <span>({queue.length} músicas)</span>
            </QueueTitle>
            <QueueList>
              {queue.map((queueTrack, index) => (
                <QueueItem
                  key={`${queueTrack.id}-${index}`}
                  $active={index === currentQueueIndex}
                  onClick={() => playTrack(queueTrack)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${queueTrack.id}/default.jpg`}
                    alt={queueTrack.title}
                  />
                  <div className="info">
                    <h3>{queueTrack.title}</h3>
                    <p>YouTube Music</p>
                  </div>
                </QueueItem>
              ))}
            </QueueList>
          </QueueContainer>
        )}
      </Content>

      {showPlaylistModal && (
        <AddToPlaylistModal
          track={currentTrack}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </Container>
  )
}

export default PlayerPage