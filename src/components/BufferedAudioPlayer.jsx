import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';

const AudioElement = styled.audio`
  display: none;
`;

const BufferedAudioPlayer = ({ track, isPlaying, onProgress, onDuration, onEnded, onError }) => {
  const audioRef = useRef(null);
  const { isTrackBuffered, getBufferedAudio } = usePlayer();
  const [isUsingBuffer, setIsUsingBuffer] = useState(false);
  const [bufferAudio, setBufferAudio] = useState(null);

  // Verifica se a faixa está em buffer
  useEffect(() => {
    if (track && isTrackBuffered(track.id)) {
      const bufferedAudio = getBufferedAudio(track.id);
      if (bufferedAudio) {
        setBufferAudio(bufferedAudio);
        setIsUsingBuffer(true);
        console.log(`Usando áudio em buffer para: ${track.title}`);
      }
    } else {
      setBufferAudio(null);
      setIsUsingBuffer(false);
    }
  }, [track, isTrackBuffered, getBufferedAudio]);

  // Configura o elemento de áudio
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // Configura os event listeners
    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress({
          playedSeconds: audioElement.currentTime,
          loadedSeconds: audioElement.buffered.length > 0 ? audioElement.buffered.end(0) : 0
        });
      }
    };

    const handleLoadedMetadata = () => {
      if (onDuration) {
        onDuration(audioElement.duration);
      }
    };

    const handleEnded = () => {
      if (onEnded) {
        onEnded();
      }
    };

    const handleError = (error) => {
      console.error('Erro no player de áudio bufferizado:', error);
      if (onError) {
        onError(error);
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [onProgress, onDuration, onEnded, onError]);

  // Controla a reprodução
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      // Se estiver usando buffer, usa o áudio bufferizado
      if (isUsingBuffer && bufferAudio) {
        try {
          bufferAudio.currentTime = audioElement.currentTime;
          bufferAudio.play();
          console.log('Reproduzindo áudio em buffer');
        } catch (error) {
          console.error('Erro ao reproduzir áudio em buffer:', error);
          // Fallback para o elemento de áudio normal
          audioElement.play();
        }
      } else {
        audioElement.play();
      }
    } else {
      // Pausa ambos os elementos
      if (bufferAudio) {
        bufferAudio.pause();
      }
      audioElement.pause();
    }
  }, [isPlaying, isUsingBuffer, bufferAudio]);

  // Sincroniza o tempo entre os elementos de áudio
  const syncAudioTime = useCallback((time) => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.currentTime = time;
    }
    if (bufferAudio) {
      bufferAudio.currentTime = time;
    }
  }, [bufferAudio]);

  // Expõe métodos para controle externo
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.seekTo = syncAudioTime;
      audioRef.current.getCurrentTime = () => audioRef.current?.currentTime || 0;
      audioRef.current.getDuration = () => audioRef.current?.duration || 0;
    }
  }, [syncAudioTime]);

  if (!track) return null;

  return (
    <AudioElement
      ref={audioRef}
      src={isUsingBuffer ? undefined : `https://www.youtube.com/watch?v=${track.id}`}
      preload="auto"
      crossOrigin="anonymous"
      playsInline
    />
  );
};

export default BufferedAudioPlayer; 