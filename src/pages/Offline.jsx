import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { AiOutlinePlayCircle, AiOutlineDelete, AiOutlineCloudDownload } from 'react-icons/ai'
import DownloadService from '../services/DownloadService'

const OfflineContainer = styled.div`
  padding: 20px;
  padding-bottom: 140px;
`

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 2rem;
    color: white;
    margin: 0 0 8px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  img {
    width: 64px;
    height: 64px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: white;
    }
    
    p {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      gap: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        &:not(:last-child)::after {
          content: "•";
          margin-left: 12px;
          opacity: 0.5;
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 12px;
  }
`

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$primary ? '#1db954' : props.$danger ? '#ff4444' : 'white'};
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;

  &:hover {
    background: ${props => props.$primary ? 'rgba(29, 185, 84, 0.1)' : props.$danger ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    transform: scale(1.1);
  }

  svg {
    font-size: 1.5rem;
  }
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: white;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`

const Offline = () => {
  const navigate = useNavigate()
  const { playTrack } = usePlayer()
  const [offlineTracks, setOfflineTracks] = useState([])

  useEffect(() => {
    loadOfflineTracks()
  }, [])

  const loadOfflineTracks = async () => {
    const tracks = await DownloadService.getOfflineTracks()
    setOfflineTracks(tracks)
    console.log('Músicas offline carregadas:', tracks) // Adicionado console.log
  }

  const handlePlay = async (track) => {
    // Buscar o blob do IndexedDB
    const blob = await DownloadService.getTrackBlob(track.id)
    if (blob) {
      const url = URL.createObjectURL(blob)
      playTrack({ ...track, offlineUrl: url }, true, [], -1, true)
      navigate('/player', { state: { track: { ...track, offlineUrl: url } } })
    } else {
      alert('Arquivo de áudio não encontrado offline!')
    }
  }

  const handleDelete = async (track) => {
    if (window.confirm('Tem certeza que deseja remover esta música dos downloads? Esta ação não pode ser desfeita.')) {
      try {
        await DownloadService.deleteOfflineTrack(track.id)
        const tracks = await DownloadService.getOfflineTracks()
        setOfflineTracks(tracks)
      } catch (error) {
        console.error('Erro ao remover download:', error)
        alert('Erro ao remover o download. Tente novamente.')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <OfflineContainer>
      <Header>
        <h1>Músicas Offline</h1>
        <p>{offlineTracks.length} músicas baixadas</p>
      </Header>

      {offlineTracks.length > 0 ? (
        <TrackList>
          {offlineTracks.map(track => (
            <Track key={track.id}>
              <img
                src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
                alt={track.title}
              />
              <div className="info">
                <h3>{track.title}</h3>
                <p>
                  <span>Baixado em: {formatDate(track.downloadDate)}</span>
                </p>
              </div>
              <div className="actions">
                <ActionButton $primary onClick={() => handlePlay(track)}>
                  <AiOutlinePlayCircle />
                </ActionButton>
                <ActionButton $danger onClick={() => handleDelete(track)}>
                  <AiOutlineDelete />
                </ActionButton>
              </div>
            </Track>
          ))}
        </TrackList>
      ) : (
        <EmptyMessage>
          <AiOutlineCloudDownload />
          <h3>Nenhuma música offline</h3>
          <p>Baixe músicas para ouvi-las sem internet</p>
        </EmptyMessage>
      )}
    </OfflineContainer>
  )
}

export default Offline 