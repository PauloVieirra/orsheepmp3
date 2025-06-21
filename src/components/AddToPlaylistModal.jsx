import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStorage } from '../contexts/StorageContext'
import { useNotification } from '../contexts/NotificationContext'

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

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  background: ${props => props.primary ? '#1db954' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? '#1ed760' : 'rgba(255, 255, 255, 0.2)'};
  }
`

const PlaylistList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin: 16px 0;

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

const PlaylistItem = styled.div`
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  h4 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  margin-bottom: 8px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`

const AddToPlaylistModal = ({ track, onClose }) => {
  const { getPlaylists, savePlaylists } = useStorage()
  const { showAddedToPlaylist, showError, showSuccess } = useNotification()
  const [playlists, setPlaylists] = useState([])
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false)

  useEffect(() => {
    const loadPlaylists = async () => {
      const savedPlaylists = await getPlaylists()
      setPlaylists(savedPlaylists || [])
    }
    loadPlaylists()
  }, [getPlaylists])

  const handleAddToPlaylist = async (playlist) => {
    // Verificar se a música já está na playlist
    if (!playlist.tracks.some(t => t.id === track.id)) {
      const updatedPlaylist = {
        ...playlist,
        tracks: [...playlist.tracks, track]
      }

      const updatedPlaylists = playlists.map(p =>
        p.id === playlist.id ? updatedPlaylist : p
      )

      const success = await savePlaylists(updatedPlaylists)
      if (success) {
        setPlaylists(updatedPlaylists)
        showAddedToPlaylist(playlist.name)
      } else {
        showError('Erro ao adicionar música à playlist. Tente novamente.')
      }
    } else {
      showError('Esta música já está na playlist!')
    }
    onClose()
  }

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        tracks: [track]
      }

      const updatedPlaylists = [...playlists, newPlaylist]
      const success = await savePlaylists(updatedPlaylists)
      
      if (success) {
        setPlaylists(updatedPlaylists)
        showSuccess(`Playlist "${newPlaylistName.trim()}" criada com sucesso!`)
        onClose()
      } else {
        showError('Erro ao criar playlist. Tente novamente.')
      }
    }
  }

  return (
    <>
      <Overlay onClick={onClose} />
      <Modal>
        <h3>Adicionar à Playlist</h3>
        
        {showNewPlaylistInput ? (
          <>
            <Input
              type="text"
              placeholder="Nome da nova playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <Button primary onClick={handleCreatePlaylist}>
              Criar Playlist
            </Button>
            <Button onClick={() => setShowNewPlaylistInput(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            {playlists.length > 0 && (
              <PlaylistList>
                {playlists.map(playlist => (
                  <PlaylistItem
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist)}
                  >
                    <h4>{playlist.name}</h4>
                    <p>{playlist.tracks.length} músicas</p>
                  </PlaylistItem>
                ))}
              </PlaylistList>
            )}
            
            <Button
              primary={playlists.length === 0}
              onClick={() => setShowNewPlaylistInput(true)}
            >
              Criar Nova Playlist
            </Button>
            
            {playlists.length > 0 && (
              <Button onClick={onClose}>
                Cancelar
              </Button>
            )}
          </>
        )}
      </Modal>
    </>
  )
}

export default AddToPlaylistModal 