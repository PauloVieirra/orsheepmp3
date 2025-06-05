import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '../contexts/StorageContext'
import { usePlayer } from '../contexts/PlayerContext'
import { useApiKey } from '../contexts/ApiKeyContext'
import PlaylistCard from '../components/PlaylistCard'
import { AiOutlinePlayCircle, AiFillPlayCircle, AiOutlineUser, AiOutlineLinkedin } from 'react-icons/ai'
import InstallPWA from '../components/InstallPWA'

const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
  if (!videoId) return ''
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

const HomeContainer = styled.div`
  padding: 20px;
  padding-bottom: calc(140px + 64px);
`

const WelcomeSection = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 2rem;
    color: white;
    margin: 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 8px 0 0;
  }
`

const Section = styled.section`
  margin-bottom: 32px;
  overflow: hidden;

  h2 {
    font-size: 1.5rem;
    color: white;
    margin: 0 0 16px;
  }
`

const TrackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`

const PlaylistsGrid = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  & > * {
    flex: 0 0 calc(40% - 8px); /* 2.5 itens visíveis */
    scroll-snap-align: start;
  }
`

const TrackCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  &:active {
    transform: scale(0.98);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
    pointer-events: none;
  }

  &.clicked::after {
    width: 200%;
    height: 200%;
    opacity: 0;
  }

  &.playing {
    background: rgba(29, 185, 84, 0.1);
    border: 1px solid rgba(29, 185, 84, 0.3);

    &:hover {
      background: rgba(29, 185, 84, 0.15);
    }

    .playing-indicator {
      display: flex;
    }
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1rem;
    color: white;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`

const PlayingIndicator = styled.div`
  display: none;
  position: absolute;
  top: 8px;
  right: 8px;
  background: #1db954;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.7rem;
  color: white;
  align-items: center;
  gap: 4px;

  svg {
    font-size: 1rem;
  }
`

const FavoriteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isFavorite ? '#8B5CF6' : 'white'};
  transition: transform 0.2s, color 0.2s;
  
  &:hover {
    transform: scale(1.1);
    color: ${props => props.$isFavorite ? '#7C3AED' : '#8B5CF6'};
  }
`

const Card = styled.div`
  position: relative;
  flex: 0 0 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }
  
  img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  
  .info {
    padding: 12px;
    
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

const WelcomeCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;

  h2 {
    color: #1db954;
    font-size: 2.5rem;
    margin: 0 0 16px;
    text-align: center;
  }

  .subtitle {
    color: white;
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 24px;
  }

  .description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .tutorial {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;

    h3 {
      color: white;
      margin: 0 0 12px;
    }

    ol {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      padding-left: 24px;

      li {
        margin-bottom: 8px;
      }

      a {
        color: #8B5CF6;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`

const InterestScroll = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 16px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`

const InterestCard = styled.div`
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .info {
    padding: 12px;

    h3 {
      margin: 0;
      font-size: 1rem;
      color: white;
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
`

const RecentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`

const RecentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
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
    min-width: 0;

    h3 {
      margin: 0;
      font-size: 0.9rem;
      color: white;
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

  .play-icon {
    opacity: 0;
    color: #1db954;
    font-size: 1.5rem;
    transition: opacity 0.2s;
  }

  &:hover .play-icon {
    opacity: 1;
  }
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8B5CF6;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(139, 92, 246, 0.1);
    transition: all 0.2s;

    &:hover {
      background: rgba(139, 92, 246, 0.2);
      transform: translateY(-2px);
    }

    svg {
      font-size: 1.2rem;
    }
  }
`

const Home = () => {
  const navigate = useNavigate()
  const { getRecentTracks, getFavorites, saveFavorites, saveRecentTracks } = useStorage()
  const { playTrack, setQueue, currentTrack, isPlaying } = usePlayer()
  const { apiKey, isLoading: isLoadingApi } = useApiKey()
  const [recentTracks, setRecentTracks] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [favorites, setFavorites] = useState([])
  const [interests, setInterests] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [offlineTracks, setOfflineTracks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recentTracksData, favoritesData] = await Promise.all([
          getRecentTracks(),
          getFavorites()
        ])
        setRecentTracks(recentTracksData || [])
        setFavorites(favoritesData || [])
        
        const savedInterests = JSON.parse(localStorage.getItem('interests') || '[]')
        setInterests(savedInterests)

        const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]')
        setPlaylists(savedPlaylists)

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setRecentTracks([])
        setFavorites([])
        setInterests([])
        setPlaylists([])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])
<<<<<<< HEAD

  const handlePlayTrack = (track) => {
    playTrack(track)
  }

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist.id}`)
  }

  const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
  }
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Mostra loading enquanto verifica a API key
  if (isLoadingApi) {
    return (
      <HomeContainer>
        <WelcomeSection>
          <h1>Carregando...</h1>
        </WelcomeSection>
      </HomeContainer>
    )
  }

=======

  const handlePlayTrack = async (track) => {
    // Adiciona a classe para o efeito visual
    const cards = document.querySelectorAll('.track-card')
    cards.forEach(card => {
      if (card.dataset.trackId === track.id) {
        card.classList.add('clicked')
        setTimeout(() => card.classList.remove('clicked'), 300)
      }
    })

    // Inicia a reprodução imediatamente
    await playTrack(track, true) // Mudamos para true para iniciar automaticamente
    
    // Navega para a página do player após um pequeno delay
    setTimeout(() => {
      navigate('/player', { 
        state: { track },
        replace: true
      })
    }, 100)
  }

  const handlePlaylistClick = (playlist) => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks) // Define a fila de reprodução
      playTrack(playlist.tracks[0]) // Inicia com a primeira música
      navigate('/player', { 
        state: { 
          track: playlist.tracks[0],
          fromHome: true // Indica que veio da home
        }
      })
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const renderCard = (track) => (
    <TrackCard 
      key={track.id} 
      onClick={() => handlePlayTrack(track)}
      className={`track-card ${currentTrack?.id === track.id ? 'playing' : ''}`}
      data-track-id={track.id}
    >
      <img 
        src={track.image || getYouTubeThumbnail(track.id)} 
        alt={track.title}
        onError={(e) => {
          e.target.src = getYouTubeThumbnail(track.id, 'default')
        }}
      />
      <FavoriteButton
        onClick={(e) => toggleFavorite(e, track)}
        $isFavorite={favorites.some(fav => fav.id === track.id)}
      >
        {favorites.some(fav => fav.id === track.id) ? '♥' : '♡'}
      </FavoriteButton>
      <PlayingIndicator className="playing-indicator">
        <AiFillPlayCircle />
        {isPlaying ? 'Tocando' : 'Pausado'}
      </PlayingIndicator>
      <div className="info">
        <h3>{track.title}</h3>
        <p>YouTube Music</p>
      </div>
    </TrackCard>
  )
  
  if (isLoading) {
    return (
      <HomeContainer>
        <WelcomeSection>
          <h1>Carregando...</h1>
        </WelcomeSection>
      </HomeContainer>
    )
  }

>>>>>>> teste
  return (
    <HomeContainer>
      <InstallPWA />
      {!apiKey ? (
        <WelcomeCard>
          <h2>🎵 Orsheep Music Player</h2>
          <div className="subtitle">Sua Jornada Musical com IA e Design Moderno</div>
          
          <div className="description">
            Olá! Me chamo Paulo Vieira, sou UX-UI Design e Programador front-end. No momento estou 
            cursando uma graduação em desenvolvimento mobile. Sou muito curioso, apaixonado por 
            inovação e tecnologia.
            <br /><br />
            O Orsheep Music Player é um projeto inovador que combina o melhor do UX/UI Design com 
            tecnologias modernas como React.js e armazenamento local IndexedDB via LocalForage. 
            Nossa interface foi cuidadosamente projetada para proporcionar uma experiência musical 
            única e intuitiva.
            <br /><br />
            Este projeto foi desenvolvido como exercício de aprendizagem, validando a utilidade das 
            ferramentas de IA para facilitar o trabalho de design de interfaces e experiência do 
            usuário.
          </div>

          <SocialLinks>
            <a href="https://vgents.vercel.app/" target="_blank" rel="noopener noreferrer">
              <AiOutlineUser />
              Portfólio
            </a>
            <a href="https://www.linkedin.com/in/paulo-vieira-a16723210/" target="_blank" rel="noopener noreferrer">
              <AiOutlineLinkedin />
              LinkedIn
            </a>
          </SocialLinks>

          <div className="tutorial">
            <h3>📝 Como Começar</h3>
            <ol>
              <li>
                Primeiro, você precisa de uma chave da API do YouTube v3. Você pode obtê-la
                gratuitamente no <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                Google Cloud Console</a>.
              </li>
              <li>
                A API oferece uma cota diária gratuita que geralmente é suficiente para uso
                moderado do aplicativo.
              </li>
              <li>
                Após obter sua chave, vá até a página de Configurações e adicione-a no campo
                apropriado.
              </li>
              <li>
                Pronto! Agora você pode pesquisar e desfrutar de suas músicas favoritas com
                nossa interface moderna e intuitiva.
              </li>
            </ol>
          </div>
        </WelcomeCard>
      ) : isLoading ? (
        <div>Carregando...</div>
      ) : (
        <>
          <WelcomeSection>
            <h1>{getGreeting()}</h1>
            <p>O que você quer ouvir hoje?</p>
          </WelcomeSection>

          {playlists?.length > 0 && (
            <Section>
              <h2>Suas Playlists</h2>
              <PlaylistsGrid>
                {playlists.map(playlist => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist)}
                  />
                ))}
              </PlaylistsGrid>
            </Section>
          )}

          {interests?.length > 0 && (
            <Section>
              <h2>Seus Interesses</h2>
              <InterestScroll>
                {interests.map(interest => (
                  <InterestCard 
                    key={interest.id} 
                    onClick={() => handlePlayTrack(interest)}
                  >
                    <img 
                      src={interest.image || getYouTubeThumbnail(interest.id)}
                      alt={interest.title}
                      onError={(e) => {
                        e.target.src = getYouTubeThumbnail(interest.id, 'default')
                      }}
                    />
                    <div className="info">
                      <h3>{interest.title}</h3>
                      <p>{interest.tracks}</p>
                    </div>
                  </InterestCard>
                ))}
              </InterestScroll>
            </Section>
          )}

          {recentTracks?.length > 0 && (
            <Section>
              <h2>Ouvidas Recentemente</h2>
              <RecentGrid>
                {recentTracks.map(track => (
                  <RecentCard key={track.id} onClick={() => handlePlayTrack(track)}>
                    <img 
                      src={track.image || getYouTubeThumbnail(track.id)}
                      alt={track.title} 
                      onError={(e) => {
                        e.target.src = getYouTubeThumbnail(track.id, 'default')
                      }}
                    />
                    <div className="info">
                      <h3>{track.title}</h3>
                      <p>{track.artist || 'YouTube Music'}</p>
                    </div>
                    <AiOutlinePlayCircle className="play-icon" />
                  </RecentCard>
                ))}
              </RecentGrid>
            </Section>
          )}

          {favorites?.length > 0 && (
            <Section>
              <h2>Favoritos</h2>
              <TrackGrid>
                {favorites.map(track => renderCard(track))}
              </TrackGrid>
            </Section>
          )}
        </>
      )}
    </HomeContainer>
  )
}

export default Home