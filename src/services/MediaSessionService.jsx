export const setupMediaSession = ({
  title,
  artist = 'YouTube Music',
  artwork,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeekTo
}) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: [
        {
          src: artwork,
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    })

    navigator.mediaSession.setActionHandler('play', onPlay)
    navigator.mediaSession.setActionHandler('pause', onPause)
    navigator.mediaSession.setActionHandler('previoustrack', onPrevious)
    navigator.mediaSession.setActionHandler('nexttrack', onNext)
    navigator.mediaSession.setActionHandler('seekto', onSeekTo)
  }
}

export const updateMediaSessionState = (state) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = state
  }
}

export const updatePositionState = ({ duration, currentTime, playbackRate = 1 }) => {
  if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
    navigator.mediaSession.setPositionState({
      duration,
      position: currentTime,
      playbackRate
    })
  }
} 