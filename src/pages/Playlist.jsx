import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'
import { useStorage } from '../contexts/StorageContext'
import { AiOutlineArrowLeft, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import DownloadService from '../services/DownloadService'

const Container = styled.div`
  padding: 20px;
  padding-bottom: 140px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

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
`

const PlaylistInfo = styled.div`
  margin-bottom: 32px;
  text-align: center;

  h1 {
    font-size: 2rem;
    margin: 0 0 8px;
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    margin-right: 16px;
  }

  .track-info {
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

  .playing-indicator {
    margin-left: 12px;
    color: #8B5CF6;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    &.delete {
      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #EF4444;
      }
    }
  }
`

const Playlist = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPlaylists, savePlaylists } = useStorage()
  const { 
    currentTrack, 
    playTrack, 
    isPlaying,
    autoPlay,
    nextTrack,
    previousTrack,
    onEnded
  } = usePlayer()
  const [playlist, setPlaylist] = useState(null)
  const [offlineTracks, setOfflineTracks] = useState([])

  useEffect(() => {
    loadPlaylist()
    loadOfflineTracks()
  }, [id])

  const loadPlaylist = async () => {
    const playlists = await getPlaylists()
    const currentPlaylist = playlists.find(p => p.id === id)
    if (currentPlaylist) {
      setPlaylist(currentPlaylist)
    } else {
      navigate('/playlists')
    }
  }

  const loadOfflineTracks = async () => {
    const downloads = await DownloadService.getOfflineTracks()
    setOfflineTracks(downloads)
  }

  const handlePlayTrack = (track, index) => {
    const playlistTracks = [...playlist.tracks]
    playTrack(track, true, playlistTracks, index)
  }

  const handleDeletePlaylist = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta playlist?')) {
      const playlists = await getPlaylists()
      const updatedPlaylists = playlists.filter(p => p.id !== id)
      await savePlaylists(updatedPlaylists)
      navigate('/playlists')
    }
  }

  const handleEditPlaylist = () => {
    // Implementar edição da playlist
  }

  const handleTrackEnd = () => {
    if (autoPlay && playlist) {
      const currentIndex = playlist.tracks.findIndex(track => track.id === currentTrack?.id)
      if (currentIndex < playlist.tracks.length - 1) {
        handlePlayTrack(playlist.tracks[currentIndex + 1], currentIndex + 1)
      }
    }
  }

  if (!playlist) return null

  return (
    <Container>
      <Header>
        <button onClick={() => navigate(-1)}>
          <AiOutlineArrowLeft />
        </button>
        <PlaylistInfo>
          <h1>{playlist.name}</h1>
          <p>{playlist.tracks.length} músicas</p>
        </PlaylistInfo>
      </Header>

      <TrackList>
        {playlist.tracks.map((track, index) => (
          <TrackItem
            key={`${track.id}-${index}`}
            onClick={() => handlePlayTrack(track, index)}
            $active={currentTrack?.id === track.id}
          >
            <img
              src={`https://img.youtube.com/vi/${track.id}/default.jpg`}
              alt={track.title}
            />
            <div className="track-info">
              <h3>{track.title}</h3>
              <p>YouTube Music</p>
            </div>
            {currentTrack?.id === track.id && isPlaying && (
              <div className="playing-indicator">
                🎵
              </div>
            )}
          </TrackItem>
        ))}
      </TrackList>

      <Actions>
        <button onClick={handleEditPlaylist}>
          <AiOutlineEdit />
        </button>
        <button onClick={handleDeletePlaylist} className="delete">
          <AiOutlineDelete />
        </button>
      </Actions>
    </Container>
  )
}

export default Playlist 