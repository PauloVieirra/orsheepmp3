import React, { createContext, useContext, useState, useEffect } from 'react'
import localforage from 'localforage'

const ApiKeyContext = createContext(null)

// Configuração do store do LocalForage para a API key
const apiKeyStore = localforage.createInstance({
  name: 'gestorUI',
  storeName: 'apiKey',
  driver: [
    localforage.INDEXEDDB,
    localforage.WEBSQL,
    localforage.LOCALSTORAGE
  ]
})

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider')
  }
  return context
}

export const ApiKeyProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    try {
      setIsLoading(true)
      // Tenta carregar do LocalForage primeiro
      let savedApiKey = await apiKeyStore.getItem('apiKey')
      
      // Se não encontrar no LocalForage, tenta no localStorage (migração)
      if (!savedApiKey) {
        savedApiKey = localStorage.getItem('apiKey')
        if (savedApiKey) {
          // Migra do localStorage para o LocalForage
          await apiKeyStore.setItem('apiKey', savedApiKey)
          localStorage.removeItem('apiKey') // Remove do localStorage após migração
        }
      }

      if (savedApiKey) {
        setApiKey(savedApiKey)
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApiKey = async (newKey) => {
    try {
      // Salva diretamente no LocalForage
      await apiKeyStore.setItem('apiKey', newKey)
      
      // Atualiza o estado
      setApiKey(newKey)
      return true
    } catch (error) {
      console.error('Erro ao atualizar API key:', error)
      return false
    }
  }

  const clearApiKey = async () => {
    try {
      await apiKeyStore.removeItem('apiKey')
      localStorage.removeItem('apiKey') // Garante que também é removida do localStorage
      setApiKey('')
      return true
    } catch (error) {
      console.error('Erro ao limpar API key:', error)
      return false
    }
  }

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
      updateApiKey, 
      clearApiKey,
      isLoading 
    }}>
      {children}
    </ApiKeyContext.Provider>
  )
} 