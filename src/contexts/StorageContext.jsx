import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import localforage from 'localforage';

const StorageContext = createContext(null);

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

// Configuração dos stores do LocalForage
const stores = {
  playlists: localforage.createInstance({
    name: 'orsheepUI',
    storeName: 'playlists'
  }),
  favorites: localforage.createInstance({
    name: 'orsheepUI',
    storeName: 'favorites'
  }),
  recentTracks: localforage.createInstance({
    name: 'orsheepUI',
    storeName: 'recentTracks'
  }),
  audioBlobs: localforage.createInstance({
    name: 'orsheepUI',
    storeName: 'audioBlobs'
  }),
  thumbnails: localforage.createInstance({
    name: 'orsheepUI',
    storeName: 'thumbnails'
  })
};

export const StorageProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playlistsVersion, setPlaylistsVersion] = useState(0);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Inicializar os stores
        await Promise.all(Object.values(stores).map(store => store.ready()));

        // Migrar dados do localStorage para o LocalForage se existirem
        const localStoragePlaylists = localStorage.getItem('playlists');
        if (localStoragePlaylists) {
          const playlists = JSON.parse(localStoragePlaylists);
          await stores.playlists.setItem('playlists', playlists);
          localStorage.removeItem('playlists'); // Limpa o localStorage após migração
        }

        // Garantir que temos um array de playlists
        const playlists = await stores.playlists.getItem('playlists');
        if (!playlists) {
          await stores.playlists.setItem('playlists', []);
        }

        // Garantir que temos um array de músicas recentes
        const recentTracks = await stores.recentTracks.getItem('recentTracks');
        if (!recentTracks) {
          await stores.recentTracks.setItem('recentTracks', []);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar storage:', error);
        setIsInitialized(true);
      }
    };

    initializeStorage();
  }, []);

  const savePlaylists = useCallback(async (playlists) => {
    if (!isInitialized) {
      console.warn('Storage ainda não foi inicializado');
      return;
    }

    try {
      await stores.playlists.setItem('playlists', playlists);
      setPlaylistsVersion(v => v + 1); // Incrementa a versão para forçar atualização
      return true;
    } catch (error) {
      console.error('Erro ao salvar playlists:', error);
      return false;
    }
  }, [isInitialized]);

  const getPlaylists = useCallback(async () => {
    if (!isInitialized) {
      console.warn('Storage ainda não foi inicializado');
      return [];
    }

    try {
      const playlists = await stores.playlists.getItem('playlists');
      return playlists || [];
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
      return [];
    }
  }, [isInitialized]);

  const saveRecentTracks = async (tracks) => {
    if (!isInitialized) return;
    try {
      await stores.recentTracks.setItem('recentTracks', tracks);
      return true;
    } catch (error) {
      console.error('Erro ao salvar músicas recentes:', error);
      return false;
    }
  };

  const getRecentTracks = async () => {
    if (!isInitialized) return [];
    try {
      const tracks = await stores.recentTracks.getItem('recentTracks');
      return tracks || [];
    } catch (error) {
      console.error('Erro ao carregar músicas recentes:', error);
      return [];
    }
  };

  const saveFavoriteTracks = async (tracks) => {
    if (!isInitialized) return;
    try {
      await stores.favorites.setItem('favoriteTracks', tracks);
      return true;
    } catch (error) {
      console.error('Erro ao salvar músicas favoritas:', error);
      return false;
    }
  };

  const getFavoriteTracks = async () => {
    if (!isInitialized) return [];
    try {
      const tracks = await stores.favorites.getItem('favoriteTracks');
      return tracks || [];
    } catch (error) {
      console.error('Erro ao carregar músicas favoritas:', error);
      return [];
    }
  };

  const value = {
    savePlaylists,
    getPlaylists,
    saveRecentTracks,
    getRecentTracks,
    saveFavoriteTracks,
    getFavoriteTracks,
    isInitialized,
    playlistsVersion // Adiciona a versão ao contexto
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export default StorageContext;
