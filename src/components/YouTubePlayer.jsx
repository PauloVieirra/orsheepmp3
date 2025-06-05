import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; // Proporção 16:9
  background: #000;
  overflow: hidden;
`

const IframeWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Previne interações diretas com o iframe
`

const YouTubePlayer = ({ videoId, onStateChange, onReady }) => {
  const playerRef = useRef(null)
  const [isAPIReady, setIsAPIReady] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const currentVideoId = useRef(videoId)

  useEffect(() => {
    // Atualiza o videoId de referência
    currentVideoId.current = videoId
  }, [videoId])

  useEffect(() => {
    let isMounted = true

    // Carrega a API do YouTube de forma assíncrona
    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve()
          return
        }

        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

        window.onYouTubeIframeAPIReady = () => {
          if (isMounted) {
            setIsAPIReady(true)
            resolve()
          }
        }
      })
    }

    // Inicializa o player
    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI()

        if (!isMounted) return

        if (!playerRef.current) {
          const origin = window.location.origin
          playerRef.current = new window.YT.Player('youtube-player', {
            videoId: currentVideoId.current,
            playerVars: {
              autoplay: 0, // Desativa autoplay por padrão
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              origin: origin,
              enablejsapi: 1,
              playsinline: 1,
              widget_referrer: origin
            },
            events: {
              onReady: (event) => {
                if (isMounted) {
                  setIsPlayerReady(true)
                  event.target.setVolume(100)
                  if (onReady) onReady(event)
                }
              },
              onStateChange: (event) => {
                if (isMounted && onStateChange) {
                  onStateChange(event)
                }
              },
              onError: (event) => {
                console.error('Erro no player do YouTube:', event.data)
              }
            }
          })
        }
      } catch (error) {
        console.error('Erro ao inicializar o player:', error)
      }
    }

    initializePlayer()

    // Cleanup
    return () => {
      isMounted = false
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [onStateChange, onReady])

  // Atualiza o vídeo quando o videoId muda
  useEffect(() => {
    if (isPlayerReady && playerRef.current && videoId !== currentVideoId.current) {
      playerRef.current.loadVideoById(videoId)
    }
  }, [videoId, isPlayerReady])

  return (
    <PlayerContainer>
      <IframeWrapper>
        <div id="youtube-player" />
      </IframeWrapper>
    </PlayerContainer>
  )
}

export default YouTubePlayer 