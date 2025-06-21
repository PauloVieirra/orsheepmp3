import React from 'react'
import { StorageProvider } from './contexts/StorageContext'
import { PlayerProvider } from './contexts/PlayerContext'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import { InterestsProvider } from './contexts/InterestsContext'
import { NotificationProvider } from './contexts/NotificationContext'
import AppRoutes from './routes'
import GlobalStyle from './styles/global'

function App() {
  return (
    <>
      <StorageProvider>
        <ApiKeyProvider>
          <InterestsProvider>
            <PlayerProvider>
              <NotificationProvider>
                <GlobalStyle />
                <AppRoutes />
              </NotificationProvider>
            </PlayerProvider>
          </InterestsProvider>
        </ApiKeyProvider>
      </StorageProvider>
    </>
  )
}

export default App