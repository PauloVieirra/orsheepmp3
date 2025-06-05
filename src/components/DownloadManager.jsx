import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { AiOutlineDelete, AiOutlineFolder } from 'react-icons/ai'
import DownloadService from '../services/DownloadService'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: #282828;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    margin: 0;
    color: white;
    font-size: 1.5rem;
  }

  p {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
`

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;

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
`

const DownloadItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    min-width: 0;
    
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
      display: flex;
      gap: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        svg {
          opacity: 0.7;
        }
      }
    }
  }
`

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff4444;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(255, 68, 68, 0.1);
    transform: scale(1.1);
  }

  svg {
    font-size: 1.2rem;
  }
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px;
    color: white;
  }
`

const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$primary ? `
    background: #1db954;
    color: white;

    &:hover {
      background: #1ed760;
    }
  ` : `
    background: transparent;
    color: white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`

const DownloadManager = ({ isOpen, onClose }) => {
  const [downloads, setDownloads] = useState([])
  const [downloadPath, setDownloadPath] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadDownloads()
    }
  }, [isOpen])

  const loadDownloads = async () => {
    const tracks = await DownloadService.getOfflineTracks()
    setDownloads(tracks)
    // Em um cenário real, você obteria o caminho do backend
    setDownloadPath('E:\\Projetos\\ReactJs\\gestorui\\downloads')
  }

  const handleDelete = async (track) => {
    if (window.confirm('Tem certeza que deseja excluir esta música? Esta ação não pode ser desfeita.')) {
      try {
        const updatedTracks = downloads.filter(t => t.id !== track.id)
        localStorage.setItem('offlineTracks', JSON.stringify(updatedTracks))
        setDownloads(updatedTracks)
      } catch (error) {
        console.error('Erro ao excluir música:', error)
        alert('Erro ao excluir a música. Tente novamente.')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleOpenDownloadsFolder = () => {
    try {
      // Tenta usar o electron shell se disponível
      if (window.electron?.shell) {
        window.electron.shell.openPath(downloadPath)
      } else {
        // Se não for electron, mostra o caminho para o usuário
        alert(`O diretório de downloads está em: ${downloadPath}\nPor favor, acesse manualmente através do seu explorador de arquivos.`)
      }
    } catch (error) {
      console.error('Erro ao abrir diretório:', error)
      alert('Não foi possível abrir o diretório de downloads automaticamente.')
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Gerenciar Downloads</h2>
          <p>
            <AiOutlineFolder style={{ marginRight: 8 }} />
            {downloadPath}
          </p>
        </ModalHeader>
        
        <ModalBody>
          {downloads.length > 0 ? (
            downloads.map(track => (
              <DownloadItem key={track.id}>
                <img
                  src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
                  alt={track.title}
                />
                <div className="info">
                  <h3>{track.title}</h3>
                  <p>
                    <span>
                      Baixado em: {formatDate(track.downloadDate)}
                    </span>
                  </p>
                </div>
                <DeleteButton onClick={() => handleDelete(track)}>
                  <AiOutlineDelete />
                </DeleteButton>
              </DownloadItem>
            ))
          ) : (
            <EmptyMessage>
              <AiOutlineFolder />
              <h3>Nenhuma música baixada</h3>
              <p>Você ainda não baixou nenhuma música.</p>
            </EmptyMessage>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
          <Button $primary onClick={handleOpenDownloadsFolder}>
            Abrir Pasta
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  )
}

export default DownloadManager 