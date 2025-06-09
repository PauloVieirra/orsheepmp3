import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { AiOutlineDownload } from 'react-icons/ai'

const InstallButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: #7C3AED;
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.2rem;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Modal = styled.div`
  background: #282828;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  color: white;
  text-align: center;

  h2 {
    margin-bottom: 16px;
    font-size: 1.4rem;
  }

  p {
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.7);
  }

  ul {
    text-align: left;
    margin-bottom: 24px;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .buttons {
    display: flex;
    gap: 12px;
    justify-content: center;

    button {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;

      &.install {
        background: #8B5CF6;
        color: white;

        &:hover {
          background: #7C3AED;
        }
      }

      &.cancel {
        background: rgba(255, 255, 255, 0.1);
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
`

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone
        || document.referrer.includes('android-app://')

      if (isStandalone) {
        setIsInstalled(true)
        localStorage.setItem('pwaInstalled', 'true')
        return true
      }

      const installed = localStorage.getItem('pwaInstalled') === 'true'
      if (installed) {
        setIsInstalled(true)
        return true
      }

      return false
    }

    if (checkInstallation()) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowModal(false)
      localStorage.setItem('pwaInstalled', 'true')
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = () => {
    setShowModal(true)
  }

  const handleConfirmInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        localStorage.setItem('pwaInstalled', 'true')
      }
    } catch (error) {
      console.error('Erro ao instalar o PWA:', error)
    } finally {
      setIsInstalling(false)
      setShowModal(false)
      setDeferredPrompt(null)
    }
  }

  if (isInstalled) return null

  return (
    <>
      <InstallButton onClick={handleInstallClick}>
        <AiOutlineDownload /> Instalar App
      </InstallButton>

      {showModal && (
        <Overlay>
          <Modal>
            <h2>Instalar Orsheep Player</h2>
            <p>Instale nosso app para ter a melhor experiência:</p>
            <ul>
              <li> Interface otimizada para seu dispositivo</li>
              <li> Acesso mais rápido</li>
              <li> Ícone na tela inicial</li>
              <li> Melhor experiência de áudio</li>
            </ul>
            <div className="buttons">
              <button className="cancel" onClick={() => setShowModal(false)}>
                Agora não
              </button>
              <button 
                className="install" 
                onClick={handleConfirmInstall}
                disabled={isInstalling}
              >
                {isInstalling ? 'Instalando...' : 'Instalar Agora'}
              </button>
            </div>
          </Modal>
        </Overlay>
      )}
    </>
  )
}

export default InstallPWA
