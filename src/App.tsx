import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ChineseChess from './chinese-chess/ChineseChess'
import InternationalChess from './international-chess/InternationalChess'
import { SocketProvider } from './context/SocketContext'
import Lobby from './pages/Lobby'
import Room from './pages/Room'
import Tutorial from './components/Tutorial'
import './App.css'

function Home() {
  const [showTutorial, setShowTutorial] = useState(false)

  return (
    <div className="home">
      <div className="home-header">
        <h1>弈 战</h1>
        <p>楚河汉界 · 方寸之间 · 以棋会友</p>
        <button 
          className="tutorial-btn"
          onClick={() => setShowTutorial('chinese')}
        >
          📖 游戏教程
        </button>
      </div>
      <div className="game-cards">
        <Link to="/chinese-chess" className="game-card chinese-card">
          <div className="card-icon">棋</div>
          <h2>中国象棋</h2>
          <p>楚河汉界，运筹帷幄</p>
          <span className="card-btn">执红先行 →</span>
        </Link>
        <Link to="/international-chess" className="game-card international-card">
          <div className="card-icon">王</div>
          <h2>国际象棋</h2>
          <p>方寸天地，纵横捭阖</p>
          <span className="card-btn">执白先行 →</span>
        </Link>
        <Link to="/lobby" className="game-card online-card">
          <div className="card-icon">联</div>
          <h2>在线对弈</h2>
          <p>创建房间，以棋会友</p>
          <span className="card-btn">进入大厅 →</span>
        </Link>
      </div>
      
      {showTutorial && (
        <Tutorial 
          gameType={showTutorial as 'chinese' | 'international' | 'online'} 
          onClose={() => setShowTutorial(false)} 
        />
      )}
    </div>
  )
}

function App() {
  return (
    <SocketProvider>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="nav-brand">弈 战</Link>
          <div className="nav-links">
            <Link to="/chinese-chess" className="nav-link">中国象棋</Link>
            <Link to="/international-chess" className="nav-link">国际象棋</Link>
            <Link to="/lobby" className="nav-link">在线对弈</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chinese-chess" element={<ChineseChess />} />
          <Route path="/international-chess" element={<InternationalChess />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </div>
    </SocketProvider>
  )
}

export default App
