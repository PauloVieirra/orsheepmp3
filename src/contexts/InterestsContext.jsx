import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useStorage } from './StorageContext'
import { useNotification } from './NotificationContext'

const InterestsContext = createContext({})

export const InterestsProvider = ({ children }) => {
  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { getRecentTracks } = useStorage()
  const { showInterestAdded, showInterestRemoved, showError } = useNotification()

  // Carrega os interesses do localStorage
  useEffect(() => {
    const loadInterests = () => {
      try {
        const savedInterests = JSON.parse(localStorage.getItem('interests') || '[]')
        setInterests(savedInterests)
      } catch (error) {
        console.error('Erro ao carregar interesses:', error)
        setInterests([])
      } finally {
        setIsLoading(false)
      }
    }

    loadInterests()
  }, [])

  // Salva os interesses no localStorage
  const saveInterests = useCallback((newInterests) => {
    try {
      localStorage.setItem('interests', JSON.stringify(newInterests))
      setInterests(newInterests)
    } catch (error) {
      console.error('Erro ao salvar interesses:', error)
    }
  }, [])

  // Adiciona uma música aos interesses
  const addToInterests = useCallback((track) => {
    try {
      const currentInterests = JSON.parse(localStorage.getItem('interests') || '[]')
      
      // Verifica se a música já existe nos interesses
      if (!currentInterests.some(t => t.id === track.id)) {
        const newTrack = {
          ...track,
          addedAt: new Date().toISOString()
        }
        const newInterests = [newTrack, ...currentInterests]
        saveInterests(newInterests)
        showInterestAdded(track.title)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao adicionar aos interesses:', error)
      showError('Erro ao adicionar aos interesses')
      return false
    }
  }, [saveInterests, showInterestAdded, showError])

  // Remove uma música dos interesses
  const removeFromInterests = useCallback((trackId) => {
    try {
      const currentInterests = JSON.parse(localStorage.getItem('interests') || '[]')
      const trackToRemove = currentInterests.find(track => track.id === trackId)
      const newInterests = currentInterests.filter(track => track.id !== trackId)
      saveInterests(newInterests)
      if (trackToRemove) {
        showInterestRemoved(trackToRemove.title)
      }
      return true
    } catch (error) {
      console.error('Erro ao remover dos interesses:', error)
      showError('Erro ao remover dos interesses')
      return false
    }
  }, [saveInterests, showInterestRemoved, showError])

  // Verifica se uma música está nos interesses
  const isInInterests = useCallback((trackId) => {
    try {
      const currentInterests = JSON.parse(localStorage.getItem('interests') || '[]')
      return currentInterests.some(track => track.id === trackId)
    } catch (error) {
      console.error('Erro ao verificar interesses:', error)
      return false
    }
  }, [])

  // Limpa todos os interesses
  const clearInterests = useCallback(() => {
    try {
      localStorage.removeItem('interests')
      setInterests([])
      return true
    } catch (error) {
      console.error('Erro ao limpar interesses:', error)
      return false
    }
  }, [])

  return (
    <InterestsContext.Provider
      value={{
        interests,
        isLoading,
        addToInterests,
        removeFromInterests,
        isInInterests,
        clearInterests
      }}
    >
      {children}
    </InterestsContext.Provider>
  )
}

export const useInterests = () => {
  const context = useContext(InterestsContext)
  if (!context) {
    throw new Error('useInterests deve ser usado dentro de um InterestsProvider')
  }
  return context
}

export default InterestsContext 