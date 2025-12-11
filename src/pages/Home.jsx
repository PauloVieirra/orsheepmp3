import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '../contexts/StorageContext'
import { usePlayer } from '../contexts/PlayerContext'
import { useApiKey } from '../contexts/ApiKeyContext'
import { useInterests } from '../contexts/InterestsContext'
import { AiOutlinePlayCircle, AiFillPlayCircle, AiOutlineHeart } from 'react-icons/ai'
import InstallPWA from '../components/InstallPWA'

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

const InterestsSection = styled(Section)`
  .content {
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    padding-bottom: 16px;

    /* Esconde a scrollbar no Chrome/Safari */
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Esconde a scrollbar no Firefox */
    scrollbar-width: none;
  }
`

const InterestsRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 4px;
  min-width: min-content;

  /* Adiciona um espaço no final para o último card */
  &::after {
    content: '';
    flex: 0 0 1px;
  }
`

const InterestCard = styled.div`
  flex: 0 0 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

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
      color: white;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 4px 0 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }
  }
`

const EmptyInterestMessage = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0;
  
  svg {
    font-size: 2rem;
    color: #8B5CF6;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  h3 {
    margin: 0 0 8px;
    color: white;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`

const TrackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 4px;
`

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding-bottom: 16px;
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

const WelcomeCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;

  h2 {
    font-size: 1.8rem;
    color: white;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #8B5CF6;
    font-size: 1.2rem;
    margin-bottom: 24px;
  }

  .description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }
`

const EmptyCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);

  svg {
    font-size: 2rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`

const EmptyPlaylistCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  width: calc(65vw - 20px); /* Mesmo tamanho dos outros cards */
  max-width: 300px;
  min-width: 200px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 2rem;
    color: #8B5CF6;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  h3 {
    margin: 0 0 8px;
    color: white;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`

const EmptyTrackCard = styled(EmptyCard)`
  min-height: 220px;
`

const PlaylistsSection = styled.section`
  margin-bottom: 32px;
  overflow: hidden;

  h2 {
    font-size: 1.5rem;
    color: white;
    margin: 0 0 16px;
  }

  .content {
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    padding-bottom: 16px;
    margin: 0 -20px;
    padding: 0 20px;

    /* Esconde a scrollbar no Chrome/Safari */
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Esconde a scrollbar no Firefox */
    scrollbar-width: none;
  }
`

const PlaylistsRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 4px;
  width: fit-content;

  & > * {
    flex: 0 0 calc(65vw - 20px); /* 1.5 itens por vez (considerando o padding da página) */
    max-width: 300px; /* Limita o tamanho máximo do card */
    min-width: 200px; /* Garante um tamanho mínimo para o card */
  }
`

const PlaylistCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 1;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }

  .cover {
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    background: #282828;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-icon {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 2rem;
      color: #8B5CF6;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
      pointer-events: none;
    }
  }

  &:hover .cover .play-icon {
    opacity: 1;
  }

  .info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    z-index: 1;

    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    p {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
  }
`

const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
  if (!videoId) return ''
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

const Home = () => {
  const navigate = useNavigate()
  const { getPlaylists, getFavoriteTracks, playlistsVersion } = useStorage()
  const { playTrack, playPlaylist, currentTrack } = usePlayer()
  const { apiKey, isLoading: isApiKeyLoading } = useApiKey()
  const { interests, isLoading: isLoadingInterests } = useInterests()
  const [playlists, setPlaylists] = useState([])
  const [favoriteTracks, setFavoriteTracks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        console.log('Carregando dados...')
        
        // Carregar dados do storage
        const savedPlaylists = await getPlaylists()
        const savedFavoriteTracks = await getFavoriteTracks()
        
        console.log('Playlists carregadas:', savedPlaylists)
        console.log('Músicas favoritas carregadas:', savedFavoriteTracks)
        
        // Atualizar o estado com os dados carregados
        setPlaylists(savedPlaylists || [])
        setFavoriteTracks(savedFavoriteTracks || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [getPlaylists, getFavoriteTracks, playlistsVersion])

  const handlePlayTrack = (track) => {
    playTrack(track)
    navigate('/player', { 
      state: { 
        track,
        fromHome: true,
        keepPlaying: true
      }
    })
  }

  const handlePlaylistClick = (playlist) => {
    if (playlist.tracks.length > 0) {
      playPlaylist(playlist)
      navigate('/player', { 
        state: { 
          track: playlist.tracks[0],
          fromHome: true,
          keepPlaying: true
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

  if (isApiKeyLoading || isLoadingInterests) {
    return (
      <HomeContainer>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '20px' }}>
          Carregando...
        </div>
      </HomeContainer>
    )
  }

  return (
    <HomeContainer>
      
      <InstallPWA />
   
      {!apiKey ? (
       <WelcomeCard>
       <h2>🎵 Orsheep Music Player</h2>
       <div className="subtitle">Configure sua chave da API do YouTube e comece a usar</div>
       
       <div className="description">
         Para começar a usar o Orsheep Music Player, você precisa realizar uma configuração simples e rápida:
     
         <br /><br />
     
         1. Acesse o site <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a> e crie uma conta (caso ainda não tenha uma).  
         2. Crie um novo projeto e ative a API YouTube Data v3.  
         3. Em seguida, gere uma **chave de API**.  
         4. Copie essa chave e cole na <strong>página de configurações do aplicativo</strong>.
     
         <br /><br />
     
         Pronto! Agora o aplicativo já está funcionando 🎶
     
         <br /><br />
     
         A API do YouTube possui uma **cota diária gratuita**, que é suficiente para um uso moderado de buscas por vídeos e músicas. Caso ultrapasse a cota, as consultas podem ser temporariamente limitadas até o próximo dia.
     
         <br /><br />
     
         Se precisar de ajuda, estamos por aqui para ajudar você a aproveitar ao máximo sua experiência musical com o Orsheep.
       </div>
     </WelcomeCard>
     
      ) : (
        <>
          <WelcomeSection>
            <h1>{getGreeting()}</h1>
            <p>O que você quer ouvir hoje?</p>
          </WelcomeSection>

          <PlaylistsSection>
            <h2>Suas Playlists</h2>
            <div className="content">
              <PlaylistsRow>
                {playlists?.length > 0 ? (
                  playlists.map(playlist => (
                    <PlaylistCard
                      key={playlist.id}
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="cover">
                        {playlist.tracks[0] && (
                          <img 
                            src={`https://img.youtube.com/vi/${playlist.tracks[0].id}/mqdefault.jpg`}
                            alt={playlist.name}
                            onError={(e) => {
                              e.target.src = `https://img.youtube.com/vi/${playlist.tracks[0].id}/default.jpg`
                            }}
                          />
                        )}
                        <AiFillPlayCircle className="play-icon" />
                      </div>
                      <div className="info">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.tracks.length} músicas</p>
                      </div>
                    </PlaylistCard>
                  ))
                ) : (
                  <EmptyPlaylistCard>
                    <AiOutlinePlayCircle />
                    <h3>Nenhuma playlist criada</h3>
                    <p>Crie sua primeira playlist para começar</p>
                  </EmptyPlaylistCard>
                )}
              </PlaylistsRow>
            </div>
          </PlaylistsSection>

          <InterestsSection>
            <h2>Meus Interesses</h2>
            {interests.length > 0 ? (
              <div className="content">
                <InterestsRow>
                  {interests.map(track => (
                    <InterestCard 
                      key={track.id}
                      onClick={() => handlePlayTrack(track)}
                    >
                      <img 
                        src={track.thumbnail || getYouTubeThumbnail(track.id)}
                        alt={track.title} 
                        onError={(e) => {
                          e.target.src = getYouTubeThumbnail(track.id, 'default')
                        }}
                      />
                      <div className="info">
                        <h3>{track.title}</h3>
                        <p>{track.channelTitle || 'YouTube Music'}</p>
                      </div>
                    </InterestCard>
                  ))}
                </InterestsRow>
              </div>
            ) : (
              <EmptyInterestMessage>
                <AiOutlinePlayCircle />
                <h3>Nenhuma música adicionada aos interesses</h3>
                <p>Adicione músicas que você mais gosta para aparecerem aqui</p>
              </EmptyInterestMessage>
            )}
          </InterestsSection>

          <Section>
            <h2>Músicas Curtidas</h2>
            <TrackGrid>
              {favoriteTracks?.length > 0 ? (
                favoriteTracks.map(track => (
                  <TrackCard 
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className={currentTrack?.id === track.id ? 'playing' : ''}
                  >
                    <img 
                      src={track.image || getYouTubeThumbnail(track.id)}
                      alt={track.title} 
                      onError={(e) => {
                        e.target.src = getYouTubeThumbnail(track.id, 'default')
                      }}
                    />
                    <h3>{track.title}</h3>
                    <p>{track.artist || 'YouTube Music'}</p>
                    <PlayingIndicator className="playing-indicator">
                      <AiFillPlayCircle /> Tocando
                    </PlayingIndicator>
                  </TrackCard>
                ))
              ) : (
                <>
                  <EmptyTrackCard>
                    <AiOutlineHeart />
                    <h3>Nenhuma música curtida</h3>
                    <p>As músicas que você curtir aparecerão aqui</p>
                  </EmptyTrackCard>
                  <EmptyTrackCard />
                </>
              )}
            </TrackGrid>
          </Section>
        </>
      )}
    </HomeContainer>
  )
}

export default Home