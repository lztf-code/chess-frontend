import { Link } from 'react-router-dom'
import './Tutorial.css'

interface TutorialProps {
  gameType: 'chinese' | 'international' | 'online'
  onClose: () => void
}

export default function Tutorial({ gameType, onClose }: TutorialProps) {
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-content" onClick={e => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>×</button>
        
        {gameType === 'chinese' && <ChineseChessTutorial />}
        {gameType === 'international' && <InternationalChessTutorial />}
        {gameType === 'online' && <OnlineTutorial />}
      </div>
    </div>
  )
}

function ChineseChessTutorial() {
  return (
    <div className="tutorial-body">
      <h2>♟️ 中国象棋规则教程</h2>
      
      <div className="tutorial-section">
        <h3>🎯 游戏目标</h3>
        <p>吃掉对方的将（黑方）或帅（红方）即可获胜！</p>
      </div>

      <div className="tutorial-section">
        <h3>🏰 棋盘介绍</h3>
        <ul>
          <li>棋盘由9条竖线和10条横线组成</li>
          <li>中间有"楚河"和"汉界"的分隔</li>
          <li>双方各有自己的"九宫格"（将帅活动的区域）</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>♟️ 棋子介绍</h3>
        <div className="piece-grid">
          <div className="piece-card">
            <div className="piece-icon">将/帅</div>
            <div className="piece-name">将/帅</div>
            <div className="piece-desc">每步走一格，只能在九宫内活动</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">士/仕</div>
            <div className="piece-name">士/仕</div>
            <div className="piece-desc">每步斜走一格，只能在九宫内活动</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">象/相</div>
            <div className="piece-name">象/相</div>
            <div className="piece-desc">田字对角走，不能过河，不能塞象眼</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">马</div>
            <div className="piece-name">马</div>
            <div className="piece-desc">日字走法，不能蹩马腿</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">车</div>
            <div className="piece-name">车</div>
            <div className="piece-desc">横竖直线走，不能越子</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">炮</div>
            <div className="piece-name">炮</div>
            <div className="piece-desc">走法同车，吃子需隔一子（炮架）</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">兵/卒</div>
            <div className="piece-name">兵/卒</div>
            <div className="piece-desc">过河前只能前进，过河后可横走</div>
          </div>
        </div>
      </div>

      <div className="tutorial-section">
        <h3>🎮 操作说明</h3>
        <ul>
          <li>您执红棋，先行一步</li>
          <li>点击己方棋子选中，会显示可移动的位置</li>
          <li>再次点击目标位置即可移动</li>
          <li>AI执黑棋，会自动响应您的走法</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>💡 小技巧</h3>
        <ul>
          <li>开局可以出车、马、炮快速部署</li>
          <li>注意保护将/帅的安全</li>
          <li>善用炮做炮架进行攻击</li>
          <li>兵过河后威力大增</li>
        </ul>
      </div>

      <div className="tutorial-actions">
        <Link to="/chinese-chess" className="btn btn-primary" onClick={onClose}>
          开始对战！🚀
        </Link>
      </div>
    </div>
  )
}

function InternationalChessTutorial() {
  return (
    <div className="tutorial-body">
      <h2>♕ 国际象棋规则教程</h2>
      
      <div className="tutorial-section">
        <h3>🎯 游戏目标</h3>
        <p>将对方的王（King）逼到无处可逃（将死）即可获胜！</p>
      </div>

      <div className="tutorial-section">
        <h3>🏰 棋盘介绍</h3>
        <ul>
          <li>8×8的64格棋盘</li>
          <li>白棋在1-2行，黑棋在7-8行</li>
          <li>对角颜色排列，白方右下角为白格</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>♟️ 棋子介绍</h3>
        <div className="piece-grid">
          <div className="piece-card">
            <div className="piece-icon">♚/♔</div>
            <div className="piece-name">王 King</div>
            <div className="piece-desc">每步走一格，8个方向都可</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">♛/♕</div>
            <div className="piece-name">后 Queen</div>
            <div className="piece-desc">横竖斜都能走，威力最大</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">♜/♖</div>
            <div className="piece-name">车 Rook</div>
            <div className="piece-desc">横竖直线走，威力强大</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">♝/♗</div>
            <div className="piece-name">象 Bishop</div>
            <div className="piece-desc">对角线走，每方两象分占黑白格</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">♞/♘</div>
            <div className="piece-name">马 Knight</div>
            <div className="piece-desc">走L形，可以越子</div>
          </div>
          <div className="piece-card">
            <div className="piece-icon">♟</div>
            <div className="piece-name">兵 Pawn</div>
            <div className="piece-desc">向前走一步或两步，吃对角</div>
          </div>
        </div>
      </div>

      <div className="tutorial-section">
        <h3>👑 特殊规则</h3>
        <ul>
          <li><strong>王车易位</strong>：王和车同时移动（特殊走法）</li>
          <li><strong>吃过路兵</strong>：对方的兵第一步走两格，你的兵可以吃它</li>
          <li><strong>兵的升变</strong>：兵到达对方底线可以变成后</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🎮 操作说明</h3>
        <ul>
          <li>您执白棋，先行一步</li>
          <li>点击己方棋子选中，会显示可移动的位置</li>
          <li>再次点击目标位置即可移动</li>
          <li>AI执黑棋，会自动响应您的走法</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>💡 小技巧</h3>
        <ul>
          <li>开局先出车、马，再出象，最后出后</li>
          <li>保护好王的安全</li>
          <li>控制棋盘中心</li>
          <li>注意兵的推进和配合</li>
        </ul>
      </div>

      <div className="tutorial-actions">
        <Link to="/international-chess" className="btn btn-primary" onClick={onClose}>
          开始对战！🚀
        </Link>
      </div>
    </div>
  )
}

function OnlineTutorial() {
  return (
    <div className="tutorial-body">
      <h2>🌐 在线对弈教程</h2>
      
      <div className="tutorial-section">
        <h3>🎯 游戏目标</h3>
        <p>和真实玩家对战，通过吃掉对方将帅来获胜！</p>
      </div>

      <div className="tutorial-section">
        <h3>🏠 创建房间</h3>
        <ul>
          <li>在大厅点击"创建房间"按钮</li>
          <li>选择棋类：中国象棋 或 国际象棋</li>
          <li>设置房间类型：公开 或 私有</li>
          <li>如果选择私有，需要设置密码</li>
          <li>创建后会自动进入房间，等待其他玩家</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🚪 加入房间</h3>
        <ul>
          <li><strong>公开房间</strong>：在房间列表中点击"加入"</li>
          <li><strong>私有房间</strong>：输入房间ID和密码</li>
          <li><strong>直接加入</strong>：在顶部输入房间ID直接加入</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>👥 游戏规则</h3>
        <ul>
          <li>房间最多容纳2名玩家和多名观众</li>
          <li>先进入的玩家选择红方（先手）</li>
          <li>后进入的玩家自动为黑方（后手）</li>
          <li>其他进入的玩家自动成为观众</li>
          <li>观众可以观看对局，但不能操作</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🎮 操作说明</h3>
        <ul>
          <li>进入房间后选择你的阵营（红方或黑方）</li>
          <li>红方先走一步，然后交替进行</li>
          <li>点击己方棋子选中</li>
          <li>再次点击目标位置移动</li>
          <li>吃掉对方将帅即可获胜</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>💡 小提示</h3>
        <ul>
          <li>记住你的房间ID，方便邀请朋友</li>
          <li>私密房间需要密码才能加入</li>
          <li>观众可以看到实时对局</li>
          <li>双方都可以自由下棋，没有限制</li>
        </ul>
      </div>

      <div className="tutorial-actions">
        <Link to="/lobby" className="btn btn-primary" onClick={onClose}>
          进入大厅！🎮
        </Link>
      </div>
    </div>
  )
}
