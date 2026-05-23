import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })
    s.on('connect', () => {
      console.log('Socket connected:', s.id)
    })
    s.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const socket = useContext(SocketContext)
  return socket
}
