import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const YOUTUBE_API_KEY = 'AIzaSyDhOlUtzZro4dtjdAq7bVzV7higB_UlldA'; // Substitua pela sua chave de API do YouTube

const AlbumCover = styled.div`
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MainInfo = styled.div`
  padding: 16px;
  text-align: center;
  
  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: white;
  }
  
  p {
    margin: 8px 0 0;
    font-size: 0.9rem;
    color: #b3b3b3;
  }
`;

const SearchContainer = styled.div`
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  background: #121212;
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  z-index: 1001;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const SearchResult = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .info {
    flex: 1;
    overflow: hidden;
    
    h4 {
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
      color: rgba(255, 255, 255, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const PlayerContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: #121212;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 2;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const PlaylistContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 2px;
  }
`;

const PlaylistItem = styled.div`
  padding: 12px 16px;
  background: ${props => props['data-is-active'] ? '#333' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s ease;
  &:hover {
    background: #2e2e2e;
  }
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
`;

const TrackInfo = styled.div`
  flex: 1;
  overflow: hidden;
  
  h4 {
    margin: 0;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${props => props['data-is-active'] ? '#1db954' : 'white'};
  }
  
  p {
    margin: 4px 0 0;
    font-size: 0.75rem;
    color: #b3b3b3;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #121212;
  margin-top: auto;
  
  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
  }

  .error-message {
    color: #ff4444;
    font-size: 0.8rem;
    text-align: center;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: ${props => props.primary ? '3rem' : '1.5rem'};
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => props.active ? '1' : '0.7'};
  
  &:hover {
    transform: ${props => props.primary ? 'scale(1.1)' : 'scale(1.05)'};
    opacity: 1;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: #1db954;
  transition: width 0.1s linear;
  position: absolute;
  top: 0;
  left: 0;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  padding: 0 2px;
`;

const PLAYLIST_STORAGE_KEY = 'youtube_playlist';

const MusicPlayer = () => {
  const [playlist, setPlaylist] = useState(() => {
    const savedPlaylist = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    return savedPlaylist ? JSON.parse(savedPlaylist) : [];
  });
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    // Carregar a API do YouTube IFrame
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: onPlayerStateChange,
          onReady: () => {
            // Solicitar permissão de notificação
            if ('Notification' in window) {
              Notification.requestPermission();
            }
          },
          onError: (e) => {
            console.error('Erro do player:', e);
            setError('Erro ao reproduzir o vídeo');
            setIsPlaying(false);
          }
        },
      });
    };

    // Configurar o manipulador de visibilidade da página
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      handleNextTrack();
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      setDuration(playerRef.current.getDuration());
      startProgressTimer();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      stopProgressTimer();
    }
  };

  const startProgressTimer = () => {
    stopProgressTimer();
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handlePreviousTrack = () => {
    if (!currentTrack || !playlist.length) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    handleTrackSelect(playlist[previousIndex]);
  };

  const handleNextTrack = () => {
    if (!currentTrack || !playlist.length) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    handleTrackSelect(playlist[nextIndex]);
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getVideoTitle = async (videoId) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      return data.title || 'Título indisponível';
    } catch (error) {
      console.error('Erro ao buscar título do vídeo:', error);
      return 'Título indisponível';
    }
  };

  const handleAddTrack = async (e) => {
    e.preventDefault();
    const url = e.target.value;
    const videoId = extractVideoId(url);
    
    if (videoId && !playlist.find(track => track.id === videoId)) {
      const title = await getVideoTitle(videoId);
      const newTrack = {
        id: videoId,
        url,
        title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`
      };
      const updatedPlaylist = [...playlist, newTrack];
      setPlaylist(updatedPlaylist);
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updatedPlaylist));
      e.target.value = '';
    }
  };

  const handleTrackSelect = (track) => {
    try {
      setCurrentTrack(track);
      playerRef.current.loadVideoById(track.id);
      setIsPlaying(true);
      setError('');
      
      // Notificar o service worker sobre a reprodução em segundo plano
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'BACKGROUND_AUDIO',
          payload: { title: track.title }
        });
      }
    } catch (err) {
      setError('Erro ao reproduzir a música. Por favor, tente novamente.');
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && isPlaying && currentTrack) {
      // Mostrar notificação quando a página estiver em segundo plano
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Música em Reprodução', {
          body: `Reproduzindo: ${currentTrack.title}`,
          icon: '/logo.png',
          tag: 'background-playback',
          silent: true
        });
      }
    }
  };

  const togglePlayPause = () => {
    if (currentTrack) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchYouTube = async (query, pageToken = '') => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
      );
      const data = await response.json();
      
      if (!data || !data.items) {
        console.error('Resposta da API inválida:', data);
        setError('Erro ao buscar vídeos');
        return;
      }

      if (pageToken) {
        setSearchResults(prev => [...(prev || []), ...data.items]);
      } else {
        setSearchResults(data.items);
      }
      
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error('Erro na busca:', error);
      setError('Erro ao buscar vídeos');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchYouTube(query);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isSearching && nextPageToken) {
      searchYouTube(searchQuery, nextPageToken);
    }
  };

  const handleSearchResultClick = (video) => {
    if (!video || !video.id || !video.id.videoId || !video.snippet) {
      console.error('Dados do vídeo inválidos:', video);
      setError('Erro ao adicionar vídeo');
      return;
    }

    const newTrack = {
      id: video.id.videoId,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      title: video.snippet.title || 'Sem título',
      thumbnail: video.snippet.thumbnails?.default?.url || ''
    };
    
    if (!playlist.find(track => track.id === newTrack.id)) {
      const updatedPlaylist = [...playlist, newTrack];
      setPlaylist(updatedPlaylist);
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updatedPlaylist));
    }
    
    setSearchResults([]);
    setSearchQuery('');
    setError('');
  };

  return (
    <PlayerContainer
      ref={containerRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div id="youtube-player" style={{ display: 'none' }} />
      {currentTrack && (
        <>
          <AlbumCover>
            <img 
              src={`https://img.youtube.com/vi/${currentTrack.id}/maxresdefault.jpg`}
              alt={currentTrack.title}
            />
          </AlbumCover>
          <MainInfo>
            <h2>{currentTrack.title}</h2>
            <p>YouTube Music</p>
          </MainInfo>
        </>
      )}
      <div id="youtube-player" style={{ display: 'none' }} />
      <div style={{ position: 'relative' }}>
        <Input
          type="text"
          placeholder="Busque ou cole um link do YouTube"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.includes('youtube.com')) {
              handleAddTrack({
                preventDefault: () => {},
                target: { value: searchQuery }
              });
              setSearchQuery('');
            }
          }}
        />
        {searchResults.length > 0 && (
          <SearchContainer ref={searchContainerRef} onScroll={handleSearchScroll}>
            {searchResults.map((video) => (
              <SearchResult
                key={`${video.id.videoId}-${video.etag}`}
                onClick={() => handleSearchResultClick(video)}
              >
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                />
                <div className="info">
                  <h4>{video.snippet.title}</h4>
                  <p>{video.snippet.channelTitle}</p>
                </div>
              </SearchResult>
            ))}
            {isSearching && <div style={{ padding: '10px', textAlign: 'center' }}>Carregando...</div>}
          </SearchContainer>
        )}
      </div>
      <PlaylistContainer>
        {playlist.map((track) => (
          <PlaylistItem
            key={track.id}
            onClick={() => handleTrackSelect(track)}
            data-is-active={currentTrack?.id === track.id}
          >
            <Thumbnail src={track.thumbnail} alt={track.title} />
            <TrackInfo>
              <h4>{track.title}</h4>
            </TrackInfo>
          </PlaylistItem>
        ))}
      </PlaylistContainer>
      <Controls>
        <div className="buttons">
          <Button onClick={handlePreviousTrack} disabled={!currentTrack}>⏮</Button>
          <Button 
            onClick={togglePlayPause} 
            disabled={!currentTrack} 
            primary 
            active={isPlaying}
          >
            {isPlaying ? '⏸' : '▶'}
          </Button>
          <Button onClick={handleNextTrack} disabled={!currentTrack}>⏭</Button>
        </div>
        <ProgressBar onClick={handleProgressClick}>
          <Progress style={{ width: `${(currentTime / duration) * 100}%` }} />
        </ProgressBar>
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </TimeDisplay>
        {error && <div className="error-message">{error}</div>}
      </Controls>
    </PlayerContainer>
  );
};

export default MusicPlayer;