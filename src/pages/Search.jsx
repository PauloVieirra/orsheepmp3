import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'
import { AiOutlineSearch, AiOutlineHeart, AiFillHeart, AiOutlineHistory, AiOutlineClose, AiOutlineUnorderedList, AiOutlineDatabase, AiOutlineHdd, AiOutlineClockCircle } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import { useApiKey } from '../contexts/ApiKeyContext'
import { useInterests } from '../contexts/InterestsContext'
import { useStorage } from '../contexts/StorageContext'

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

const CacheIndicator = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
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

const QuotaExceededMessage = styled.div`
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin: 20px 0;
  color: white;

  h3 {
    font-size: 1.2rem;
    margin: 0 0 12px;
    color: #8B5CF6;
  }

  p {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }

  .emoji {
    font-size: 2rem;
    margin-bottom: 16px;
  }

  .tip {
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 12px;
    border-radius: 8px;
    margin-top: 16px;
  }
`

const CacheStats = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);

  h4 {
    margin: 0 0 8px;
    font-size: 0.9rem;
    color: white;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      font-size: 1rem;
      opacity: 0.7;
    }
  }
`

const Search = () => {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('lastSearchTerm') || ''
  })
  const [allResults, setAllResults] = useState(() => {
    const cachedResults = localStorage.getItem('searchResults')
    return cachedResults ? JSON.parse(cachedResults) : []
  })
  const [visibleResults, setVisibleResults] = useState(() => {
    const cachedResults = localStorage.getItem('searchResults')
    return cachedResults ? JSON.parse(cachedResults).slice(0, 10) : []
  })
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
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)
  const searchTimeout = useRef(null)
  const lastSearchCache = useRef(new Map())
  const [isFromCache, setIsFromCache] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cacheStats, setCacheStats] = useState({
    totalItems: 0,
    cacheSize: '0 KB',
    lastUpdate: null
  })
  const { addToInterests, isInInterests } = useInterests()
  const { getPlaylists, savePlaylists } = useStorage()

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message })
  }

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const savedPlaylists = await getPlaylists()
        setPlaylists(savedPlaylists || [])
      } catch (error) {
        console.error('Erro ao carregar playlists:', error)
        setPlaylists([])
      }
    }
    loadPlaylists()
  }, [getPlaylists])

  // Carrega os resultados iniciais do cache
  useEffect(() => {
    const lastTerm = localStorage.getItem('lastSearchTerm')
    if (lastTerm) {
      const cachedResults = lastSearchCache.current.get(lastTerm) || JSON.parse(localStorage.getItem('searchResults') || '[]')
      if (cachedResults.length > 0) {
        setAllResults(cachedResults)
        setVisibleResults(cachedResults.slice(0, resultsPerPage))
        setIsFromCache(true)
      }
    }
  }, [resultsPerPage])

  // Limita o tamanho do cache no localStorage
  useEffect(() => {
    const cleanupCache = () => {
      try {
        const cachedResults = JSON.parse(localStorage.getItem('searchResults') || '[]')
        if (cachedResults.length > 100) {
          localStorage.setItem('searchResults', JSON.stringify(cachedResults.slice(0, 50)))
        }
      } catch (error) {
        console.error('Erro ao limpar cache:', error)
        localStorage.removeItem('searchResults')
      }
    }

    window.addEventListener('beforeunload', cleanupCache)
    return () => window.removeEventListener('beforeunload', cleanupCache)
  }, [])

  // Otimiza o cache em memória
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSearchCache.current.size > 20) {
        const entries = Array.from(lastSearchCache.current.entries())
        const sortedEntries = entries.sort(([, a], [, b]) => b.length - a.length)
        lastSearchCache.current = new Map(sortedEntries.slice(0, 10))
      }
    }, 5 * 60 * 1000) // A cada 5 minutos

    return () => clearInterval(interval)
  }, [])

  // Atualiza as estatísticas do cache
  const updateCacheStats = useCallback(() => {
    try {
      const cachedResults = JSON.parse(localStorage.getItem('searchResults') || '[]')
      const cacheStr = localStorage.getItem('searchResults') || ''
      const cacheSize = new Blob([cacheStr]).size
      const formattedSize = cacheSize > 1024 
        ? `${(cacheSize / 1024).toFixed(1)} KB` 
        : `${cacheSize} B`

      const lastUpdate = cachedResults.length > 0 
        ? Math.max(...cachedResults.map(item => item.timestamp || 0))
        : null

      setCacheStats({
        totalItems: cachedResults.length,
        cacheSize: formattedSize,
        lastUpdate
      })
    } catch (error) {
      console.error('Erro ao calcular estatísticas do cache:', error)
    }
  }, [])

  // Atualiza as estatísticas quando o componente monta e quando o cache é modificado
  useEffect(() => {
    updateCacheStats()
  }, [updateCacheStats, allResults])

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Nunca'
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return 'Agora mesmo'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas atrás`
    return `${Math.floor(seconds / 86400)} dias atrás`
  }

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setAllResults([])
      setVisibleResults([])
      setError(null)
      setIsFromCache(false)
      return
    }

    if (!apiKey) {
      showNotification('error', 'Erro de Configuração', 'Por favor, configure sua chave da API nas configurações.')
      setAllResults([])
      setVisibleResults([])
      setIsFromCache(false)
      return
    }

    // Verifica se temos resultados em cache para este termo
    const cachedResults = lastSearchCache.current.get(term)
    if (cachedResults) {
      setAllResults(cachedResults)
      setVisibleResults(cachedResults.slice(0, resultsPerPage))
      setCurrentPage(1)
      setIsFromCache(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setIsQuotaExceeded(false)
    setIsFromCache(false)

    try {
      localStorage.setItem('lastSearchTerm', term)

      // Adiciona um timestamp para controle de cache
      const now = Date.now()
      const cacheKey = `${term}_${now}`

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(term)}&type=video&maxResults=50&key=${apiKey}`
      )
      const data = await response.json()

      if (data.error && data.error.message.includes('quota')) {
        setIsQuotaExceeded(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro na busca')
      }

      const results = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        timestamp: now // Adiciona timestamp aos resultados
      }))

      // Atualiza o cache local com timestamp
      lastSearchCache.current.set(term, results)
      
      // Mantém apenas os resultados mais recentes no localStorage
      const currentCache = JSON.parse(localStorage.getItem('searchResults') || '[]')
      const updatedCache = [
        ...results,
        ...currentCache.filter(item => 
          !results.some(newItem => newItem.id === item.id) &&
          now - (item.timestamp || 0) < 24 * 60 * 60 * 1000 // Remove itens mais antigos que 24h
        )
      ].slice(0, 100) // Limita a 100 resultados

      localStorage.setItem('searchResults', JSON.stringify(updatedCache))

      setAllResults(results)
      setVisibleResults(results.slice(0, resultsPerPage))
      setCurrentPage(1)
    } catch (error) {
      console.error('Erro na busca:', error)
      if (error.message.includes('quota')) {
        setIsQuotaExceeded(true)
      } else {
        setError('Erro ao realizar a busca. Tente novamente.')
      }
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

  // Função para limpar o cache de busca
  const clearSearchCache = useCallback(() => {
    lastSearchCache.current.clear()
    localStorage.removeItem('searchResults')
    localStorage.removeItem('lastSearchTerm')
  }, [])

  // Limpa o cache quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Mantém apenas os últimos resultados no localStorage
      const currentResults = localStorage.getItem('searchResults')
      if (currentResults) {
        const results = JSON.parse(currentResults)
        if (results.length > 50) {
          localStorage.setItem('searchResults', JSON.stringify(results.slice(0, 50)))
        }
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (!term.trim()) {
      // Mantém os resultados anteriores visíveis até que uma nova busca seja feita
      return
    }

    // Verifica se já temos resultados em cache para termos similares
    const similarResults = Array.from(lastSearchCache.current.entries())
      .find(([key]) => key.toLowerCase().includes(term.toLowerCase()) || term.toLowerCase().includes(key.toLowerCase()))

    if (similarResults) {
      setAllResults(similarResults[1])
      setVisibleResults(similarResults[1].slice(0, resultsPerPage))
      setCurrentPage(1)
    }

    searchTimeout.current = setTimeout(() => {
      handleSearch(term)
    }, 500)
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
      const success = addToInterests(selectedTrack)
      if (success) {
        showNotification('success', 'Adicionado aos Interesses', 'Música adicionada aos seus interesses!')
      } else {
        showNotification('info', 'Já Adicionado', 'Esta música já está nos seus interesses!')
      }
      setSelectedTrack(null)
    }
  }

  const handleSaveToPlaylist = () => {
    setShowPlaylistModal(true)
  }

  const handleAddToPlaylist = async (playlist) => {
    if (selectedTrack) {
      const trackExists = playlist.tracks.some(t => t.id === selectedTrack.id)
      if (!trackExists) {
        const updatedPlaylist = {
          ...playlist,
          tracks: [...playlist.tracks, selectedTrack]
        }

        const updatedPlaylists = playlists.map(p => 
          p.id === playlist.id ? updatedPlaylist : p
        )

        const success = await savePlaylists(updatedPlaylists)
        if (success) {
          setPlaylists(updatedPlaylists)
          setShowPlaylistModal(false)
          setSelectedTrack(null)
          showNotification('success', 'Música Adicionada', 'Música adicionada à playlist com sucesso!')
        } else {
          showNotification('error', 'Erro', 'Erro ao adicionar música à playlist. Tente novamente.')
        }
      } else {
        showNotification('warning', 'Música Duplicada', 'Esta música já está na playlist!')
        setShowPlaylistModal(false)
        setSelectedTrack(null)
      }
    }
  }

  const getPlaylistThumbnail = (playlist) => {
    if (playlist.tracks.length > 0) {
      return `https://img.youtube.com/vi/${playlist.tracks[0].id}/default.jpg`
    }
    return 'placeholder-image.jpg' // Imagem padrão caso a playlist esteja vazia
  }

  const forceRefresh = useCallback(async () => {
    if (!searchTerm.trim() || isRefreshing) return

    setIsRefreshing(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=50&key=${apiKey}`
      )
      const data = await response.json()

      if (data.error && data.error.message.includes('quota')) {
        setIsQuotaExceeded(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro na busca')
      }

      const results = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle
      }))

      // Atualiza o cache
      lastSearchCache.current.set(searchTerm, results)
      localStorage.setItem('searchResults', JSON.stringify(results))

      setAllResults(results)
      setVisibleResults(results.slice(0, resultsPerPage))
      setCurrentPage(1)
      setIsFromCache(false)
      showNotification('success', 'Atualizado', 'Resultados atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar resultados:', error)
      showNotification('error', 'Erro', 'Não foi possível atualizar os resultados.')
    } finally {
      setIsRefreshing(false)
    }
  }, [searchTerm, apiKey, resultsPerPage, showNotification])

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
        {isFromCache && (
          <CacheIndicator>
            <div className="left">
              <AiOutlineHistory />
              Mostrando resultados salvos localmente
            </div>
            <button onClick={forceRefresh} disabled={isRefreshing || !apiKey}>
              <AiOutlineSearch />
              {isRefreshing ? 'Atualizando...' : 'Atualizar resultados'}
            </button>
          </CacheIndicator>
        )}
        <CacheStats>
          <h4>Informações do Cache</h4>
          <div className="stats">
            <div className="stat-item">
              <AiOutlineDatabase />
              {cacheStats.totalItems} resultados salvos
            </div>
            <div className="stat-item">
              <AiOutlineHdd />
              {cacheStats.cacheSize} utilizados
            </div>
            <div className="stat-item">
              <AiOutlineClockCircle />
              Última atualização: {formatTimeAgo(cacheStats.lastUpdate)}
            </div>
          </div>
        </CacheStats>
      </SearchHeader>
      
      {isQuotaExceeded ? (
        <QuotaExceededMessage>
          <div className="emoji">🎵 ⏰</div>
          <h3>Ops! Atingimos o Limite Diário</h3>
          <p>
            Parece que você está realmente empolgado com a música hoje! 
            Atingimos nossa cota diária de buscas no YouTube, mas não se preocupe, 
            amanhã estaremos de volta com tudo!
          </p>
          <p>
            Enquanto isso, que tal aproveitar as músicas que você já adicionou? 
            Suas playlists e músicas favoritas continuam disponíveis para você curtir!
          </p>
          <div className="tip">
            💡 Dica: A cota é renovada todos os dias à meia-noite (horário do Pacífico/PST)
          </div>
        </QuotaExceededMessage>
      ) : isLoading ? (
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