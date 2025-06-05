import { useState, useEffect } from 'react'
import styled from 'styled-components'

const ClockContainer = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 15px 25px;
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <ClockContainer>
      {time.toLocaleTimeString()}
    </ClockContainer>
  )
}