import React, { useState } from 'react';
import styled from 'styled-components';
import { AiOutlineCloudDownload, AiOutlineDelete, AiOutlineTool } from 'react-icons/ai';

const SettingsContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  color: white;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .icon {
    color: #1db954;
    font-size: 1.2rem;
  }
  
  .title {
    font-weight: 600;
    font-size: 1rem;
  }
`;

const Section = styled.div`
  margin-bottom: 16px;
  
  .section-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const BufferInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 0.85rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .label {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .value {
    color: white;
    font-weight: 500;
  }
`;

const Button = styled.button`
  background: ${props => props.danger ? '#e74c3c' : '#1db954'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.danger ? '#c0392b' : '#1ed760'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  
  input[type="checkbox"] {
    appearance: none;
    width: 40px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:checked {
      background: #1db954;
      
      &::after {
        transform: translateX(20px);
      }
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
  }
`;

const BufferSettings = ({ 
  bufferInfo, 
  onClearAllBuffers, 
  onClearTrackBuffer, 
  currentTrack,
  isEnabled = true,
  onToggleEnabled 
}) => {
  const [isClearing, setIsClearing] = useState(false);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes} min`;
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await onClearAllBuffers();
    } catch (error) {
      console.error('Erro ao limpar buffer:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearCurrent = async () => {
    if (!currentTrack) return;
    
    setIsClearing(true);
    try {
      await onClearTrackBuffer(currentTrack.id);
    } catch (error) {
      console.error('Erro ao limpar buffer da faixa:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <AiOutlineTool className="icon" />
        <span className="title">Configurações do Buffer</span>
      </Header>

      <Section>
        <div className="section-title">Status do Sistema</div>
        <Toggle>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={onToggleEnabled}
          />
          <span>Buffer automático ativado</span>
        </Toggle>
      </Section>

      {bufferInfo && (
        <Section>
          <div className="section-title">Informações do Buffer</div>
          <BufferInfo>
            <div className="info-row">
              <span className="label">Faixas em buffer:</span>
              <span className="value">{bufferInfo.bufferedTracks.length}</span>
            </div>
            <div className="info-row">
              <span className="label">Tempo total:</span>
              <span className="value">{formatTime(bufferInfo.totalBufferedTime)}</span>
            </div>
            <div className="info-row">
              <span className="label">Limite:</span>
              <span className="value">{formatTime(bufferInfo.bufferSize)}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className="value">
                {bufferInfo.isBuffering ? 'Carregando...' : 'Pronto'}
              </span>
            </div>
          </BufferInfo>
        </Section>
      )}

      <Section>
        <div className="section-title">Gerenciar Buffer</div>
        <ButtonGroup>
          {currentTrack && (
            <Button 
              onClick={handleClearCurrent}
              disabled={isClearing || !bufferInfo?.bufferedTracks.includes(currentTrack.id)}
              danger
            >
              <AiOutlineDelete />
              Limpar Atual
            </Button>
          )}
          <Button 
            onClick={handleClearAll}
            disabled={isClearing || !bufferInfo?.bufferedTracks.length}
            danger
          >
            <AiOutlineDelete />
            Limpar Tudo
          </Button>
        </ButtonGroup>
      </Section>

      <Section>
        <div className="section-title">Sobre o Buffer</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
          O sistema de buffer carrega automaticamente até 20 minutos de áudio em memória, 
          permitindo reprodução contínua mesmo sem conexão com a internet.
        </div>
      </Section>
    </SettingsContainer>
  );
};

export default BufferSettings; 