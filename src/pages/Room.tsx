import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { RoomFullInfo, DanmakuMessage, UserRole, ChallengeRequest, GameType } from '../types'
import ChineseChessBoard from '../components/ChineseChessBoard'
import InternationalChessBoard from '../components/InternationalChessBoard'
import './Room.css'

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const socket = useSocket()
  const navigate = useNavigate()

  const [room, setRoom] = useState<RoomFullInfo | null>(null)
  const [board, setBoard] = useState<any>(null)
  const [currentTurn, setCurrentTurn] = useState('')
  const [danmakuList, setDanmakuList] = useState<DanmakuMessage[]>([])
  const [danmakuInput, setDanmakuInput] = useState('')
  const [myId, setMyId] = useState('')
  const [gameOverMsg, setGameOverMsg] = useState<string>('')

  const danmakuRef = useRef<HTMLDivElement>(null)
  const gameTypeRef = useRef<GameType>('chinese')

  useEffect(() => {
    if (!socket) return
    setMyId(socket.id || '')
  }, [socket])

  useEffect(() => {
    if (!socket || !roomId) return

    // Wait for connection if needed, then join room
    const doJoin = () => {
      socket.emit('join-room', { roomId })
    }
    if (socket.connected) {
      doJoin()
    } else {
      socket.on('connect', doJoin)
    }

    const onRoomJoined = (r: RoomFullInfo) => {
      console.log('Room joined:', r)
      setRoom(r)
    }
    const onRoomUpdate = (r: RoomFullInfo) => {
      console.log('Room update:', r)
      setRoom(r)
    }
    const onGameState = (d: { board: any; currentTurn: string }) => {
      console.log('Game state:', d)
      setBoard(d.board)
      setCurrentTurn(d.currentTurn)
    }
    const onMoveMade = (d: { move: any; moveStr: string; board: any; currentTurn: string }) => {
      console.log('Move made:', d)
      setBoard(d.board)
      setCurrentTurn(d.currentTurn)
    }
    const onDanmaku = (msg: DanmakuMessage) => {
      setDanmakuList(prev => [...prev.slice(-100), msg])
    }
    const onGameOver = (d: { winner: string; reason: string }) => {
      const gt = gameTypeRef.current
      const winnerName = d.winner === 'draw' ? '和棋' :
        (gt === 'international'
          ? (d.winner === 'white' ? '白方' : '黑方')
          : (d.winner === 'red' ? '红方' : '黑方'))
      setGameOverMsg(`${winnerName} 获胜！${d.reason}`)
    }
    const onError = (msg: string) => {
      alert(msg)
      if (msg.includes('踢出')) navigate('/lobby')
    }
    const onKicked = () => navigate('/lobby')
    const onChallengeUpdate = (challengeQueue: any[]) => {
      console.log('Challenge update:', challengeQueue)
      // 房间更新会包含挑战队列，所以不需要单独处理，但我们要确保有响应
    }

    socket.on('room-joined', onRoomJoined)
    socket.on('room-update', onRoomUpdate)
    socket.on('game-state', onGameState)
    socket.on('move-made', onMoveMade)
    socket.on('danmaku', onDanmaku)
    socket.on('game-over', onGameOver)
    socket.on('error', onError)
    socket.on('room-kicked', onKicked)
    socket.on('challenge-update', onChallengeUpdate)

    return () => {
      socket.off('connect', doJoin)
      socket.off('room-joined', onRoomJoined)
      socket.off('room-update', onRoomUpdate)
      socket.off('game-state', onGameState)
      socket.off('move-made', onMoveMade)
      socket.off('danmaku', onDanmaku)
      socket.off('game-over', onGameOver)
      socket.off('error', onError)
      socket.off('room-kicked', onKicked)
      socket.emit('leave-room')
    }
  }, [socket, roomId, navigate])

  // Keep gameTypeRef in sync with room state
  useEffect(() => {
    if (room) gameTypeRef.current = room.gameType
  }, [room])

  const myRole: UserRole = (() => {
    if (!room || !myId) return 'spectator'
    if (room.owner.id === myId) return 'owner'
    if (room.admins.find(a => a.id === myId)) return 'admin'
    if (room.redPlayer?.id === myId || room.blackPlayer?.id === myId) return 'player'
    return 'spectator'
  })()

  const mySide: 'red' | 'black' | 'white' | null = (() => {
    if (!room || !myId) return null
    if (room.redPlayer?.id === myId) return room.gameType === 'international' ? 'white' : 'red'
    if (room.blackPlayer?.id === myId) return 'black'
    return null
  })()

  const isManager = myRole === 'owner' || myRole === 'admin'
  const isPlayer = myRole === 'player'
  const isSpectator = myRole === 'spectator'

  const handleMakeMove = useCallback((move: any) => {
    console.log('🚀 发送走棋到服务器:', move)
    socket?.emit('make-move', move)
  }, [socket])

  const handleChooseSide = (side: 'red' | 'black') => {
    socket?.emit('choose-side', side)
  }

  const handleSendDanmaku = () => {
    if (!danmakuInput.trim()) return
    socket?.emit('send-danmaku', danmakuInput.trim())
    setDanmakuInput('')
  }

  const handleRequestChallenge = () => {
    socket?.emit('request-challenge')
  }

  const handleCancelChallenge = () => {
    socket?.emit('cancel-challenge')
  }

  const handleRespondChallenge = (requestId: string, accept: boolean) => {
    socket?.emit('respond-challenge', { requestId, accept })
  }

  const handleSetAdmin = (userId: string, isAdmin: boolean) => {
    socket?.emit('set-admin', { userId, isAdmin })
  }

  const handleKickUser = (userId: string) => {
    socket?.emit('kick-user', userId)
  }

  const handleRestart = () => {
    socket?.emit('restart-game')
    setGameOverMsg('')
  }

  const handleLeaveRoom = () => {
    socket?.emit('leave-room')
    navigate('/lobby')
  }

  const handleDeclareGameOver = (winner: string, reason: string) => {
    socket?.emit('declare-game-over', { winner, reason })
  }

  if (!room) {
    return <div className="room-page"><p style={{ color: '#9a8a70', textAlign: 'center', marginTop: 60 }}>加载中...</p></div>
  }

  const inChallengeQueue = room.challengeQueue.some(c => c.userId === myId)

  return (
    <div className="room-page">
      <div className="room-header">
        <div className="room-title-area">
          <h3 className="room-name">{room.type === 'private' && '🔒 '}{room.name}</h3>
          <span className="room-id-tag" onClick={() => { navigator.clipboard.writeText(roomId || ''); alert('房间ID已复制!') }} title="点击复制房间ID">
            ID: {roomId?.slice(-6)}
          </span>
          <span className={`game-type-badge ${room.gameType}`}>
            {room.gameType === 'chinese' ? '中国象棋' : '国际象棋'}
          </span>
          <span className={`status-badge ${room.status}`}>
            {room.status === 'waiting' ? '等待玩家' : room.status === 'playing' ? '对战中' : '已结束'}
          </span>
        </div>
        <div className="room-header-actions">
          <span className="my-role">我的身份: {
            myRole === 'owner' ? '房主' : myRole === 'admin' ? '管理员' : myRole === 'player' ? '玩家' : '观众'
          }</span>
          <button className="btn btn-secondary leave-btn" onClick={handleLeaveRoom}>离开房间</button>
        </div>
      </div>

      <div className="room-body">
        {/* Board Area */}
        <div className="board-area">
          <div className="player-info top-player">
            {room.blackPlayer
              ? <span className="player-name black-piece">{room.blackPlayer.nickname}</span>
              : <span className="waiting-slot">等待{room.gameType === 'international' ? '黑方' : '黑方'}...</span>
            }
          </div>

          <div className="board-with-danmaku">
            {room.gameType === 'chinese'
              ? <ChineseChessBoard
                board={board}
                currentTurn={currentTurn}
                isPlayer={isPlayer}
                mySide={mySide}
                onMove={handleMakeMove}
                gameOver={!!gameOverMsg}
                onDeclareGameOver={handleDeclareGameOver}
              />
              : <InternationalChessBoard
                board={board}
                currentTurn={currentTurn}
                isPlayer={isPlayer}
                mySide={mySide}
                onMove={handleMakeMove}
                gameOver={!!gameOverMsg}
                onDeclareGameOver={handleDeclareGameOver}
              />
            }
            {/* Flying danmaku overlay */}
            <div className="danmaku-overlay">
              {danmakuList.slice(-8).map((msg, i) => (
                <div key={msg.id} className="danmaku-item" style={{ top: `${5 + ((msg.id.charCodeAt(0) + i * 17) % 12) * 8}%`, animationDelay: '0s' }}>
                  <span className="danmaku-nick">{msg.nickname}:</span> {msg.content}
                </div>
              ))}
            </div>
          </div>

          <div className="player-info bottom-player">
            {room.redPlayer
              ? <span className="player-name red-piece">{room.redPlayer.nickname}</span>
              : <span className="waiting-slot">等待{room.gameType === 'international' ? '白方' : '红方'}...</span>
            }
          </div>

          {gameOverMsg && (
            <div className="game-over-banner">
              {gameOverMsg}
              {isManager && <button className="btn btn-primary" onClick={handleRestart} style={{ marginTop: 8, width: 'auto', padding: '6px 16px' }}>重新开局</button>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="room-sidebar">
          {/* Choose Side (when waiting) */}
          {room.status === 'waiting' && !isPlayer && (
            <div className="sidebar-section">
              <div className="sidebar-title">选择座位</div>
              <div className="choose-side-btns">
                {!room.redPlayer && (
                  <button className="side-btn red-side" onClick={() => handleChooseSide('red')}>
                    {room.gameType === 'international' ? '执白先行' : '执红先行'}
                  </button>
                )}
                {!room.blackPlayer && (
                  <button className="side-btn black-side" onClick={() => handleChooseSide('black')}>
                    执黑后手
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Challenge */}
          {isSpectator && room.status === 'playing' && !inChallengeQueue && (
            <div className="sidebar-section">
              <button className="btn btn-primary" onClick={handleRequestChallenge}>请求挑战</button>
            </div>
          )}
          {isSpectator && inChallengeQueue && (
            <div className="sidebar-section">
              <div className="challenge-pending">已排队挑战中...</div>
              <button className="btn btn-secondary" onClick={handleCancelChallenge}>取消挑战</button>
            </div>
          )}

          {/* Challenge Queue (for managers) */}
          {isManager && room.challengeQueue.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-title">挑战队列</div>
              {room.challengeQueue.map(c => (
                <div key={c.id} className="challenge-item">
                  <span>{c.nickname}</span>
                  <div className="challenge-actions">
                    <button className="mini-btn accept" onClick={() => handleRespondChallenge(c.id, true)}>同意</button>
                    <button className="mini-btn reject" onClick={() => handleRespondChallenge(c.id, false)}>拒绝</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Danmaku Chat */}
          <div className="sidebar-section danmaku-section">
            <div className="sidebar-title">弹幕</div>
            <div className="danmaku-chat" ref={danmakuRef}>
              {danmakuList.map(msg => (
                <div key={msg.id} className="chat-msg">
                  <span className="chat-nick">{msg.nickname}:</span>
                  <span className="chat-content">{msg.content}</span>
                </div>
              ))}
              {danmakuList.length === 0 && <div className="empty-hint-sm">暂无弹幕</div>}
            </div>
            <div className="danmaku-input-row">
              <input
                className="danmaku-input"
                value={danmakuInput}
                onChange={e => setDanmakuInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendDanmaku()}
                placeholder="发弹幕..."
                maxLength={100}
              />
              <button className="mini-btn send" onClick={handleSendDanmaku}>发送</button>
            </div>
          </div>

          {/* Users List */}
          <div className="sidebar-section">
            <div className="sidebar-title">房间成员</div>
            <div className="users-list">
              <div className="user-item owner-user">
                <span className="user-icon">👑</span>
                {room.owner.nickname}
              </div>
              {room.admins.map(a => (
                <div key={a.id} className="user-item admin-user">
                  <span className="user-icon">🛡</span>
                  {a.nickname}
                  {isManager && a.id !== myId && <button className="mini-btn" onClick={() => handleSetAdmin(a.id, false)}>撤管理</button>}
                </div>
              ))}
              {room.redPlayer && (
                <div key={room.redPlayer.id} className="user-item player-user">
                  <span className="user-icon red-piece">●</span>
                  {room.redPlayer.nickname}
                </div>
              )}
              {room.blackPlayer && (
                <div key={room.blackPlayer.id} className="user-item player-user">
                  <span className="user-icon black-piece">●</span>
                  {room.blackPlayer.nickname}
                </div>
              )}
              {room.spectators.map(s => (
                <div key={s.id} className="user-item spect-user">
                  <span className="user-icon">👁</span>
                  {s.nickname}
                  {isManager && s.id !== myId && (
                    <div className="user-actions">
                      <button className="mini-btn" onClick={() => handleSetAdmin(s.id, true)}>设管理</button>
                      <button className="mini-btn reject" onClick={() => handleKickUser(s.id)}>踢出</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Room Management (owner only) */}
          {myRole === 'owner' && (
            <div className="sidebar-section">
              <div className="sidebar-title">房间管理</div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const newType = room.type === 'public' ? 'private' : 'public'
                  const pwd = newType === 'private' ? prompt('设置房间密码:') || '' : ''
                  socket?.emit('toggle-room-type', { type: newType, password: pwd })
                }}
              >
                切换为{room.type === 'public' ? '私有' : '公开'}房间
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
