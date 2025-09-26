import React, { useState } from 'react'
import styled from 'styled-components'
import { 
  AiFillPlayCircle, 
  AiFillPauseCircle, 
  AiOutlineStepBackward, 
  AiOutlineStepForward,
  AiOutlineSync,
  AiOutlineReload,
  AiOutlineRandom,
  AiOutlineDownload
} from 'react-icons/ai'
import { IoMdClose } from 'react-icons/io'
import { MdPlaylistAdd } from 'react-icons/md'
import { usePlayer } from '../contexts/PlayerContext'

const PlayerViewContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #121212;
  z-index: 2000;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 20px;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @media (max-width: 600px) {
    padding: 8px;
    grid-template-rows: auto 1fr auto;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    padding: 6px;
  }
`

const AddToPlaylistButton = styled.button`
  position: absolute;
  top: 20px;
  right: 70px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    color: #1db954;
  }

  @media (max-width: 600px) {
    top: 10px;
    right: 48px;
    font-size: 1.2rem;
    padding: 6px;
  }
`

const AutoPlayButton = styled.button`
  position: absolute;
  top: 20px;
  right: 120px;
  background: none;
  border: none;
  color: ${props => props.$active ? '#1db954' : 'white'};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    color: #1db954;
  }

  @media (max-width: 600px) {
    top: 10px;
    right: 86px;
    font-size: 1.2rem;
    padding: 6px;
  }
`

const DownloadButton = styled.button`
  position: absolute;
  top: 20px;
  right: 170px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    color: #1db954;
  }

  @media (max-width: 600px) {
    top: 10px;
    right: 124px;
    font-size: 1.2rem;
    padding: 6px;
  }
`

const CoverArt = styled.div`
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1;
  margin: 40px auto;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 600px) {
    max-width: 90vw;
    margin: 16px auto 12px auto;
    img {
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
  }
`

const TrackInfo = styled.div`
  text-align: center;
  margin: 20px 0;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: white;
  }
  
  p {
    margin: 8px 0 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 600px) {
    margin: 10px 0;
    h2 {
      font-size: 1.1rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
  position: relative;

  @media (max-width: 600px) {
    gap: 12px;
    padding: 10px 0 0 0;
  }
`

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: ${props => props.$primary ? '4rem' : '2rem'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    color: #1db954;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
      color: white;
    }
  }

  @media (max-width: 600px) {
    font-size: ${props => props.$primary ? '2.5rem' : '1.2rem'};
  }
`

const ExtraControls = styled.div`
  position: absolute;
  right: 0;
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    gap: 8px;
  }
`

const ExtraButton = styled(ControlButton)`
  font-size: 1.5rem;
  color: ${props => props.$active ? '#1db954' : 'rgba(255, 255, 255, 0.7)'};
  
  &:hover {
    color: ${props => props.$active ? '#1db954' : '#ffffff'};
  }

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`

const Progress = styled.div`
  height: 100%;
  background: #1db954;
  border-radius: 2px;
`

const BufferBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(29, 185, 84, 0.3); /* cor suave do buffer */
  border-radius: 2px;
  z-index: 1;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  margin: 20px 0;

  @media (max-width: 600px) {
    margin: 10px 0;
    height: 3px;
  }
`

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 8px;

  @media (max-width: 600px) {
    font-size: 0.8rem;
    margin-top: 4px;
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
`

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #282828;
  padding: 24px;
  border-radius: 8px;
  width: 300px;
  z-index: 2001;

  h3 {
    margin: 0 0 16px;
    color: white;
    text-align: center;
  }

  @media (max-width: 600px) {
    width: 90vw;
    padding: 12px;
    h3 {
      font-size: 1rem;
    }
  }
`

const PlaylistModal = styled(Modal)`
  .playlist-list {
    max-height: 300px;
    overflow-y: auto;
  }
  @media (max-width: 600px) {
    .playlist-list {
      max-height: 50vw;
    }
  }
`

const PlaylistItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    margin-right: 12px;
  }
  
  .info {
    flex: 1;
    
    h4 {
      margin: 0;
      font-size: 1rem;
      color: white;
    }
    
    p {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  @media (max-width: 600px) {
    padding: 8px;
    img {
      width: 36px;
      height: 36px;
      margin-right: 8px;
    }
    .info h4 {
      font-size: 0.9rem;
    }
  }
`

const downloadAndStoreTrack = async (track) => {
  try {
    // Supondo que o backend forneça a URL do MP3
    const response = await fetch(track.downloadUrl)
    if (!response.ok) throw new Error('Erro ao baixar')
    const blob = await response.blob()
    // Salvar no IndexedDB (ou localStorage para protótipo)
    const offlineTracks = JSON.parse(localStorage.getItem('offlineTracks') || '[]')
    offlineTracks.push({
      id: track.id,
      title: track.title,
      blobUrl: URL.createObjectURL(blob),
      // Adicione outros metadados se necessário
    })
    localStorage.setItem('offlineTracks', JSON.stringify(offlineTracks))
    alert('Música salva para ouvir offline!')
  } catch (e) {
    alert('Erro ao baixar música: ' + e.message)
  }
}

const PlayerView = ({ onClose }) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const { 
    currentTrack: track,
    isPlaying,
    currentTime,
    duration,
    togglePlay: onTogglePlay,
    seekTo: onSeek,
    previousTrack: onPrevious,
    nextTrack: onNext,
    currentPlaylist,
    currentTrackIndex,
    playTrack,
    autoPlay,
    shuffle,
    toggleAutoPlay,
    toggleShuffle,
    restartTrack,
    bufferProgress
  } = usePlayer()

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddToPlaylist = (playlist) => {
    // Implementar adição à playlist
    setShowPlaylistModal(false)
  }

  return (
    <PlayerViewContainer>
      <CloseButton onClick={onClose}><IoMdClose /></CloseButton>
      <AddToPlaylistButton onClick={() => setShowPlaylistModal(true)}><MdPlaylistAdd /></AddToPlaylistButton>
      <DownloadButton onClick={() => downloadAndStoreTrack(track)} title="Baixar para ouvir offline">
        <AiOutlineDownload />
      </DownloadButton>

      <CoverArt>
        <img src={`https://img.youtube.com/vi/${track.id}/maxresdefault.jpg`} alt={track.title} />
      </CoverArt>

      <TrackInfo>
        <h2>{track.title}</h2>
        <p>OrSheep Music</p>
      </TrackInfo>

      <ProgressBar onClick={onSeek}>
        <BufferBar style={{ width: `${bufferProgress || 0}%` }} />
        <Progress style={{ width: `${(currentTime / duration) * 100}%`, position: 'relative', zIndex: 2 }} />
      </ProgressBar>

      <TimeDisplay>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </TimeDisplay>

      <Controls>
        <ControlButton onClick={onPrevious} disabled={!currentPlaylist || currentTrackIndex === 0}>
          <AiOutlineStepBackward />
        </ControlButton>
        <ControlButton $primary onClick={onTogglePlay}>
          {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
        </ControlButton>
        <ControlButton onClick={onNext} disabled={!currentPlaylist || currentTrackIndex === currentPlaylist?.tracks.length - 1}>
          <AiOutlineStepForward />
        </ControlButton>
        
        <ExtraControls>
          <ExtraButton onClick={restartTrack} title="Reiniciar música">
            <AiOutlineReload />
          </ExtraButton>
          <ExtraButton onClick={toggleShuffle} $active={shuffle} title="Reprodução aleatória">
            <AiOutlineRandom />
          </ExtraButton>
          <ExtraButton 
            onClick={toggleAutoPlay} 
            $active={autoPlay} 
            title={autoPlay ? "Desativar reprodução automática." : "Ativar reprodução automática"}
          >
            <AiOutlineSync />
          </ExtraButton>
        </ExtraControls>
      </Controls>

      {showPlaylistModal && (
        <>
          <Overlay onClick={() => setShowPlaylistModal(false)} />
          <PlaylistModal>
            <h3>Adicionar à Playlist</h3>
            <div className="playlist-list">
              {currentPlaylist?.tracks.map(track => (
                <PlaylistItem key={track.id} onClick={() => handleAddToPlaylist(track)}>
                  <img 
                    src={`https://img.youtube.com/vi/${track.id}/default.jpg`} 
                    alt={track.title}
                  />
                  <div className="info">
                    <h4>{track.title}</h4>
                  </div>
                </PlaylistItem>
              ))}
            </div>
          </PlaylistModal>
        </>
      )}
    </PlayerViewContainer>
  )
}

export default PlayerView
