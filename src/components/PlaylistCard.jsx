import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }
`

const MosaicContainer = styled.div`
  width: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  background: #282828;
`

const MosaicImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.05);
`

const Info = styled.div`
  padding: 12px;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  p {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
`

const PlaylistCard = ({ playlist, onClick }) => {
  // Pegar até 4 thumbnails das músicas da playlist
  const thumbnails = playlist.tracks
    .slice(0, 4)
    .map(track => `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`)
  
  // Preencher com placeholders se tiver menos de 4 músicas
  while (thumbnails.length < 4) {
    thumbnails.push(null)
  }

  return (
    <Card onClick={() => onClick(playlist)}>
      <MosaicContainer>
        {thumbnails.map((thumbnail, index) => (
          <MosaicImage key={index} src={thumbnail} />
        ))}
      </MosaicContainer>
      <Info>
        <h3>{playlist.name}</h3>
        <p>{playlist.tracks.length} músicas</p>
      </Info>
    </Card>
  )
}

export default PlaylistCard 