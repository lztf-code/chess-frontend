import { useState, useCallback, useEffect } from 'react'
import {
  Board, Piece, PieceColor, Move,
  createInitialBoard, cloneBoard, isValidMove, isInCheck,
  isCheckmate, getAIMove, getPieceName, moveToString, getAllValidMoves,
} from './logic'
import './ChineseChess.css'

const CELL = 58        // 交叉点间距
const PAD = 32         // 棋盘边距
const PIECE_R = 24     // 棋子半径

// 棋盘：9列(0-8) × 10行(0-9) 的交叉点
const BW = 8 * CELL    // 棋盘线宽
const BH = 9 * CELL    // 棋盘线高
const SVG_W = BW + PAD * 2
const SVG_H = BH + PAD * 2

function px(col: number) { return PAD + col * CELL }
function py(row: number) { return PAD + row * CELL }

// 星位标记位置
const STAR_POINTS = [
  [2, 1], [2, 7], [7, 1], [7, 7],       // 炮位
  [3, 0], [3, 2], [3, 4], [3, 6], [3, 8], // 黑卒
  [6, 0], [6, 2], [6, 4], [6, 6], [6, 8], // 红兵
]

export default function ChineseChess() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('red')
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [difficulty, setDifficulty] = useState(2)
  const [aiThinking, setAiThinking] = useState(false)
  const [capturedByRed, setCapturedByRed] = useState<Piece[]>([])
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([])
  const [inCheck, setInCheck] = useState(false)

  const checkGameState = useCallback((newBoard: Board, turn: PieceColor) => {
    if (isCheckmate(newBoard, turn)) {
      setGameOver(true)
      setWinner(turn === 'red' ? 'black' : 'red')
    } else {
      setInCheck(isInCheck(newBoard, turn))
    }
  }, [])

  const handleIntersectionClick = useCallback((row: number, col: number) => {
    if (gameOver || currentTurn !== 'red' || aiThinking) return

    const piece = board[row][col]

    if (selectedPos) {
      const [selRow, selCol] = selectedPos
      const move: Move = { fromRow: selRow, fromCol: selCol, toRow: row, toCol: col }

      if (isValidMove(board, move, currentTurn)) {
        const moveStr = moveToString(board, move)
        const captured = board[row][col]
        const newBoard = cloneBoard(board)
        newBoard[row][col] = newBoard[selRow][selCol]
        newBoard[selRow][selCol] = null

        if (captured) {
          setCapturedByRed(prev => [...prev, captured])
        }

        setBoard(newBoard)
        setSelectedPos(null)
        setValidMoves([])
        setMoveHistory(prev => [...prev, `红 ${moveStr}`])
        const nextTurn: PieceColor = 'black'
        setCurrentTurn(nextTurn)
        checkGameState(newBoard, nextTurn)
      } else if (piece && piece.color === 'red') {
        setSelectedPos([row, col])
        const moves = getAllValidMoves(board, 'red').filter(
          m => m.fromRow === row && m.fromCol === col
        )
        setValidMoves(moves)
      } else {
        setSelectedPos(null)
        setValidMoves([])
      }
    } else {
      if (piece && piece.color === 'red') {
        setSelectedPos([row, col])
        const moves = getAllValidMoves(board, 'red').filter(
          m => m.fromRow === row && m.fromCol === col
        )
        setValidMoves(moves)
      }
    }
  }, [board, selectedPos, currentTurn, gameOver, aiThinking, checkGameState])

  // AI move
  useEffect(() => {
    if (currentTurn === 'black' && !gameOver) {
      setAiThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty)
        if (aiMove) {
          const moveStr = moveToString(board, aiMove)
          const captured = board[aiMove.toRow][aiMove.toCol]
          const newBoard = cloneBoard(board)
          newBoard[aiMove.toRow][aiMove.toCol] = newBoard[aiMove.fromRow][aiMove.fromCol]
          newBoard[aiMove.fromRow][aiMove.fromCol] = null

          if (captured) {
            setCapturedByBlack(prev => [...prev, captured])
          }

          setBoard(newBoard)
          setMoveHistory(prev => [...prev, `黑 ${moveStr}`])
          const nextTurn: PieceColor = 'red'
          setCurrentTurn(nextTurn)
          checkGameState(newBoard, nextTurn)
        }
        setAiThinking(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentTurn, gameOver, board, difficulty, checkGameState])

  const resetGame = () => {
    setBoard(createInitialBoard())
    setSelectedPos(null)
    setCurrentTurn('red')
    setGameOver(false)
    setWinner(null)
    setMoveHistory([])
    setValidMoves([])
    setAiThinking(false)
    setCapturedByRed([])
    setCapturedByBlack([])
    setInCheck(false)
  }

  const isValidTarget = (row: number, col: number) => {
    return validMoves.some(m => m.toRow === row && m.toCol === col)
  }

  const isSelected = (row: number, col: number) => {
    return selectedPos && selectedPos[0] === row && selectedPos[1] === col
  }

  const getStatusText = () => {
    if (gameOver) {
      return winner === 'red' ? '🎉 红方获胜！' : '😈 黑方获胜！'
    }
    if (aiThinking) return '🤔 AI思考中...'
    if (inCheck) return currentTurn === 'red' ? '⚠️ 红方被将军！' : '⚠️ 黑方被将军！'
    return currentTurn === 'red' ? '🔴 红方走棋' : '⚫ 黑方走棋'
  }

  // 渲染星位标记（四个小角标）
  const renderStarMark = (r: number, c: number) => {
    const cx = px(c), cy = py(r)
    const d = 5, len = 10
    const parts: string[] = []
    const draw = (dx: number, dy: number) => {
      parts.push(`M${cx + dx * d},${cy + dy * d} l${dx * len},0 M${cx + dx * d},${cy + dy * d} l0,${dy * len}`)
    }
    // 边缘点只画一侧
    if (c > 0) { draw(-1, -1); draw(-1, 1) }
    if (c < 8) { draw(1, -1); draw(1, 1) }
    if (c === 0) { draw(1, -1); draw(1, 1) }
    if (c === 8) { draw(-1, -1); draw(-1, 1) }
    return <path key={`star-${r}-${c}`} d={parts.join(' ')} stroke="#6b4c1e" strokeWidth="1.2" fill="none" />
  }

  return (
    <div className="game-page">
      <h2 className="game-title">中国象棋</h2>
      <div className="game-container">
        <div className="board-wrapper">
          <div className="captured-row">
            {capturedByBlack.map((p, i) => (
              <span key={i} className={`captured-piece ${p.color}`}>{getPieceName(p)}</span>
            ))}
          </div>

          <div className="chinese-board-container">
            <svg
              className="chinese-board-svg"
              width={SVG_W}
              height={SVG_H}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            >
              {/* 背景 */}
              <rect x="0" y="0" width={SVG_W} height={SVG_H}
                fill="url(#boardBg)" rx="2" />

              <defs>
                <linearGradient id="boardBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c4a35a" />
                  <stop offset="50%" stopColor="#b89845" />
                  <stop offset="100%" stopColor="#a88a3a" />
                </linearGradient>
              </defs>

              {/* 外框 */}
              <rect x={PAD - 4} y={PAD - 4} width={BW + 8} height={BH + 8}
                fill="none" stroke="#5a3a1a" strokeWidth="3" />

              {/* 横线 - 10条 */}
              {Array.from({ length: 10 }, (_, r) => (
                <line key={`h${r}`}
                  x1={px(0)} y1={py(r)} x2={px(8)} y2={py(r)}
                  stroke="#5a3a1a" strokeWidth="1.2" />
              ))}

              {/* 竖线 - 上半部分（黑方 0-4） */}
              {Array.from({ length: 9 }, (_, c) => (
                <line key={`vt${c}`}
                  x1={px(c)} y1={py(0)} x2={px(c)} y2={py(4)}
                  stroke="#5a3a1a" strokeWidth="1.2" />
              ))}

              {/* 竖线 - 下半部分（红方 5-9） */}
              {Array.from({ length: 9 }, (_, c) => (
                <line key={`vb${c}`}
                  x1={px(c)} y1={py(5)} x2={px(c)} y2={py(9)}
                  stroke="#5a3a1a" strokeWidth="1.2" />
              ))}

              {/* 楚河汉界 - 左右边线贯通 */}
              <line x1={px(0)} y1={py(4)} x2={px(0)} y2={py(5)} stroke="#5a3a1a" strokeWidth="1.2" />
              <line x1={px(8)} y1={py(4)} x2={px(8)} y2={py(5)} stroke="#5a3a1a" strokeWidth="1.2" />

              {/* 九宫格斜线 - 黑方 */}
              <line x1={px(3)} y1={py(0)} x2={px(5)} y2={py(2)} stroke="#5a3a1a" strokeWidth="1" />
              <line x1={px(5)} y1={py(0)} x2={px(3)} y2={py(2)} stroke="#5a3a1a" strokeWidth="1" />

              {/* 九宫格斜线 - 红方 */}
              <line x1={px(3)} y1={py(7)} x2={px(5)} y2={py(9)} stroke="#5a3a1a" strokeWidth="1" />
              <line x1={px(5)} y1={py(7)} x2={px(3)} y2={py(9)} stroke="#5a3a1a" strokeWidth="1" />

              {/* 星位标记 */}
              {STAR_POINTS.map(([r, c]) => renderStarMark(r, c))}

              {/* 楚河汉界文字 */}
              <text x={px(2)} y={py(4) + CELL * 0.5 + 6}
                textAnchor="middle" fontSize="20" fontWeight="bold"
                fill="#6b4c1e" fontFamily="'Noto Serif SC','SimSun','STSong',serif"
                letterSpacing="6">楚 河</text>
              <text x={px(6)} y={py(4) + CELL * 0.5 + 6}
                textAnchor="middle" fontSize="20" fontWeight="bold"
                fill="#6b4c1e" fontFamily="'Noto Serif SC','SimSun','STSong',serif"
                letterSpacing="6">汉 界</text>
            </svg>

            {/* 棋子层 - 覆盖在SVG上方 */}
            <div className="pieces-layer" style={{ width: SVG_W, height: SVG_H }}>
              {/* 可走位置提示 */}
              {validMoves.map(m => {
                if (!board[m.toRow][m.toCol]) {
                  return (
                    <div
                      key={`dot-${m.toRow}-${m.toCol}`}
                      className="valid-dot"
                      style={{
                        left: px(m.toCol) - 8,
                        top: py(m.toRow) - 8,
                      }}
                      onClick={() => handleIntersectionClick(m.toRow, m.toCol)}
                    />
                  )
                }
                return null
              })}

              {/* 棋子 */}
              {board.map((row, r) =>
                row.map((piece, c) => piece ? (
                  <div
                    key={`p-${r}-${c}`}
                    className={`piece ${piece.color} ${isSelected(r, c) ? 'selected' : ''} ${isValidTarget(r, c) ? 'valid-target' : ''}`}
                    style={{
                      left: px(c) - PIECE_R,
                      top: py(r) - PIECE_R,
                      width: PIECE_R * 2,
                      height: PIECE_R * 2,
                    }}
                    onClick={() => handleIntersectionClick(r, c)}
                  >
                    {getPieceName(piece)}
                  </div>
                ) : null)
              )}

              {/* 空交叉点点击区域（无棋子的位置也需要可点击） */}
              {board.map((row, r) =>
                row.map((piece, c) => !piece ? (
                  <div
                    key={`e-${r}-${c}`}
                    className="intersection-hit"
                    style={{
                      left: px(c) - 16,
                      top: py(r) - 16,
                    }}
                    onClick={() => handleIntersectionClick(r, c)}
                  />
                ) : null)
              )}
            </div>
          </div>

          <div className="captured-row">
            {capturedByRed.map((p, i) => (
              <span key={i} className={`captured-piece ${p.color}`}>{getPieceName(p)}</span>
            ))}
          </div>
        </div>

        <div className="game-info">
          <div className="game-status">{getStatusText()}</div>

          <div className="info-section">
            <label>AI难度</label>
            <select
              className="difficulty-select"
              value={difficulty}
              onChange={e => setDifficulty(Number(e.target.value))}
              disabled={aiThinking}
            >
              <option value={1}>简单</option>
              <option value={2}>中等</option>
              <option value={3}>困难</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={resetGame}>
            重新开始
          </button>

          <div className="move-history">
            <div className="label">走棋记录</div>
            {moveHistory.map((m, i) => (
              <div key={i}>{i + 1}. {m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {gameOver && (
        <div className="win-overlay">
          <div className="win-dialog">
            <div className="win-icon">{winner === 'red' ? '🏆' : '⚔️'}</div>
            <div className="win-title">{winner === 'red' ? '红方获胜' : '黑方获胜'}</div>
            <div className="win-subtitle">{winner === 'red' ? '恭喜！你战胜了AI' : 'AI获胜，再接再厉'}</div>
            <button className="win-btn" onClick={resetGame}>再来一局</button>
          </div>
        </div>
      )}
    </div>
  )
}
