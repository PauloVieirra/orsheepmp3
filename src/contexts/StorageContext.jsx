import React, { createContext, useContext, useEffect, useState } from 'react';
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
    name: 'gestorUI',
    storeName: 'playlists',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  }),
  favorites: localforage.createInstance({
    name: 'gestorUI',
    storeName: 'favorites',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  }),
  recentTracks: localforage.createInstance({
    name: 'gestorUI',
    storeName: 'recentTracks',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  }),
  audioBlobs: localforage.createInstance({
    name: 'gestorUI',
    storeName: 'audioBlobs',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  }),
  thumbnails: localforage.createInstance({
    name: 'gestorUI',
    storeName: 'thumbnails',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  })
};

export const StorageProvider = ({ children }) => {
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [fallbackStorage] = useState(() => new Map());

  useEffect(() => {
    // Verificar disponibilidade do storage
    const checkStorageAvailability = async () => {
      try {
        // Tenta escrever e ler um valor de teste
        const testKey = '_test_storage_';
        await stores.playlists.setItem(testKey, 'test');
        await stores.playlists.removeItem(testKey);
        setIsStorageAvailable(true);
      } catch (error) {
        console.warn('Storage não está disponível, usando fallback em memória:', error);
        setIsStorageAvailable(false);
      }
    };

    checkStorageAvailability();

    // Inicializar os stores
    Object.values(stores).forEach(store => {
      store.ready().catch(error => {
        console.warn('Erro ao inicializar store:', error);
      });
    });
  }, []);

  const handleStorageOperation = async (operation, fallback) => {
    try {
      if (!isStorageAvailable) {
        return fallback();
      }
      return await operation();
    } catch (error) {
      console.warn('Erro na operação de storage, usando fallback:', error);
      return fallback();
    }
  };

  const saveThumbnail = async (id, blob) => {
    return handleStorageOperation(
      () => stores.thumbnails.setItem(id, blob),
      () => fallbackStorage.set(`thumbnail_${id}`, blob)
    );
  };

  const getThumbnail = async (id) => {
    return handleStorageOperation(
      () => stores.thumbnails.getItem(id),
      () => fallbackStorage.get(`thumbnail_${id}`) || null
    );
  };

  const saveAudioBlob = async (id, blob) => {
    return handleStorageOperation(
      () => stores.audioBlobs.setItem(id, blob),
      () => fallbackStorage.set(`audio_${id}`, blob)
    );
  };

  const getAudioBlob = async (id) => {
    return handleStorageOperation(
      () => stores.audioBlobs.getItem(id),
      () => fallbackStorage.get(`audio_${id}`) || null
    );
  };

  const savePlaylists = async (playlists) => {
    return handleStorageOperation(
      () => stores.playlists.setItem('playlists', playlists),
      () => fallbackStorage.set('playlists', playlists)
    );
  };

  const getPlaylists = async () => {
    return handleStorageOperation(
      () => stores.playlists.getItem('playlists'),
      () => fallbackStorage.get('playlists') || []
    );
  };

  const saveFavorites = async (favorites) => {
    return handleStorageOperation(
      () => stores.favorites.setItem('favorites', favorites),
      () => fallbackStorage.set('favorites', favorites)
    );
  };

  const getFavorites = async () => {
    return handleStorageOperation(
      () => stores.favorites.getItem('favorites'),
      () => fallbackStorage.get('favorites') || []
    );
  };

  const saveRecentTracks = async (tracks) => {
    return handleStorageOperation(
      () => stores.recentTracks.setItem('recentTracks', tracks),
      () => fallbackStorage.set('recentTracks', tracks)
    );
  };

  const getRecentTracks = async () => {
    return handleStorageOperation(
      () => stores.recentTracks.getItem('recentTracks'),
      () => fallbackStorage.get('recentTracks') || []
    );
  };

  const clearStorage = async () => {
    if (isStorageAvailable) {
      try {
        await Promise.all(Object.values(stores).map(store => store.clear()));
      } catch (error) {
        console.warn('Erro ao limpar storage:', error);
      }
    }
    fallbackStorage.clear();
  };

  const getSettings = async () => {
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}');
      return settings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return {};
    }
  };

  const saveSettings = async (settings) => {
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const clearCache = async () => {
    try {
      // Limpa o cache do service worker
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // Limpa o localStorage, mantendo apenas as configurações
      const settings = await getSettings();
      localStorage.clear();
      await saveSettings(settings);

      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  };

  return (
    <StorageContext.Provider
      value={{
        saveThumbnail,
        getThumbnail,
        saveAudioBlob,
        getAudioBlob,
        savePlaylists,
        getPlaylists,
        saveFavorites,
        getFavorites,
        saveRecentTracks,
        getRecentTracks,
        clearStorage,
        isStorageAvailable,
        getSettings,
        saveSettings,
        clearCache
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageContext;
