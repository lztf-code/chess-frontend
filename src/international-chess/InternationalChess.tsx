import { useState, useCallback, useEffect } from 'react'
import {
  IBoard, IPiece, IPieceColor, IPieceType, IMove,
  createInitialBoard, cloneIBoard, isKingInCheck,
  isICheckmate, isIStalemate, getIAIMove, getPieceSymbol,
  moveItoAlgebraic, getAllValidMoves, isValidIMove,
} from './logic'
import './InternationalChess.css'

export default function InternationalChess() {
  const [board, setBoard] = useState<IBoard>(createInitialBoard)
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [currentTurn, setCurrentTurn] = useState<IPieceColor>('white')
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<string>('')
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [validMoves, setValidMoves] = useState<IMove[]>([])
  const [difficulty, setDifficulty] = useState(2)
  const [aiThinking, setAiThinking] = useState(false)
  const [capturedByWhite, setCapturedByWhite] = useState<IPiece[]>([])
  const [capturedByBlack, setCapturedByBlack] = useState<IPiece[]>([])
  const [inCheck, setInCheck] = useState(false)
  const [promoting, setPromoting] = useState<IMove | null>(null)

  const checkGameState = useCallback((newBoard: IBoard, turn: IPieceColor) => {
    if (isICheckmate(newBoard, turn)) {
      setGameOver(true)
      const winner = turn === 'white' ? '黑方' : '白方'
      setGameResult(`${winner}获胜！将杀！`)
    } else if (isIStalemate(newBoard, turn)) {
      setGameOver(true)
      setGameResult('和棋 - 逼和')
    } else {
      setInCheck(isKingInCheck(newBoard, turn))
    }
  }, [])

  const executeMove = useCallback((move: IMove) => {
    const moveStr = moveItoAlgebraic(board, move)
    const captured = board[move.toRow][move.toCol]
    const isEnPassantCapture = move.isEnPassant

    let capturedPiece: IPiece | null = captured;
    if (isEnPassantCapture) {
      capturedPiece = board[move.fromRow][move.toCol];
    }

    const newBoard = cloneIBoard(board);
    const piece = newBoard[move.fromRow][move.fromCol]!;
    newBoard[move.toRow][move.toCol] = { ...piece, hasMoved: true };
    newBoard[move.fromRow][move.fromCol] = null;

    if (move.isEnPassant) {
      newBoard[move.fromRow][move.toCol] = null;
    }
    if (move.isCastleKing) {
      newBoard[move.fromRow][5] = newBoard[move.fromRow][7];
      newBoard[move.fromRow][7] = null;
      if (newBoard[move.fromRow][5]) newBoard[move.fromRow][5]!.hasMoved = true;
    }
    if (move.isCastleQueen) {
      newBoard[move.fromRow][3] = newBoard[move.fromRow][0];
      newBoard[move.fromRow][0] = null;
      if (newBoard[move.fromRow][3]) newBoard[move.fromRow][3]!.hasMoved = true;
    }
    if (move.promotion) {
      newBoard[move.toRow][move.toCol] = { type: move.promotion, color: piece.color, hasMoved: true };
    }

    if (capturedPiece) {
      if (piece.color === 'white') {
        setCapturedByWhite(prev => [...prev, capturedPiece!]);
      } else {
        setCapturedByBlack(prev => [...prev, capturedPiece!]);
      }
    }

    setBoard(newBoard);
    setSelectedPos(null);
    setValidMoves([]);
    setMoveHistory(prev => [...prev, `${piece.color === 'white' ? '白' : '黑'} ${moveStr}`]);

    const nextTurn: IPieceColor = piece.color === 'white' ? 'black' : 'white';
    setCurrentTurn(nextTurn);
    checkGameState(newBoard, nextTurn);
  }, [board, checkGameState]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameOver || currentTurn !== 'white' || aiThinking || promoting) return

    const piece = board[row][col]

    if (selectedPos) {
      const [selRow, selCol] = selectedPos
      const matchingMoves = validMoves.filter(m => m.toRow === row && m.toCol === col)

      if (matchingMoves.length > 0) {
        // Check if this is a promotion move
        const promotionMoves = matchingMoves.filter(m => m.promotion)
        if (promotionMoves.length > 0) {
          // Show promotion dialog
          setPromoting(promotionMoves[0])
          return
        }

        executeMove(matchingMoves[0])
      } else if (piece && piece.color === 'white') {
        setSelectedPos([row, col])
        const moves = getAllValidMoves(board, 'white').filter(
          m => m.fromRow === row && m.fromCol === col
        )
        setValidMoves(moves)
      } else {
        setSelectedPos(null)
        setValidMoves([])
      }
    } else {
      if (piece && piece.color === 'white') {
        setSelectedPos([row, col])
        const moves = getAllValidMoves(board, 'white').filter(
          m => m.fromRow === row && m.fromCol === col
        )
        setValidMoves(moves)
      }
    }
  }, [board, selectedPos, currentTurn, gameOver, aiThinking, promoting, validMoves, executeMove])

  const handlePromotion = useCallback((type: IPieceType) => {
    if (!promoting) return
    const move: IMove = { ...promoting, promotion: type }
    executeMove(move)
    setPromoting(null)
  }, [promoting, executeMove])

  // AI move
  useEffect(() => {
    if (currentTurn === 'black' && !gameOver) {
      setAiThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getIAIMove(board, difficulty)
        if (aiMove) {
          executeMove(aiMove)
        }
        setAiThinking(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentTurn, gameOver, board, difficulty, checkGameState, executeMove])

  const resetGame = () => {
    setBoard(createInitialBoard())
    setSelectedPos(null)
    setCurrentTurn('white')
    setGameOver(false)
    setGameResult('')
    setMoveHistory([])
    setValidMoves([])
    setAiThinking(false)
    setCapturedByWhite([])
    setCapturedByBlack([])
    setInCheck(false)
    setPromoting(null)
  }

  const isValidTarget = (row: number, col: number) => {
    return validMoves.some(m => m.toRow === row && m.toCol === col)
  }

  const renderCell = (row: number, col: number) => {
    const piece = board[row][col]
    const isSelected = selectedPos && selectedPos[0] === row && selectedPos[1] === col
    const isValid = isValidTarget(row, col)
    const isLight = (row + col) % 2 === 0

    return (
      <div
        key={`${row}-${col}`}
        className={`icell ${isLight ? 'ilight' : 'idark'} ${isSelected ? 'iselected' : ''} ${isValid ? 'ivalid-target' : ''}`}
        onClick={() => handleCellClick(row, col)}
      >
        {piece && (
          <span className={`ipiece ${piece.color}`}>
            {getPieceSymbol(piece)}
          </span>
        )}
        {isValid && !piece && <div className="ivalid-dot" />}
      </div>
    )
  }

  const getStatusText = () => {
    if (gameOver) return `🏁 ${gameResult}`
    if (aiThinking) return '🤔 AI思考中...'
    if (inCheck) return currentTurn === 'white' ? '⚠️ 白方被将军！' : '⚠️ 黑方被将军！'
    return currentTurn === 'white' ? '⬜ 白方走棋' : '⬛ 黑方走棋'
  }

  return (
    <div className="game-page">
      <h2 className="igame-title">国际象棋</h2>
      <div className="game-container">
        <div className="iboard-wrapper">
          <div className="captured-row">
            {capturedByBlack.map((p, i) => (
              <span key={i} className="icaptured-piece">{getPieceSymbol(p)}</span>
            ))}
          </div>
          <div className="iboard">
            {board.map((row, r) => (
              <div key={r} className="irow">
                <div className="row-label">{8 - r}</div>
                {row.map((_, c) => renderCell(r, c))}
              </div>
            ))}
            <div className="col-labels">
              <div className="row-label-spacer"></div>
              {'abcdefgh'.split('').map(ch => (
                <div key={ch} className="col-label">{ch}</div>
              ))}
            </div>
          </div>
          <div className="captured-row">
            {capturedByWhite.map((p, i) => (
              <span key={i} className="icaptured-piece">{getPieceSymbol(p)}</span>
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
              <div key={i}>{Math.floor(i / 2) + 1}. {m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotion dialog */}
      {promoting && (
        <div className="promotion-overlay">
          <div className="promotion-dialog">
            <h3>选择升变棋子</h3>
            <div className="promotion-options">
              {(['queen', 'rook', 'bishop', 'knight'] as IPieceType[]).map(type => (
                <button
                  key={type}
                  className="promotion-btn"
                  onClick={() => handlePromotion(type)}
                >
                  {getPieceSymbol({ type, color: 'white' })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Win Modal */}
      {gameOver && (
        <div className="win-overlay">
          <div className="win-dialog">
            <div className="win-icon">
              {gameResult.includes('白方') ? '🏆' : gameResult.includes('黑方') ? '⚔️' : '🤝'}
            </div>
            <div className="win-title">
              {gameResult.includes('白方') ? '白方获胜' : gameResult.includes('黑方') ? '黑方获胜' : '和棋'}
            </div>
            <div className="win-subtitle">
              {gameResult.includes('白方') ? '恭喜！你战胜了AI' : gameResult.includes('黑方') ? 'AI获胜，再接再厉' : '势均力敌，握手言和'}
            </div>
            <button className="win-btn" onClick={resetGame}>再来一局</button>
          </div>
        </div>
      )}
    </div>
  )
}
