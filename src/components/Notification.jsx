import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { AiOutlineCheckCircle, AiOutlineInfoCircle, AiOutlineWarning, AiOutlineClose } from 'react-icons/ai'

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`

const getBackgroundColor = (type) => {
  switch (type) {
    case 'success':
      return '#8B5CF6';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    default:
      return '#8B5CF6';
  }
}

const NotificationContainer = styled.div`
  position: fixed;
  top: ${props => props.$show ? '20px' : '-100px'};
  left: 50%;
  transform: translateX(-50%);
  background: ${props => getBackgroundColor(props.$type)};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 2000;

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .icon {
    font-size: 1.5rem;
  }

  .content {
    flex: 1;
    
    h4 {
      margin: 0;
      font-size: 1rem;
    }
    
    p {
      margin: 4px 0 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }

  .close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
`

const Notification = ({ type = 'info', title, message, duration = 3000, onClose }) => {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <AiOutlineCheckCircle />
      case 'error':
        return <AiOutlineWarning />
      case 'warning':
        return <AiOutlineWarning />
      default:
        return <AiOutlineInfoCircle />
    }
  }

  return (
    <NotificationContainer $type={type} $isClosing={isClosing}>
      <div className="icon">
        {getIcon()}
      </div>
      <div className="content">
        <h4>{title}</h4>
        {message && <p>{message}</p>}
      </div>
      <button className="close" onClick={handleClose}>
        <AiOutlineClose />
      </button>
    </NotificationContainer>
  )
}

export default Notification 