import React, { useState } from 'react'
import styled from 'styled-components'
import { 
  AiFillPlayCircle, 
  AiFillPauseCircle, 
  AiOutlineStepBackward, 
  AiOutlineStepForward, 
  AiOutlineDownload, 
  AiOutlineSync,
  AiOutlineReload,
  AiOutlineRandom
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
`

const DownloadButton = styled.button`
  position: absolute;
  top: 20px;
  right: 120px;
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
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
  position: relative;
`

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: ${props => props.primary ? '4rem' : '2rem'};
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
`

const ExtraControls = styled.div`
  position: absolute;
  right: 0;
  display: flex;
  gap: 16px;
`

const ExtraButton = styled(ControlButton)`
  font-size: 1.5rem;
  color: ${props => props.active ? '#1db954' : 'rgba(255, 255, 255, 0.7)'};
  
  &:hover {
    color: ${props => props.active ? '#1db954' : '#ffffff'};
  }
`

const AutoPlayButton = styled(ControlButton)`
  position: absolute;
  right: 20px;
  font-size: 1.5rem;
  color: ${props => props.active ? '#1db954' : 'rgba(255, 255, 255, 0.7)'};
  
  &:hover {
    color: ${props => props.active ? '#1db954' : '#ffffff'};
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  margin: 20px 0;
`

const Progress = styled.div`
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  transition: width 0.1s linear;
`

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-top: 8px;
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

const PlaylistQueue = styled.div`
  margin: 20px 0;
  padding: 0 20px;
  overflow-y: auto;
  max-height: 300px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  color: ${props => props.active ? '#1db954' : 'white'};
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.1)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .title {
    font-weight: ${props => props.active ? 'bold' : 'normal'};
    margin-bottom: 4px;
  }

  .artist {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
`

const PlaylistModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #282828;
  padding: 16px;
  border-radius: 8px;
  width: 100%;
  overflow-y: auto;
  z-index: 2001;

  h3 {
    margin: 0 0 16px;
    color: white;
  }
`

const PlaylistItem = styled.div`
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const DownloadModal = styled(PlaylistModal)``
const DownloadButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`

const PlayerView = ({ onClose }) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const { 
    currentTrack: track,
    isPlaying,
    currentTime,
    duration,
    togglePlay: onTogglePlay,
    seekTo: onSeek,
    previousTrack: onPrevious,
    nextTrack: onNext,
    getPlaylists,
    addToPlaylist,
    currentPlaylist,
    currentTrackIndex,
    playTrack,
    autoPlay,
    shuffle,
    toggleAutoPlay,
    toggleShuffle,
    restartTrack
  } = usePlayer()
  
  const playlists = getPlaylists()

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(track, playlistId)
    setShowPlaylistModal(false)
  }

  const handleDownload = () => {
    const audioUrl = track.audioUrl  // Certifique-se de que seu objeto track tem a URL do áudio aqui
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${track.title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowDownloadModal(false)
  }

  return (
    <PlayerViewContainer>
      <CloseButton onClick={onClose}><IoMdClose /></CloseButton>
      <AddToPlaylistButton onClick={() => setShowPlaylistModal(true)}><MdPlaylistAdd /></AddToPlaylistButton>
      <DownloadButton onClick={() => setShowDownloadModal(true)}><AiOutlineDownload /></DownloadButton>

      <CoverArt>
        <img src={`https://img.youtube.com/vi/${track.id}/maxresdefault.jpg`} alt={track.title} />
      </CoverArt>

      <TrackInfo>
        <h2>{track.title}</h2>
        <p>OrSheep Music</p>
      </TrackInfo>

      <ProgressBar onClick={onSeek}>
        <Progress style={{ width: `${(currentTime / duration) * 100}%` }} />
      </ProgressBar>

      <TimeDisplay>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </TimeDisplay>

      {currentPlaylist && (
        <PlaylistQueue>
          {currentPlaylist.tracks.map((track, index) => (
            <QueueItem
              key={track.id}
              active={index === currentTrackIndex}
              onClick={() => playTrack(track)}
            >
              <div>
                <div className="title">{track.title}</div>
                <div className="artist">{track.artist}</div>
              </div>
            </QueueItem>
          ))}
        </PlaylistQueue>
      )}

      <Controls>
        <ControlButton onClick={onPrevious} disabled={!currentPlaylist || currentTrackIndex === 0}>
          <AiOutlineStepBackward />
        </ControlButton>
        <ControlButton primary onClick={onTogglePlay}>
          {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
        </ControlButton>
        <ControlButton onClick={onNext} disabled={!currentPlaylist || currentTrackIndex === currentPlaylist?.tracks.length - 1}>
          <AiOutlineStepForward />
        </ControlButton>
        
        <ExtraControls>
          <ExtraButton onClick={restartTrack} title="Reiniciar música">
            <AiOutlineReload />
          </ExtraButton>
          <ExtraButton onClick={toggleShuffle} active={shuffle} title="Reprodução aleatória">
            <AiOutlineRandom />
          </ExtraButton>
          <ExtraButton onClick={toggleAutoPlay} active={autoPlay} title="Reprodução automática">
            <AiOutlineSync />
          </ExtraButton>
        </ExtraControls>
      </Controls>

      {showPlaylistModal && (
        <>
          <Overlay onClick={() => setShowPlaylistModal(false)} />
          <PlaylistModal>
            <h3>Adicionar à Playlist</h3>
            {playlists.map(playlist => (
              <PlaylistItem
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                {playlist.name}
              </PlaylistItem>
            ))}
          </PlaylistModal>
        </>
      )}

      {showDownloadModal && (
        <>
          <Overlay onClick={() => setShowDownloadModal(false)} />
          <DownloadModal>
            <h3>Deseja fazer o download?</h3>
            <DownloadButtonGroup>
              <button onClick={handleDownload}>Sim</button>
              <button onClick={() => setShowDownloadModal(false)}>Não</button>
            </DownloadButtonGroup>
          </DownloadModal>
        </>
      )}
    </PlayerViewContainer>
  )
}

export default PlayerView
