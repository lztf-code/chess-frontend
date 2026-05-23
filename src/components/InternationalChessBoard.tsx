import { useState, useCallback } from 'react'
import {
  IBoard, IPieceColor, IPieceType, IMove,
  cloneIBoard, isKingInCheck,
  isICheckmate, isIStalemate, getPieceSymbol, getAllValidMoves,
} from '../international-chess/logic'

interface Props {
  board: IBoard | null
  currentTurn: string
  isPlayer: boolean
  mySide: string | null
  onMove: (move: any) => void
  gameOver: boolean
  onDeclareGameOver: (winner: string, reason: string) => void
}

export default function InternationalChessBoard({ board, currentTurn, isPlayer, mySide, onMove, gameOver, onDeclareGameOver }: Props) {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<IMove[]>([])
  const [promoting, setPromoting] = useState<IMove | null>(null)

  const turn: IPieceColor = currentTurn as IPieceColor
  const canMove = isPlayer && !gameOver && (
    (mySide === 'red' && turn === 'white') || (mySide === 'black' && turn === 'black')
  )

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!canMove || !board || promoting) return
    const piece = board[row]?.[col]

    if (selectedPos) {
      const [selRow, selCol] = selectedPos
      const matchingMoves = validMoves.filter(m => m.toRow === row && m.toCol === col)

      if (matchingMoves.length > 0) {
        const promotionMoves = matchingMoves.filter(m => m.promotion)
        if (promotionMoves.length > 0) {
          setPromoting(promotionMoves[0])
          return
        }
        const move = matchingMoves[0]
        onMove(move)
        setSelectedPos(null)
        setValidMoves([])

        // Check game end
        const newBoard = cloneIBoard(board)
        const p = newBoard[move.fromRow][move.fromCol]!
        newBoard[move.toRow][move.toCol] = { ...p, hasMoved: true }
        newBoard[move.fromRow][move.fromCol] = null
        if (move.isEnPassant) newBoard[move.fromRow][move.toCol] = null
        if (move.isCastleKing) { newBoard[move.fromRow][5] = newBoard[move.fromRow][7]; newBoard[move.fromRow][7] = null }
        if (move.isCastleQueen) { newBoard[move.fromRow][3] = newBoard[move.fromRow][0]; newBoard[move.fromRow][0] = null }
        if (move.promotion) newBoard[move.toRow][move.toCol] = { type: move.promotion, color: p.color, hasMoved: true }

        const nextTurn: IPieceColor = turn === 'white' ? 'black' : 'white'
        if (isICheckmate(newBoard, nextTurn)) {
          setTimeout(() => onDeclareGameOver(turn, '将杀'), 300)
        } else if (isIStalemate(newBoard, nextTurn)) {
          setTimeout(() => onDeclareGameOver('draw', '逼和'), 300)
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
  }, [canMove, board, turn, selectedPos, validMoves, promoting, onMove, onDeclareGameOver])

  const handlePromotion = useCallback((type: IPieceType) => {
    if (!promoting) return
    onMove({ ...promoting, promotion: type })
    setPromoting(null)
    setSelectedPos(null)
    setValidMoves([])
  }, [promoting, onMove])

  const isValidTarget = (row: number, col: number) => validMoves.some(m => m.toRow === row && m.toCol === col)
  const isSelected = (row: number, col: number) => selectedPos && selectedPos[0] === row && selectedPos[1] === col

  if (!board) return null

  return (
    <div className="iboard-wrapper">
      <div className="iboard">
        {board.map((row, r) => (
          <div key={r} className="irow">
            <div className="row-label">{8 - r}</div>
            {row.map((_, c) => {
              const piece = board[r][c]
              const isSel = isSelected(r, c)
              const isVal = isValidTarget(r, c)
              const isLight = (r + c) % 2 === 0
              return (
                <div key={c}
                  className={`icell ${isLight ? 'ilight' : 'idark'} ${isSel ? 'iselected' : ''} ${isVal ? 'ivalid-target' : ''}`}
                  onClick={() => handleCellClick(r, c)}>
                  {piece && <span className={`ipiece ${piece.color}`}>{getPieceSymbol(piece)}</span>}
                  {isVal && !piece && <div className="ivalid-dot" />}
                </div>
              )
            })}
          </div>
        ))}
        <div className="col-labels">
          <div className="row-label-spacer"></div>
          {'abcdefgh'.split('').map(ch => <div key={ch} className="col-label">{ch}</div>)}
        </div>
      </div>

      {promoting && (
        <div className="promotion-overlay">
          <div className="promotion-dialog">
            <h3>选择升变棋子</h3>
            <div className="promotion-options">
              {(['queen', 'rook', 'bishop', 'knight'] as IPieceType[]).map(type => (
                <button key={type} className="promotion-btn" onClick={() => handlePromotion(type)}>
                  {getPieceSymbol({ type, color: turn })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
