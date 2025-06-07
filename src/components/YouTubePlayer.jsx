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

const YouTubePlayer = ({ videoId, onStateChange, onReady, onError }) => {
  const playerRef = useRef(null)
  const [isAPIReady, setIsAPIReady] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const currentVideoId = useRef(videoId)
  const retryCount = useRef(0)
  const maxRetries = 3

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
              autoplay: 1,
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
              widget_referrer: origin,
              hl: 'pt',
              cc_load_policy: 0,
              cc_lang_pref: 'pt',
              host: 'https://www.youtube-nocookie.com'
            },
            events: {
              onReady: (event) => {
                if (isMounted) {
                  console.log('Player ready:', currentVideoId.current)
                  setIsPlayerReady(true)
                  event.target.setVolume(100)
                  if (onReady) onReady(event)
                }
              },
              onStateChange: (event) => {
                if (isMounted && onStateChange) {
                  console.log('Player state changed:', event.data)
                  onStateChange(event)
                }
              },
              onError: (event) => {
                console.error('YouTube player error:', event.data)
                const errorCode = event.data
                
                // Códigos de erro do YouTube:
                // 2 - O pedido contém um parâmetro inválido
                // 5 - O conteúdo solicitado não pode ser reproduzido em um player HTML5
                // 100 - O vídeo solicitado não foi encontrado
                // 101/150 - O proprietário do vídeo não permite que ele seja reproduzido em players incorporados
                
                if (errorCode === 150 || errorCode === 101) {
                  console.warn('Vídeo com reprodução restrita:', currentVideoId.current)
                  if (onError) onError(errorCode)
                } else if (errorCode === 100) {
                  console.warn('Vídeo não encontrado:', currentVideoId.current)
                  if (onError) onError(errorCode)
                } else if (retryCount.current < maxRetries) {
                  console.log('Tentando novamente...')
                  retryCount.current++
                  setTimeout(() => {
                    if (playerRef.current) {
                      playerRef.current.loadVideoById(currentVideoId.current)
                    }
                  }, 1000)
                } else {
                  if (onError) onError('INITIALIZATION_ERROR')
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Erro ao inicializar o player:', error)
        if (retryCount.current < maxRetries) {
          console.log('Tentando inicializar novamente...')
          retryCount.current++
          setTimeout(initializePlayer, 1000)
        } else {
          if (onError) onError('INITIALIZATION_ERROR')
        }
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
  }, [onStateChange, onReady, onError])

  // Atualiza o vídeo quando o videoId muda
  useEffect(() => {
    if (isPlayerReady && playerRef.current && videoId !== currentVideoId.current) {
      console.log('Carregando novo vídeo:', videoId)
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