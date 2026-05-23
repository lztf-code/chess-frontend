import { useState, useCallback } from 'react'
import {
  Board, PieceColor, Move,
  cloneBoard, isValidMove, isInCheck,
  isCheckmate, getPieceName, getAllValidMoves,
} from '../chinese-chess/logic'

const CELL = 58
const PAD = 32
const PIECE_R = 24
const BW = 8 * CELL
const BH = 9 * CELL
const SVG_W = BW + PAD * 2
const SVG_H = BH + PAD * 2

function px(col: number) { return PAD + col * CELL }
function py(row: number) { return PAD + row * CELL }

const STAR_POINTS = [
  [2, 1], [2, 7], [7, 1], [7, 7],
  [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
  [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
]

interface Props {
  board: Board | null
  currentTurn: string
  isPlayer: boolean
  mySide: string | null
  onMove: (move: any) => void
  gameOver: boolean
  onDeclareGameOver: (winner: string, reason: string) => void
}

export default function ChineseChessBoard({ board, currentTurn, isPlayer, mySide, onMove, gameOver, onDeclareGameOver }: Props) {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])

  const currentBoard = board || []
  const turn: PieceColor = currentTurn as PieceColor

  const canMove = isPlayer && !gameOver && (
    (mySide === 'red' && turn === 'red') || (mySide === 'black' && turn === 'black')
  )

  const handleIntersectionClick = useCallback((row: number, col: number) => {
    if (!canMove || !board) return

    const piece = board[row]?.[col]

    if (selectedPos) {
      const [selRow, selCol] = selectedPos
      const move: Move = { fromRow: selRow, fromCol: selCol, toRow: row, toCol: col }

      if (isValidMove(board, move, turn)) {
        onMove(move)
        setSelectedPos(null)
        setValidMoves([])

        // Check for game end after move
        const newBoard = cloneBoard(board)
        newBoard[row][col] = newBoard[selRow][selCol]
        newBoard[selRow][selCol] = null
        const nextTurn = turn === 'red' ? 'black' : 'red'
        if (isCheckmate(newBoard, nextTurn)) {
          setTimeout(() => onDeclareGameOver(turn, '将杀'), 300)
        }
      } else if (piece && piece.color === turn && canMove) {
        setSelectedPos([row, col])
        setValidMoves(getAllValidMoves(board, turn).filter(m => m.fromRow === row && m.fromCol === col))
      } else {
        setSelectedPos(null)
        setValidMoves([])
      }
    } else {
      if (piece && piece.color === turn && canMove) {
        setSelectedPos([row, col])
        setValidMoves(getAllValidMoves(board, turn).filter(m => m.fromRow === row && m.fromCol === col))
      }
    }
  }, [canMove, board, turn, selectedPos, onMove, onDeclareGameOver])

  const isValidTarget = (row: number, col: number) => validMoves.some(m => m.toRow === row && m.toCol === col)
  const isSelected = (row: number, col: number) => selectedPos && selectedPos[0] === row && selectedPos[1] === col

  const renderStarMark = (r: number, c: number) => {
    const cx = px(c), cy = py(r), d = 5, len = 10
    const parts: string[] = []
    const draw = (dx: number, dy: number) => {
      parts.push(`M${cx + dx * d},${cy + dy * d} l${dx * len},0 M${cx + dx * d},${cy + dy * d} l0,${dy * len}`)
    }
    if (c > 0) { draw(-1, -1); draw(-1, 1) }
    if (c < 8) { draw(1, -1); draw(1, 1) }
    if (c === 0) { draw(1, -1); draw(1, 1) }
    if (c === 8) { draw(-1, -1); draw(-1, 1) }
    return <path key={`star-${r}-${c}`} d={parts.join(' ')} stroke="#6b4c1e" strokeWidth="1.2" fill="none" />
  }

  if (!board) return null

  return (
    <div className="chinese-board-container">
      <svg className="chinese-board-svg" width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#boardBg)" rx="2" />
        <defs>
          <linearGradient id="boardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4a35a" />
            <stop offset="50%" stopColor="#b89845" />
            <stop offset="100%" stopColor="#a88a3a" />
          </linearGradient>
        </defs>
        <rect x={PAD - 4} y={PAD - 4} width={BW + 8} height={BH + 8} fill="none" stroke="#5a3a1a" strokeWidth="3" />
        {Array.from({ length: 10 }, (_, r) => (<line key={`h${r}`} x1={px(0)} y1={py(r)} x2={px(8)} y2={py(r)} stroke="#5a3a1a" strokeWidth="1.2" />))}
        {Array.from({ length: 9 }, (_, c) => (<line key={`vt${c}`} x1={px(c)} y1={py(0)} x2={px(c)} y2={py(4)} stroke="#5a3a1a" strokeWidth="1.2" />))}
        {Array.from({ length: 9 }, (_, c) => (<line key={`vb${c}`} x1={px(c)} y1={py(5)} x2={px(c)} y2={py(9)} stroke="#5a3a1a" strokeWidth="1.2" />))}
        <line x1={px(0)} y1={py(4)} x2={px(0)} y2={py(5)} stroke="#5a3a1a" strokeWidth="1.2" />
        <line x1={px(8)} y1={py(4)} x2={px(8)} y2={py(5)} stroke="#5a3a1a" strokeWidth="1.2" />
        <line x1={px(3)} y1={py(0)} x2={px(5)} y2={py(2)} stroke="#5a3a1a" strokeWidth="1" />
        <line x1={px(5)} y1={py(0)} x2={px(3)} y2={py(2)} stroke="#5a3a1a" strokeWidth="1" />
        <line x1={px(3)} y1={py(7)} x2={px(5)} y2={py(9)} stroke="#5a3a1a" strokeWidth="1" />
        <line x1={px(5)} y1={py(7)} x2={px(3)} y2={py(9)} stroke="#5a3a1a" strokeWidth="1" />
        {STAR_POINTS.map(([r, c]) => renderStarMark(r, c))}
        <text x={px(2)} y={py(4) + CELL * 0.5 + 6} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#6b4c1e" fontFamily="'Noto Serif SC','SimSun',serif" letterSpacing="6">楚 河</text>
        <text x={px(6)} y={py(4) + CELL * 0.5 + 6} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#6b4c1e" fontFamily="'Noto Serif SC','SimSun',serif" letterSpacing="6">汉 界</text>
      </svg>

      <div className="pieces-layer" style={{ width: SVG_W, height: SVG_H }}>
        {validMoves.map(m => !board[m.toRow]?.[m.toCol] ? (
          <div key={`dot-${m.toRow}-${m.toCol}`} className="valid-dot" style={{ left: px(m.toCol) - 16, top: py(m.toRow) - 16, width: 32, height: 32 }} onClick={() => handleIntersectionClick(m.toRow, m.toCol)} onTouchStart={(e) => { e.preventDefault(); handleIntersectionClick(m.toRow, m.toCol); }} />
        ) : null)}
        {board.map((row, r) => row.map((piece, c) => piece ? (
          <div key={`p-${r}-${c}`} className={`piece ${piece.color} ${isSelected(r, c) ? 'selected' : ''} ${isValidTarget(r, c) ? 'valid-target' : ''}`}
            style={{ left: px(c) - PIECE_R, top: py(r) - PIECE_R, width: PIECE_R * 2, height: PIECE_R * 2 }}
            onClick={() => handleIntersectionClick(r, c)}
            onTouchStart={(e) => { e.preventDefault(); handleIntersectionClick(r, c); }}>
            {getPieceName(piece)}
          </div>
        ) : null))}
        {board.map((row, r) => row.map((_, c) => !board[r][c] ? (
          <div key={`e-${r}-${c}`} className="intersection-hit" style={{ left: px(c) - 16, top: py(r) - 16, width: 32, height: 32 }} onClick={() => handleIntersectionClick(r, c)} onTouchStart={(e) => { e.preventDefault(); handleIntersectionClick(r, c); }} />
        ) : null))}
      </div>
    </div>
  )
}
