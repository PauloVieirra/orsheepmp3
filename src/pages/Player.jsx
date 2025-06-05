import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { AiOutlineArrowLeft, AiOutlinePlus, AiOutlineStepBackward, AiOutlineStepForward, AiFillPlayCircle, AiFillPauseCircle, AiOutlineHeart, AiFillHeart, AiOutlineCloud, AiOutlineDownload, AiOutlineDelete } from 'react-icons/ai'
import { BiShuffle, BiRepeat } from 'react-icons/bi'
import { MdDeleteForever } from 'react-icons/md'
import AddToPlaylistModal from '../components/AddToPlaylistModal'
import DownloadService from '../services/DownloadService'

const Container = styled.div`
  min-height: 100vh;
  background: #121212;
  color: white;
  padding: 20px;
  padding-bottom: 100px;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  width: 100%;

  .left {
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
    width: 280px;
    height: 280px;
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
  margin-bottom: 32px;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    padding: 8px;
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
  justify-content: center;
  gap: 16px;
  margin: 16px 0 32px;

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    &.active {
      color: #8B5CF6;
    }

    &.delete {
      display: none;
      color: #ff4444;
      
      &:hover {
        background: rgba(255, 68, 68, 0.1);
        color: #ff4444;
      }
    }

    span {
      font-size: 0.9rem;
    }
  }
`

const QueueContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 32px;

  h2 {
    font-size: 1.2rem;
    margin: 0 0 16px;
    color: white;
  }
`

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.1)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 12px;
  }

  .info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0;
      font-size: 0.9rem;
      color: ${props => props.$active ? '#8B5CF6' : 'white'};
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

  .playing-indicator {
    color: #8B5CF6;
    margin-left: 8px;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Thumbnail = styled.div`
  width: 280px;
  height: 280px;
  margin-bottom: 24px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
`

const Progress = styled.div`
  height: 100%;
  background: #8B5CF6;
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

const QueueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const QueueTitle = styled.h2`
  font-size: 1.2rem;
  color: white;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
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

const DeleteButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ff4444;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 68, 68, 0.1);
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`

const PlayerPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { 
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    nextTrack,
    previousTrack,
    autoPlay,
    toggleAutoPlay,
    shuffle,
    toggleShuffle,
    queue,
    currentQueueIndex,
    playTrack,
    removeTrack,
    currentPlaylist,
    getPlaylists,
    savePlaylists,
    setCurrentTrack,
    setIsPlaying
  } = usePlayer()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const fromHome = location.state?.fromHome
  const hasQueue = queue.length > 1

  useEffect(() => {
    if (!currentTrack && location.state?.track) {
      navigate('/', { replace: true })
    }
  }, [currentTrack, location.state, navigate])

  useEffect(() => {
    // Verifica se a música está nos favoritos
    const checkFavorite = async () => {
      const favorites = JSON.parse(localStorage.getItem('favoriteTracks') || '[]')
      setIsFavorite(favorites.some(fav => fav.id === currentTrack?.id))
    }
    checkFavorite()
  }, [currentTrack])

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

  const handlePlayerReady = (event) => {
    setPlayerReady(true)
  }

  const handlePlayerStateChange = (event) => {
    // Aqui você pode adicionar lógica para lidar com mudanças de estado do player
    // Por exemplo, atualizar o estado de reprodução, duração, etc.
  }

  const handleBack = () => {
    // Se veio de uma rota específica, volta para ela
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      // Se não tem rota específica, volta para a última rota
      navigate(-1)
    }
  }

  const handleDeleteTrack = async () => {
    if (!currentTrack) return

    if (window.confirm(`Tem certeza que deseja excluir permanentemente a música "${currentTrack.title}" do aplicativo?\nEla será removida de todas as playlists e da biblioteca.`)) {
      try {
        // 1. Remove de todas as playlists
        const playlists = await getPlaylists() || []
        const updatedPlaylists = playlists.map(playlist => ({
          ...playlist,
          tracks: playlist.tracks.filter(track => track.id !== currentTrack.id)
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
              const filtered = items.filter(item => item?.id !== currentTrack.id)
              localStorage.setItem(key, JSON.stringify(filtered))
            }
          } catch (e) {
            console.warn(`Erro ao processar ${key}:`, e)
          }
        })

        // 3. Remove arquivos baixados
        if ('caches' in window) {
          const cacheKeys = await caches.keys()
          await Promise.all(cacheKeys.map(async key => {
            const cache = await caches.open(key)
            const requests = await cache.keys()
            const trackRequests = requests.filter(req => req.url.includes(currentTrack.id))
            await Promise.all(trackRequests.map(req => cache.delete(req)))
          }))
        }

        // 4. Limpa o player e retorna para a tela inicial
        setIsPlaying(false)
        setCurrentTrack(null)
        navigate('/')
        
        alert('Música excluída com sucesso do aplicativo!')
      } catch (error) {
        console.error('Erro ao excluir música:', error)
        alert('Erro ao excluir música. Tente novamente.')
      }
    }
  }
  
  if (!currentTrack) return null
  
  return (
    <Container>
      <Header>
        <div className="left">
          <button onClick={handleBack}>
            <AiOutlineArrowLeft />
          </button>
          <span>Reproduzindo agora</span>
        </div>
        <div className="right">
          <button onClick={() => setIsFavorite(!isFavorite)}>
            {isFavorite ? <AiFillHeart style={{ color: '#8B5CF6' }} /> : <AiOutlineHeart />}
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading || isDownloaded}
            style={{ color: isDownloaded ? '#8B5CF6' : 'white' }}
          >
            {isDownloaded ? <AiOutlineCloud /> : <AiOutlineDownload />}
          </button>
          <button onClick={() => setShowPlaylistModal(true)}>
            <AiOutlinePlus />
          </button>
        </div>
      </Header>

      <Content>
        {currentTrack && (
          <>
            <Thumbnail>
              <img 
                src={`https://img.youtube.com/vi/${currentTrack.id}/maxresdefault.jpg`}
                alt={currentTrack.title}
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${currentTrack.id}/hqdefault.jpg`
                }}
              />
            </Thumbnail>

            <TrackInfo>
              <h1>{currentTrack.title}</h1>
              <p>YouTube Music</p>
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
              <button onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? <AiFillHeart style={{ color: '#8B5CF6' }} /> : <AiOutlineHeart />}
                <span>Favoritar</span>
              </button>
              <button 
                onClick={handleDownload} 
                disabled={isDownloading || isDownloaded}
                style={{ color: isDownloaded ? '#8B5CF6' : 'white' }}
              >
                {isDownloaded ? <AiOutlineCloud /> : <AiOutlineDownload />}
                <span>{isDownloaded ? 'Baixada' : 'Baixar'}</span>
              </button>
              <button onClick={() => setShowPlaylistModal(true)}>
                <AiOutlinePlus />
                <span>Playlist</span>
              </button>
              <button onClick={handleDeleteTrack} className="delete">
                <MdDeleteForever />
                <span>Excluir 1</span>
              </button>
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

      {!fromHome && showPlaylistModal && (
        <AddToPlaylistModal
          track={currentTrack}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </Container>
  )
}

export default PlayerPage