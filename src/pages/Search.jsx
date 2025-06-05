import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'
import { AiOutlineSearch, AiOutlineHeart, AiFillHeart, AiOutlineHistory, AiOutlineClose, AiOutlineUnorderedList } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import { useApiKey } from '../contexts/ApiKeyContext'

const SearchContainer = styled.div`
  padding: 20px;
  padding-bottom: 140px;
`

const SearchHeader = styled.div`
  margin-bottom: 24px;
  
  h1 {
    font-size: 2rem;
    color: white;
    margin: 0 0 16px;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SearchResult = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
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
    overflow: hidden;
    
    h3 {
      margin: 0;
      font-size: 1rem;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    p {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }
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

const ModalButton = styled.button`
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
  background: none;
  border: none;
  color: white;
  font-size: ${props => props.$primary ? '3.5rem' : '1.8rem'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: ${props => props.$primary ? 'scale(1.1)' : 'scale(1.2)'};
    color: ${props => props.$primary ? '#1db954' : 'white'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const PlaylistModal = styled(Modal)`
  .playlist-list {
    margin-top: 16px;
    max-height: 300px;
    overflow-y: auto;
  }
`

const PlaylistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    
    h4 {
      margin: 0;
      color: white;
      font-size: 0.9rem;
    }
    
    p {
      margin: 4px 0 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }
  }
`

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const Search = () => {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('lastSearchTerm') || ''
  })
  const [allResults, setAllResults] = useState([])
  const [visibleResults, setVisibleResults] = useState([])
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [notification, setNotification] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 10
  const { playTrack } = usePlayer()
  const { apiKey } = useApiKey()
  const navigate = useNavigate()

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message })
  }

  useEffect(() => {
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]')
    setPlaylists(savedPlaylists)
  }, [])

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setAllResults([])
      setVisibleResults([])
      setError(null)
      return
    }

    if (!apiKey) {
      showNotification('error', 'Erro de Configuração', 'Por favor, configure sua chave da API nas configurações.')
      setAllResults([])
      setVisibleResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(term)}&type=video&maxResults=40&key=${apiKey}`
      )
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const formattedResults = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url
      }))

      setAllResults(formattedResults)
      setVisibleResults(formattedResults.slice(0, resultsPerPage))
      setCurrentPage(1)
      localStorage.setItem('lastSearchTerm', term)
      localStorage.setItem('lastSearchResults', JSON.stringify(formattedResults))
    } catch (error) {
      console.error('Erro na busca:', error)
      showNotification('error', 'Erro na Busca', 'Verifique sua chave da API e tente novamente.')
      setAllResults([])
      setVisibleResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreResults = () => {
    const nextPage = currentPage + 1
    const nextResults = allResults.slice(0, nextPage * resultsPerPage)
    setVisibleResults(nextResults)
    setCurrentPage(nextPage)
  }

  const searchTimeout = useRef(null)

  const handleInputChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (term.trim()) {
      searchTimeout.current = setTimeout(() => {
        handleSearch(term)
      }, 500)
    } else {
      setAllResults([])
      setVisibleResults([])
    }
  }

  const handleResultClick = (track) => {
    setSelectedTrack(track)
  }

  const handlePlayNow = () => {
    if (selectedTrack) {
      playTrack(selectedTrack, true)
      setSelectedTrack(null)
      
      navigate('/player', {
        state: { track: selectedTrack },
        replace: true
      })
    }
  }

  const handleSaveToInterests = () => {
    if (selectedTrack) {
      const interests = JSON.parse(localStorage.getItem('interests') || '[]')
      if (!interests.some(track => track.id === selectedTrack.id)) {
        interests.push({
          ...selectedTrack,
          savedAt: new Date().toISOString()
        })
        localStorage.setItem('interests', JSON.stringify(interests))
        alert('Música adicionada aos seus interesses!')
      } else {
        alert('Esta música já está nos seus interesses!')
      }
      setSelectedTrack(null)
    }
  }

  const handleSaveToPlaylist = () => {
    setShowPlaylistModal(true)
  }

  const handleAddToPlaylist = (playlist) => {
    if (selectedTrack) {
      const updatedPlaylists = playlists.map(p => {
        if (p.id === playlist.id) {
          const trackExists = p.tracks.some(t => t.id === selectedTrack.id)
          if (!trackExists) {
            return {
              ...p,
              tracks: [...p.tracks, selectedTrack]
            }
          }
        }
        return p
      })

      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists))
      setPlaylists(updatedPlaylists)
      setShowPlaylistModal(false)
      setSelectedTrack(null)
      showNotification('success', 'Música Adicionada', 'Música adicionada à playlist com sucesso!')
    }
  }

  const getPlaylistThumbnail = (playlist) => {
    if (playlist.tracks.length > 0) {
      return `https://img.youtube.com/vi/${playlist.tracks[0].id}/default.jpg`
    }
    return 'placeholder-image.jpg' // Imagem padrão caso a playlist esteja vazia
  }
  
  return (
    <SearchContainer>
      <SearchHeader>
        <h1>Buscar</h1>
        <Input
          type="text"
          placeholder="O que você quer ouvir?"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </SearchHeader>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
          Buscando...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444' }}>
          {error}
        </div>
      ) : visibleResults.length > 0 ? (
        <>
          <SearchResults>
            {visibleResults.map(result => (
              <SearchResult key={result.id} onClick={() => handleResultClick(result)}>
                <img src={`https://img.youtube.com/vi/${result.id}/default.jpg`} alt={result.title} />
                <div className="info">
                  <h3>{result.title}</h3>
                  <p>YouTube Music</p>
                </div>
              </SearchResult>
            ))}
          </SearchResults>
          {visibleResults.length < allResults.length && (
            <LoadMoreButton onClick={loadMoreResults}>
              Ver Mais
            </LoadMoreButton>
          )}
        </>
      ) : searchTerm.trim() ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
          Nenhum resultado encontrado
        </div>
      ) : null}

      {selectedTrack && (
        <>
          <Overlay onClick={() => setSelectedTrack(null)} />
          <Modal>
            <h3>O que você deseja fazer?</h3>
            <ModalButton $primary onClick={handlePlayNow}>
              Ouvir Agora
            </ModalButton>
            <ModalButton onClick={handleSaveToInterests}>
              Salvar em Interesses
            </ModalButton>
            <ModalButton onClick={handleSaveToPlaylist}>
              Salvar em Playlist
            </ModalButton>
            <ModalButton onClick={() => setSelectedTrack(null)}>
              Cancelar
            </ModalButton>
          </Modal>
        </>
      )}

      {showPlaylistModal && (
        <>
          <Overlay onClick={() => setShowPlaylistModal(false)} />
          <PlaylistModal>
            <h3>Escolha uma Playlist</h3>
            <div className="playlist-list">
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <PlaylistItem 
                    key={playlist.id} 
                    onClick={() => handleAddToPlaylist(playlist)}
                  >
                    <img 
                      src={getPlaylistThumbnail(playlist)} 
                      alt={playlist.name}
                      onError={(e) => {
                        e.target.src = 'placeholder-image.jpg'
                      }}
                    />
                    <div className="info">
                      <h4>{playlist.name}</h4>
                      <p>{playlist.tracks.length} músicas</p>
                    </div>
                  </PlaylistItem>
                ))
              ) : (
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Nenhuma playlist criada ainda
                </p>
              )}
            </div>
            <ModalButton onClick={() => setShowPlaylistModal(false)}>
              Cancelar
            </ModalButton>
          </PlaylistModal>
        </>
      )}

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </SearchContainer>
  )
}

export default Search