import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import PlaylistCard from '../components/PlaylistCard'
import { useStorage } from '../contexts/StorageContext'
import { AiOutlinePlus } from 'react-icons/ai'

const PlaylistsContainer = styled.div`
  padding: 20px;
  padding-bottom: 140px;
`

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 2rem;
    color: white;
    margin: 0 0 16px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  /* Garantir que o botão de criar playlist também ocupe uma coluna */
  & > button {
    width: 100%;
    aspect-ratio: 1;
  }
`

const CreatePlaylistButton = styled.button`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  svg {
    font-size: 2rem;
  }
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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  margin-bottom: 16px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  background: ${props => props.$primary ? '#1db954' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#1ed760' : 'rgba(255, 255, 255, 0.2)'};
  }
`

const Playlists = () => {
  const navigate = useNavigate()
  const { getPlaylists, savePlaylists } = useStorage()
  const [playlists, setPlaylists] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoading(true)
        const savedPlaylists = await getPlaylists()
        setPlaylists(savedPlaylists || [])
      } catch (error) {
        console.error('Erro ao carregar playlists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlaylists()
  }, [getPlaylists])

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        tracks: []
      }

      const updatedPlaylists = [...playlists, newPlaylist]
      const success = await savePlaylists(updatedPlaylists)
      
      if (success) {
        setPlaylists(updatedPlaylists)
        setNewPlaylistName('')
        setShowCreateModal(false)
        alert('Playlist criada com sucesso!')
      } else {
        alert('Erro ao criar playlist. Tente novamente.')
      }
    }
  }

  const handlePlaylistClick = (playlist) => {
    navigate('/playlist/' + playlist.id)
  }

  if (isLoading) {
    return (
      <PlaylistsContainer>
        <Header>
          <h1>Minhas Playlists</h1>
          <p>Carregando...</p>
        </Header>
      </PlaylistsContainer>
    )
  }

  return (
    <PlaylistsContainer>
      <Header>
        <h1>Minhas Playlists</h1>
        <p>Gerencie suas coleções de músicas</p>
      </Header>

      <Grid>
        <CreatePlaylistButton onClick={() => setShowCreateModal(true)}>
          <AiOutlinePlus />
          <span>Criar Nova Playlist</span>
        </CreatePlaylistButton>
        
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onClick={() => handlePlaylistClick(playlist)}
          />
        ))}
      </Grid>

      {showCreateModal && (
        <>
          <Overlay onClick={() => setShowCreateModal(false)} />
          <Modal>
            <h3>Nova Playlist</h3>
            <Input
              type="text"
              placeholder="Nome da playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePlaylist()
                }
              }}
            />
            <Button $primary onClick={handleCreatePlaylist}>
              Criar
            </Button>
            <Button onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
          </Modal>
        </>
      )}
    </PlaylistsContainer>
  )
}

export default Playlists