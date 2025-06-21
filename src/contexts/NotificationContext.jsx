import React, { createContext, useContext, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { AiOutlineCheckCircle, AiOutlineInfoCircle, AiOutlineWarning, AiOutlineClose, AiOutlineHeart, AiOutlinePlus } from 'react-icons/ai'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
`

const NotificationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease;
`

const NotificationCard = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease;

  .icon {
    font-size: 3rem;
    margin-bottom: 16px;
    display: block;
  }

  .title {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
  }

  .message {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.5;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }

  @media (max-width: 600px) {
    padding: 24px;
    margin: 20px;
    
    .icon {
      font-size: 2.5rem;
    }
    
    .title {
      font-size: 1.1rem;
    }
    
    .message {
      font-size: 0.9rem;
    }
  }
`

const getNotificationStyle = (type) => {
  switch (type) {
    case 'success':
      return {
        icon: <AiOutlineCheckCircle style={{ color: '#10B981' }} />,
        title: 'Sucesso!'
      }
    case 'error':
      return {
        icon: <AiOutlineWarning style={{ color: '#EF4444' }} />,
        title: 'Erro!'
      }
    case 'warning':
      return {
        icon: <AiOutlineWarning style={{ color: '#F59E0B' }} />,
        title: 'Atenção!'
      }
    case 'added-to-playlist':
      return {
        icon: <AiOutlinePlus style={{ color: '#8B5CF6' }} />,
        title: 'Adicionado à playlist!'
      }
    case 'liked':
      return {
        icon: <AiOutlineHeart style={{ color: '#EF4444' }} />,
        title: 'Curtido!'
      }
    case 'unliked':
      return {
        icon: <AiOutlineHeart style={{ color: '#6B7280' }} />,
        title: 'Descurtido!'
      }
    default:
      return {
        icon: <AiOutlineInfoCircle style={{ color: '#3B82F6' }} />,
        title: 'Informação'
      }
  }
}

const NotificationModal = ({ notification, onClose }) => {
  const { type, message, customTitle, customIcon } = notification
  const style = getNotificationStyle(type)
  
  const icon = customIcon || style.icon
  const title = customTitle || style.title

  return (
    <NotificationOverlay onClick={onClose}>
      <NotificationCard onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <AiOutlineClose />
        </button>
        <span className="icon">{icon}</span>
        <h3 className="title">{title}</h3>
        <p className="message">{message}</p>
      </NotificationCard>
    </NotificationOverlay>
  )
}

const NotificationContext = createContext({})

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((type, message, customTitle = null, customIcon = null, duration = 2000) => {
    setNotification({ type, message, customTitle, customIcon })
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification(null)
      }, duration)
    }
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const showSuccess = useCallback((message, customTitle = null, duration = 2000) => {
    showNotification('success', message, customTitle, null, duration)
  }, [showNotification])

  const showError = useCallback((message, customTitle = null, duration = 3000) => {
    showNotification('error', message, customTitle, null, duration)
  }, [showNotification])

  const showWarning = useCallback((message, customTitle = null, duration = 3000) => {
    showNotification('warning', message, customTitle, null, duration)
  }, [showNotification])

  const showAddedToPlaylist = useCallback((playlistName, duration = 2000) => {
    showNotification('added-to-playlist', `Música adicionada à playlist "${playlistName}"`, null, null, duration)
  }, [showNotification])

  const showLiked = useCallback((duration = 1500) => {
    showNotification('liked', 'Música adicionada aos favoritos', null, null, duration)
  }, [showNotification])

  const showUnliked = useCallback((duration = 1500) => {
    showNotification('unliked', 'Música removida dos favoritos', null, null, duration)
  }, [showNotification])

  const showInterestAdded = useCallback((interest, duration = 2000) => {
    showNotification('success', `Interesse "${interest}" adicionado`, 'Interesse adicionado!', null, duration)
  }, [showNotification])

  const showInterestRemoved = useCallback((interest, duration = 2000) => {
    showNotification('warning', `Interesse "${interest}" removido`, 'Interesse removido!', null, duration)
  }, [showNotification])

  const value = {
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showAddedToPlaylist,
    showLiked,
    showUnliked,
    showInterestAdded,
    showInterestRemoved
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <NotificationModal 
          notification={notification} 
          onClose={hideNotification} 
        />
      )}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext 