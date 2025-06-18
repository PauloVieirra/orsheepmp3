import React from 'react';
import styled from 'styled-components';
import { AiOutlineCloudDownload } from 'react-icons/ai';

const BufferContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  color: white;
  z-index: 1000;
  min-width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  ${props => !props.isVisible && `
    opacity: 0;
    transform: translateX(100%);
    pointer-events: none;
  `}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  .icon {
    color: #1db954;
    font-size: 1.2rem;
    animation: ${props => props.isBuffering ? 'pulse 1.5s infinite' : 'none'};
  }
  
  .title {
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #1db954, #1ed760);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TrackInfo = styled.div`
  margin-bottom: 8px;
  
  .track-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: white;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status {
    font-size: 0.75rem;
    color: ${props => props.isBuffering ? '#1db954' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

const BufferStats = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  
  .stats-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BufferProgress = ({ 
  isVisible, 
  isBuffering, 
  progress, 
  currentTrack, 
  bufferInfo, 
  onClose 
}) => {
  if (!isVisible) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBufferTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes} min`;
  };

  return (
    <BufferContainer isVisible={isVisible}>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <Header isBuffering={isBuffering}>
        <AiOutlineCloudDownload className="icon" />
        <span className="title">Buffer de Áudio</span>
      </Header>

      {currentTrack && (
        <TrackInfo isBuffering={isBuffering}>
          <div className="track-title">{currentTrack.title}</div>
          <div className="status">
            {isBuffering ? 'Carregando...' : 'Buffer completo'}
          </div>
        </TrackInfo>
      )}

      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <Info>
        <span>{Math.round(progress)}%</span>
        <span>{isBuffering ? 'Carregando...' : 'Pronto'}</span>
      </Info>

      {bufferInfo && (
        <BufferStats>
          <div className="stats-row">
            <span>Faixas em buffer:</span>
            <span>{bufferInfo.bufferedTracks.length}</span>
          </div>
          <div className="stats-row">
            <span>Tempo total:</span>
            <span>{formatBufferTime(bufferInfo.totalBufferedTime)}</span>
          </div>
          <div className="stats-row">
            <span>Limite:</span>
            <span>{formatBufferTime(bufferInfo.bufferSize)}</span>
          </div>
        </BufferStats>
      )}
    </BufferContainer>
  );
};

export default BufferProgress; 