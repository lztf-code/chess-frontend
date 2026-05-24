import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { RoomInfo, GameType, RoomType } from '../types'
import Tutorial from '../components/Tutorial'
import './Lobby.css'

export default function Lobby() {
  const socket = useSocket()
  const navigate = useNavigate()
  
  // 从 localStorage 读取已保存的昵称
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('chess-nickname') || ''
  })
  const [nickSet, setNickSet] = useState(() => {
    return !!localStorage.getItem('chess-nickname')
  })
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', type: 'public' as RoomType, password: '', gameType: 'chinese' as GameType })
  const [joinPassword, setJoinPassword] = useState('')
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null)
  const [directJoinId, setDirectJoinId] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!socket) return
    
    // 如果已有保存的昵称，自动设置
    if (nickname && nickSet) {
      socket.emit('set-nickname', nickname)
    }
    
    socket.on('room-list', setRooms)
    socket.on('room-joined', (room) => {
      navigate(`/room/${room.id}`)
    })
    socket.on('error', (msg) => alert(msg))
    return () => {
      socket.off('room-list')
      socket.off('room-joined')
      socket.off('error')
    }
  }, [socket, navigate, nickname, nickSet])

  const handleSetNickname = () => {
    if (!nickname.trim()) return
    const savedNick = nickname.trim()
    socket?.emit('set-nickname', savedNick)
    // 保存到 localStorage
    localStorage.setItem('chess-nickname', savedNick)
    setNickSet(true)
  }

  const handleCreateRoom = () => {
    socket?.emit('create-room', {
      name: newRoom.name || '未命名房间',
      type: newRoom.type,
      password: newRoom.type === 'private' ? newRoom.password : '',
      gameType: newRoom.gameType,
    })
    setShowCreate(false)
  }

  const handleJoinRoom = (roomId: string, hasPassword: boolean) => {
    if (hasPassword) {
      setJoiningRoomId(roomId)
    } else {
      socket?.emit('join-room', { roomId })
    }
  }

  const handleJoinWithPassword = () => {
    if (joiningRoomId) {
      socket?.emit('join-room', { roomId: joiningRoomId, password: joinPassword })
      setJoiningRoomId(null)
      setJoinPassword('')
    }
  }

  const handleDirectJoin = () => {
    if (!directJoinId.trim()) return
    socket?.emit('join-room', { roomId: directJoinId.trim() })
    setDirectJoinId('')
  }

  if (!nickSet) {
    return (
      <div className="lobby">
        <div className="lobby-card">
          <h2>进入大厅</h2>
          <p>输入你的昵称开始对弈</p>
          <input
            className="lobby-input"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetNickname()}
            placeholder="输入昵称..."
            maxLength={20}
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleSetNickname}>进入</button>
        </div>
      </div>
    )
  }

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h2>在线大厅</h2>
        <div className="lobby-nickname">
          昵称: {nickname}
          <button 
            className="btn btn-secondary" 
            style={{ marginLeft: '10px', fontSize: '12px', padding: '4px 8px' }}
            onClick={() => {
              localStorage.removeItem('chess-nickname')
              setNickSet(false)
              setNickname('')
            }}
          >
            修改
          </button>
        </div>
      </div>

      <div className="lobby-actions">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          创建房间
        </button>
        <div className="direct-join">
          <input
            className="lobby-input direct-join-input"
            value={directJoinId}
            onChange={e => setDirectJoinId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDirectJoin()}
            placeholder="输入房间ID加入..."
            maxLength={20}
          />
          <button className="btn btn-secondary direct-join-btn" onClick={handleDirectJoin}>加入</button>
        </div>
      </div>

      <div className="room-list">
        {rooms.length === 0 && <div className="empty-hint">暂无公开房间，创建一个吧</div>}
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-card-info">
              <div className="room-card-name">
                {room.type === 'private' && <span className="lock-icon">🔒</span>}
                {room.name}
              </div>
              <div className="room-card-meta">
                <span className={`game-type-badge ${room.gameType}`}>
                  {room.gameType === 'chinese' ? '中国象棋' : '国际象棋'}
                </span>
                <span className={`status-badge ${room.status}`}>
                  {room.status === 'waiting' ? '等待中' : room.status === 'playing' ? '对战中' : '已结束'}
                </span>
              </div>
              <div className="room-card-detail">
                房主: {room.ownerName} | 玩家: {room.playerCount}/2 | 观众: {room.spectatorCount}
              </div>
            </div>
            <button
              className="btn btn-secondary room-join-btn"
              onClick={() => handleJoinRoom(room.id, room.hasPassword)}
            >
              加入
            </button>
          </div>
        ))}
      </div>

      {/* Create Room Dialog */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>创建房间</h3>
            <div className="form-group">
              <label>房间名称</label>
              <input
                className="lobby-input"
                value={newRoom.name}
                onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="输入房间名称..."
                maxLength={30}
              />
            </div>
            <div className="form-group">
              <label>棋类</label>
              <select
                className="difficulty-select"
                value={newRoom.gameType}
                onChange={e => setNewRoom({ ...newRoom, gameType: e.target.value as GameType })}
              >
                <option value="chinese">中国象棋</option>
                <option value="international">国际象棋</option>
              </select>
            </div>
            <div className="form-group">
              <label>房间类型</label>
              <select
                className="difficulty-select"
                value={newRoom.type}
                onChange={e => setNewRoom({ ...newRoom, type: e.target.value as RoomType })}
              >
                <option value="public">公开</option>
                <option value="private">私有</option>
              </select>
            </div>
            {newRoom.type === 'private' && (
              <div className="form-group">
                <label>房间密码</label>
                <input
                  className="lobby-input"
                  value={newRoom.password}
                  onChange={e => setNewRoom({ ...newRoom, password: e.target.value })}
                  placeholder="设置密码..."
                  type="password"
                />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreateRoom}>创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Private Room Dialog */}
      {joiningRoomId && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>输入房间密码</h3>
            <input
              className="lobby-input"
              value={joinPassword}
              onChange={e => setJoinPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoinWithPassword()}
              placeholder="房间密码..."
              type="password"
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setJoiningRoomId(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleJoinWithPassword}>加入</button>
            </div>
          </div>
        </div>
      )}
      
      {showTutorial && (
        <Tutorial gameType="online" onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
