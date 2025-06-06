import React from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Home from './pages/Home'
import Search from './pages/Search'
import Playlists from './pages/Playlists'
import Settings from './pages/Settings'
import PlayerPage from './pages/Player'
import PlaylistPage from './pages/Playlist'
import Offline from './pages/Offline'
import Navigation from './components/Navigation'
import MiniPlayer from './components/MiniPlayer'
import CustomPlayer from './components/CustomPlayer'
import { usePlayer } from './contexts/PlayerContext'

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #121212;
  color: #fff;
  position: relative;
`

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(64px + 72px); // Ajustado para o novo padding do menu
`

const BottomContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #121212;
  z-index: 1000;
`

const AppRoutes = () => {
  const navigate = useNavigate()
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay,
    onPlayerReady,
    onProgress,
    onDuration,
    onEnded,
    seekTo,
    nextTrack,
    previousTrack
  } = usePlayer()
  const location = useLocation()
  const showMiniPlayer = !location.pathname.includes('/player')

  const handleMiniPlayerClick = () => {
    navigate('/player', { 
      state: { 
        track: currentTrack,
        from: location.pathname,
        keepPlaying: true
      }
    })
  }

  return (
    <AppContainer>
      {currentTrack && (
        <CustomPlayer
          url={currentTrack.id}
          title={currentTrack.title}
          playing={isPlaying}
          onPlay={() => togglePlay(true)}
          onPause={() => togglePlay(false)}
          onEnded={onEnded}
          onError={(e) => console.error('Erro no player:', e)}
          onProgress={onProgress}
          onDuration={onDuration}
          onReady={onPlayerReady}
          onPrevious={previousTrack}
          onNext={nextTrack}
          onSeek={seekTo}
        />
      )}
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/offline" element={<Offline />} />
        </Routes>
      </Content>
      <BottomContainer>
        {showMiniPlayer && currentTrack && (
          <MiniPlayer onClick={handleMiniPlayerClick} />
        )}
        <Navigation />
      </BottomContainer>
    </AppContainer>
  )
}

export default AppRoutes 