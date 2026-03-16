import { useState, useEffect, useRef } from 'react'

const WS_URL = 'wss://brodiblanco.zo.space/api/aos/ws'

export function useRealtime() {
  const [connected, setConnected] = useState(false)
  const [updates, setUpdates] = useState([])
  const ws = useRef(null)

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WS_URL)

      ws.current.onopen = () => {
        setConnected(true)
        console.log('Agent OS: Realtime connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setUpdates(prev => [data, ...prev].slice(0, 50))
        } catch (e) {
          console.error('WebSocket message error:', e)
        }
      }

      ws.current.onclose = () => {
        setConnected(false)
        setTimeout(connect, 5000)
      }

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.current.close()
      }
    }

    connect()

    return () => {
      ws.current?.close()
    }
  }, [])

  const send = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }

  return { connected, updates, send }
}
