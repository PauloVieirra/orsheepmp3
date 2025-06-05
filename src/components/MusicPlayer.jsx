import { useState, useRef } from 'react'
import styled from 'styled-components'

const PlayerContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 100px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  width: 300px;
  color: white;
  cursor: move;
  user-select: none;
`

const PlaylistContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`

const PlaylistItem = styled.div.attrs(props => ({
  'data-is-active': props.isActive
}))`
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 4px 0;
  background: transparent;

  &[data-is-active="true"] {
    background: rgba(255, 255, 255, 0.2);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  margin-bottom: 8px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: center;
`

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

export function MusicPlayer() {
  const [playlist, setPlaylist] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const audioRef = useRef(null)
  const containerRef = useRef(null)

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const addToPlaylist = () => {
    const videoId = extractVideoId(inputValue)
    if (videoId) {
      const newTrack = {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: `Track ${playlist.length + 1}`
      }
      setPlaylist([...playlist, newTrack])
      setInputValue('')
      if (!currentTrack) {
        setCurrentTrack(newTrack)
      }
    }
  }

  const servers = [
    'https://invidious.snopyta.org',
    'https://invidious.kavin.rocks',
    'https://vid.puffyan.us',
    'https://yt.artemislena.eu'
  ]

  const playTrack = async (track) => {
    try {
      setCurrentTrack(track)
      
      // Tenta cada servidor até encontrar um que funcione
      for (const server of servers) {
        try {
          const audioUrl = `${server}/latest_version?id=${track.id}&itag=140`
          if (audioRef.current) {
            audioRef.current.src = audioUrl
            audioRef.current.load()
            await audioRef.current.play()
            return // Se conseguiu tocar, sai da função
          }
        } catch (serverError) {
          console.warn(`Erro no servidor ${server}:`, serverError)
          continue // Tenta o próximo servidor
        }
      }
      
      throw new Error('Nenhum servidor disponível')
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      alert('Não foi possível reproduzir o áudio. Tente novamente mais tarde.')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addToPlaylist()
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <PlayerContainer
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        right: 'auto',
        left: `${position.x}px`,
        top: `${position.y}px`
      }}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Cole o link do YouTube aqui"
      />
      <PlaylistContainer>
        {playlist.map((track) => (
          <PlaylistItem
            key={track.id}
            isActive={currentTrack?.id === track.id}
            onClick={() => playTrack(track)}
          >
            {track.title}
          </PlaylistItem>
        ))}
      </PlaylistContainer>
      <Controls>
        <ControlButton onClick={() => audioRef.current?.play()}>▶️</ControlButton>
        <ControlButton onClick={() => audioRef.current?.pause()}>⏸️</ControlButton>
      </Controls>
      {currentTrack && (
        <audio
          ref={audioRef}
          controls
          style={{ display: 'none' }}
          playsInline
        />
      )}
    </PlayerContainer>
  )
}