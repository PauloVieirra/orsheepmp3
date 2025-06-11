import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AiOutlineDownload, AiOutlineCheck, AiOutlineLoading3Quarters } from 'react-icons/ai';
import DownloadService from '../services/DownloadService';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ButtonContainer = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 1.5rem;
  transition: all 0.2s;
  position: relative;

  &:hover {
    color: #8B5CF6;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  span {
    font-size: 0.8rem;
  }
`;

const LoadingIcon = styled(AiOutlineLoading3Quarters)`
  animation: ${rotate} 1s linear infinite;
`;

const ProgressCircle = styled.div`
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid #8B5CF6;
  border-right-color: transparent;
  border-bottom-color: transparent;
  transform: rotate(${props => (props.progress || 0) * 3.6}deg);
  transition: transform 0.3s ease;
`;

const DownloadButton = ({ track, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = async () => {
    if (isDownloading || isDownloaded) return;

    setIsDownloading(true);
    setProgress(0);

    try {
      // Registrar para eventos de progresso
      DownloadService.onProgress((progress) => {
        setProgress(progress);
      });

      const result = await DownloadService.downloadTrack(track);
      
      if (result.success) {
        setIsDownloaded(true);
        if (onDownloadComplete) {
          onDownloadComplete(result);
        }
      } else {
        console.error('Erro no download:', result.message);
      }
    } catch (error) {
      console.error('Erro ao baixar:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ButtonContainer 
      onClick={handleDownload} 
      disabled={isDownloading}
      title={isDownloaded ? "Música baixada" : "Baixar música"}
    >
      {isDownloading ? (
        <>
          <LoadingIcon />
          <ProgressCircle progress={progress} />
          <span>{progress.toFixed(0)}%</span>
        </>
      ) : isDownloaded ? (
        <>
          <AiOutlineCheck style={{ color: '#10B981' }} />
          <span>Baixado</span>
        </>
      ) : (
        <>
          <AiOutlineDownload />
          <span>Baixar</span>
        </>
      )}
    </ButtonContainer>
  );
};

export default DownloadButton; 