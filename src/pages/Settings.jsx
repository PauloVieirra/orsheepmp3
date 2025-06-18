import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useStorage } from '../contexts/StorageContext'
import { useApiKey } from '../contexts/ApiKeyContext'
import { AiOutlineInfoCircle, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLinkedin, AiOutlineUser, AiOutlineCloudDownload } from 'react-icons/ai'
import { BiCheck } from 'react-icons/bi'
import { MdOutlineStorage } from 'react-icons/md'
import { IoArrowBack } from 'react-icons/io5'
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'
import audioService from '../services/AudioService'
import BufferSettings from '../components/BufferSettings'

const Container = styled.div`
  padding: 20px;
  color: white;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: white;
`

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  h2 {
    font-size: 1.2rem;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: #8B5CF6;
    }
  }
`

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  .setting-info {
    flex: 1;

    h3 {
      font-size: 1rem;
      margin: 0 0 4px;
      color: white;
    }

    p {
      font-size: 0.9rem;
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`

const Switch = styled.button`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: ${props => props.$active ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  margin-left: 16px;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.2s;
  }

  &:hover {
    background: ${props => props.$active ? '#7C3AED' : 'rgba(255, 255, 255, 0.15)'};
  }
`

const Button = styled.button`
  background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)'};
  color: ${props => props.$danger ? '#EF4444' : '#8B5CF6'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StorageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;

  .storage-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    strong {
      color: white;
    }
  }
`

const ApiKeyInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  position: relative;

  input {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 0.9rem;
    font-family: monospace;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .buttons {
    display: flex;
    gap: 8px;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: all 0.2s;
    border-radius: 4px;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    &.save-button {
      width: 80px;
      height: 42px;
      color: white;
      background: #8B5CF6;
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &.saving {
        position: relative;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: loading 1.5s infinite;
        }
      }
    }
  }

  @keyframes loading {
    from {
      left: -100%;
    }
    to {
      left: 100%;
    }

    &.save {
      background: #8B5CF6;
      border-radius: 4px;
      padding: 8px 16px;
      opacity: 1;
      color: white;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &:hover {
        background: #7C3AED;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`

const ClearCacheModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #282828;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  z-index: 2001;

  h3 {
    margin: 0 0 16px;
    color: white;
    font-size: 1.2rem;
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
`

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  input {
    width: 20px;
    height: 20px;
    accent-color: #8B5CF6;
  }

  .info {
    flex: 1;

    h4 {
      margin: 0;
      font-size: 1rem;
      color: white;
    }

    p {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &.cancel {
      background: rgba(255, 255, 255, 0.1);
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    &.confirm {
      background: #EF4444;
      color: white;

      &:hover {
        background: #DC2626;
      }
    }
  }
`

const Notification = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$success ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  svg {
    font-size: 1.2rem;
  }
`

const AboutSection = styled.section`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  text-align: center;
`

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 24px;
  display: block;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
`

const AboutText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: left;

  p {
    margin-bottom: 16px;
  }
`

const Quote = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin: 24px 0;
  position: relative;
  padding: 0 24px;

  svg {
    color: #8B5CF6;
    font-size: 1.5rem;
    opacity: 0.5;
    position: absolute;
    left: -8px;
    top: -8px;
  }
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8B5CF6;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(139, 92, 246, 0.1);
    transition: all 0.2s;

    &:hover {
      background: rgba(139, 92, 246, 0.2);
      transform: translateY(-2px);
    }

    svg {
      font-size: 1.2rem;
    }
  }
`

const Settings = () => {
  const navigate = useNavigate()
  const { 
    backgroundPlay, 
    offlineMode, 
    clearAllBuffers, 
    clearTrackBuffer, 
    bufferInfo, 
    currentTrack 
  } = usePlayer()
  const { getSettings, saveSettings } = useStorage()
  const { apiKey, setApiKey } = useApiKey()
  const [localApiKey, setLocalApiKey] = useState(apiKey || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearOptions, setClearOptions] = useState({
    playlists: false,
    tracks: false
  })
  const [storageUsage, setStorageUsage] = useState(null)
  const [showBufferSettings, setShowBufferSettings] = useState(false)

  useEffect(() => {
    loadSettings()
    checkStorageUsage()
  }, [])

  useEffect(() => {
    setHasChanges(localApiKey !== apiKey)
  }, [localApiKey, apiKey])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const settings = await getSettings()
      if (settings) {
        audioService.setBackgroundPlayEnabled(settings.backgroundPlay || false)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        setStorageUsage({
          used: estimate.usage || 0,
          total: estimate.quota || 0
        })
      }
    } catch (error) {
      console.error('Erro ao verificar uso de armazenamento:', error)
    }
  }

  const handleApiKeyChange = (e) => {
    setLocalApiKey(e.target.value)
  }

  const handleSaveApiKey = async () => {
    try {
      setIsSaving(true)
      await setApiKey(localApiKey)
      showNotification(true, 'Chave da API salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar chave da API:', error)
      showNotification(false, 'Erro ao salvar chave da API')
    } finally {
      setIsSaving(false)
    }
  }

  const showNotification = (success, message) => {
    // Implementar notificação se necessário
    console.log(message)
  }

  const handleToggleBackgroundPlay = () => {
    const newValue = !backgroundPlay
    audioService.setBackgroundPlayEnabled(newValue)
    handleSaveSettings({ backgroundPlay: newValue })
  }

  const handleSaveSettings = async (newSettings) => {
    try {
      const currentSettings = await getSettings() || {}
      const updatedSettings = { ...currentSettings, ...newSettings }
      await saveSettings(updatedSettings)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  const handleToggleOfflineMode = () => {
    handleSaveSettings({ offlineMode: !offlineMode })
  }

  const handleClearCache = async () => {
    setShowClearModal(true)
  }

  const handleConfirmClear = async () => {
    try {
      setIsClearing(true)
      
      if (clearOptions.playlists) {
        // Limpar playlists
        localStorage.removeItem('playlists')
      }
      
      if (clearOptions.tracks) {
        // Limpar cache de músicas
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(name => caches.delete(name)))
        }
        
        // Limpar IndexedDB
        if ('indexedDB' in window) {
          indexedDB.deleteDatabase('orsheepmp3')
        }
      }
      
      setShowClearModal(false)
      setClearOptions({ playlists: false, tracks: false })
      showNotification(true, 'Cache limpo com sucesso!')
      
      // Recarregar informações de armazenamento
      checkStorageUsage()
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      showNotification(false, 'Erro ao limpar cache')
    } finally {
      setIsClearing(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const handleBufferSettings = (info, track) => {
    setBufferInfo(info)
    setCurrentTrack(track)
    setShowBufferSettings(true)
  }

  return (
    <Container>
      <Header>
        <button onClick={() => navigate(-1)}>
          <IoArrowBack />
        </button>
        <h1>Configurações</h1>
      </Header>

      <Title>Configurações</Title>

      <Section>
        <h2>
          <AiOutlineInfoCircle />
          Geral
        </h2>
        <SettingItem>
          <div className="setting-info">
            <h3>Reprodução em segundo plano</h3>
            <p>Mantém a música tocando quando o app está minimizado ou bloqueado</p>
          </div>
          <Switch 
            $active={backgroundPlay} 
            onClick={handleToggleBackgroundPlay}
            aria-label="Alternar reprodução em segundo plano"
          >
            <span style={{ display: 'none' }}>
              {backgroundPlay ? 'Desativar' : 'Ativar'} reprodução em segundo plano
            </span>
          </Switch>
        </SettingItem>
        <SettingItem>
          <div className="setting-info">
            <h3>Modo Offline</h3>
            <p>Reproduz apenas músicas baixadas quando ativado</p>
          </div>
          <Switch 
            $active={offlineMode} 
            onClick={handleToggleOfflineMode}
            aria-label="Alternar modo offline"
          >
            <span style={{ display: 'none' }}>
              {offlineMode ? 'Desativar' : 'Ativar'} modo offline
            </span>
          </Switch>
        </SettingItem>
      </Section>

      <Section>
        <h2>
          <AiOutlineInfoCircle />
          API do YouTube
        </h2>
        <SettingItem>
          <div className="setting-info">
            <h3>Chave da API</h3>
            <p>Necessária para buscar músicas do YouTube</p>
            <ApiKeyInput>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={handleApiKeyChange}
                placeholder="Insira sua chave da API do YouTube"
                disabled={isLoading}
              />
              <div className="button-group">
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                  disabled={isLoading}
                >
                  {showApiKey ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
                <button 
                  className={`save-button ${isSaving ? 'saving' : ''}`}
                  onClick={handleSaveApiKey}
                  disabled={!hasChanges || isLoading || isSaving || !localApiKey}
                  title="Salvar chave"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </ApiKeyInput>
          </div>
        </SettingItem>
      </Section>

      <Section>
        <h2>
          <AiOutlineCloudDownload />
          Buffer de Áudio
        </h2>
        <SettingItem>
          <div className="setting-info">
            <h3>Sistema de Buffer</h3>
            <p>Carrega automaticamente até 20 minutos de áudio para reprodução offline</p>
          </div>
          <Button 
            onClick={() => setShowBufferSettings(!showBufferSettings)}
          >
            Configurar
          </Button>
        </SettingItem>
        {showBufferSettings && (
          <div style={{ marginTop: '16px' }}>
            <BufferSettings
              bufferInfo={bufferInfo}
              onClearAllBuffers={clearAllBuffers}
              onClearTrackBuffer={clearTrackBuffer}
              currentTrack={currentTrack}
              isEnabled={true}
              onToggleEnabled={() => {}}
            />
          </div>
        )}
      </Section>

      <Section>
        <h2>
          <MdOutlineStorage />
          Armazenamento
        </h2>
        {storageUsage && (
          <StorageInfo>
            <div className="storage-item">
              <span>Espaço utilizado:</span>
              <strong>{formatBytes(storageUsage.used)}</strong>
            </div>
            <div className="storage-item">
              <span>Espaço total:</span>
              <strong>{formatBytes(storageUsage.total)}</strong>
            </div>
            <div className="storage-item">
              <span>Espaço livre:</span>
              <strong>{formatBytes(storageUsage.total - storageUsage.used)}</strong>
            </div>
          </StorageInfo>
        )}
        <SettingItem>
          <div className="setting-info">
            <h3>Limpar Cache</h3>
            <p>Remove dados temporários e músicas baixadas</p>
          </div>
          <Button 
            onClick={handleClearCache} 
            $danger
            disabled={isClearing}
          >
            {isClearing ? 'Limpando...' : 'Limpar'}
          </Button>
        </SettingItem>
      </Section>

      {showClearModal && (
        <>
          <Overlay onClick={() => setShowClearModal(false)} />
          <ClearCacheModal>
            <h3>Selecione o que deseja limpar:</h3>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={clearOptions.playlists}
                onChange={(e) => setClearOptions(prev => ({ ...prev, playlists: e.target.checked }))}
              />
              <div className="info">
                <h4>Playlists</h4>
                <p>Remove todas as playlists criadas</p>
              </div>
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={clearOptions.tracks}
                onChange={(e) => setClearOptions(prev => ({ ...prev, tracks: e.target.checked }))}
              />
              <div className="info">
                <h4>Músicas e Cache</h4>
                <p>Remove músicas baixadas e dados temporários</p>
              </div>
            </CheckboxItem>
            <ModalButtons>
              <button className="cancel" onClick={() => setShowClearModal(false)}>
                Cancelar
              </button>
              <button 
                className="confirm" 
                onClick={handleConfirmClear}
                disabled={!clearOptions.playlists && !clearOptions.tracks}
              >
                Limpar Selecionados
              </button>
            </ModalButtons>
          </ClearCacheModal>
        </>
      )}

      <AboutSection>
       
        
        <AboutText>
          <p>
           
          </p>
          <p>
            Esse trabalho foi desenvolvido como caso de estudo, unindo UI Design com Inteligência 
            Artificial no desenvolvimento do aplicativo Orsheemp3, um tocador de música Web App (WPA) 
            feito em React.js, utilizando JavaScript, Styled Components e LocalForage como banco de 
            dados local para gestão das músicas.
          </p>
          <p>
            O aplicativo ainda está recebendo melhorias.
            Acesse meu portfólio para ler o caso de estudo de UX/UI completo e, em breve, irei 
            disponibilizar também o código.
          </p>
        </AboutText>

        <Quote>
         
          "O bom design é aquele que comunica claramente sua função."
         
          <br />— Donald Norman
        </Quote>

        <SocialLinks>
          <a href="https://www.linkedin.com/in/paulo-vieira-a16723210/" target="_blank" rel="noopener noreferrer">
            <AiOutlineLinkedin />
            LinkedIn
          </a>
          <a href="https://vgents.vercel.app/" target="_blank" rel="noopener noreferrer">
            <AiOutlineUser />
            Portfólio
          </a>
        </SocialLinks>
      </AboutSection>

      {notification && (
        <Notification $success={notification.success}>
          {notification.success ? <BiCheck /> : <AiOutlineInfoCircle />}
          {notification.message}
        </Notification>
      )}
    </Container>
  )
}

export default Settings