// Chinese Chess (象棋) Game Logic

export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'pawn';
export type PieceColor = 'red' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

const PIECE_NAMES: Record<PieceType, { red: string; black: string }> = {
  king: { red: '帅', black: '将' },
  advisor: { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse: { red: '马', black: '马' },
  rook: { red: '车', black: '车' },
  cannon: { red: '炮', black: '炮' },
  pawn: { red: '兵', black: '卒' },
};

export function getPieceName(piece: Piece): string {
  return PIECE_NAMES[piece.type][piece.color];
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 10 }, () => Array(9).fill(null));

  // Black pieces (top, rows 0-4)
  const backRow: PieceType[] = ['rook', 'horse', 'elephant', 'advisor', 'king', 'advisor', 'elephant', 'horse', 'rook'];
  for (let c = 0; c < 9; c++) {
    board[0][c] = { type: backRow[c], color: 'black' };
  }
  board[2][1] = { type: 'cannon', color: 'black' };
  board[2][7] = { type: 'cannon', color: 'black' };
  for (let c = 0; c < 9; c += 2) {
    board[3][c] = { type: 'pawn', color: 'black' };
  }

  // Red pieces (bottom, rows 5-9)
  for (let c = 0; c < 9; c++) {
    board[9][c] = { type: backRow[c], color: 'red' };
  }
  board[7][1] = { type: 'cannon', color: 'red' };
  board[7][7] = { type: 'cannon', color: 'red' };
  for (let c = 0; c < 9; c += 2) {
    board[6][c] = { type: 'pawn', color: 'red' };
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(p => p ? { ...p } : null));
}

function isInPalace(row: number, col: number, color: PieceColor): boolean {
  if (col < 3 || col > 5) return false;
  if (color === 'red') return row >= 7 && row <= 9;
  return row >= 0 && row <= 2;
}

function hasRiverCrossed(row: number, color: PieceColor): boolean {
  if (color === 'red') return row <= 4;
  return row >= 5;
}

function countPiecesBetween(board: Board, r1: number, c1: number, r2: number, c2: number): number {
  let count = 0;
  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) {
      if (board[r1][c]) count++;
    }
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) {
      if (board[r][c1]) count++;
    }
  }
  return count;
}

export function isValidMove(board: Board, move: Move, currentTurn: PieceColor): boolean {
  const { fromRow, fromCol, toRow, toCol } = move;
  const piece = board[fromRow][fromCol];
  if (!piece) return false;
  if (piece.color !== currentTurn) return false;

  const target = board[toRow][toCol];
  if (target && target.color === piece.color) return false;

  if (toRow < 0 || toRow > 9 || toCol < 0 || toCol > 8) return false;

  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  switch (piece.type) {
    case 'king':
      if (!isInPalace(toRow, toCol, piece.color)) return false;
      if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
      break;

    case 'advisor':
      if (!isInPalace(toRow, toCol, piece.color)) return false;
      if (Math.abs(dr) !== 1 || Math.abs(dc) !== 1) return false;
      break;

    case 'elephant':
      if (hasRiverCrossed(toRow, piece.color)) return false;
      if (Math.abs(dr) !== 2 || Math.abs(dc) !== 2) return false;
      // Check blocking piece (elephant eye)
      const eyeR = fromRow + dr / 2;
      const eyeC = fromCol + dc / 2;
      if (board[eyeR][eyeC]) return false;
      break;

    case 'horse':
      if (!((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2))) return false;
      // Check blocking piece (horse leg)
      if (Math.abs(dr) === 2) {
        if (board[fromRow + (dr > 0 ? 1 : -1)][fromCol]) return false;
      } else {
        if (board[fromRow][fromCol + (dc > 0 ? 1 : -1)]) return false;
      }
      break;

    case 'rook':
      if (dr !== 0 && dc !== 0) return false;
      if (countPiecesBetween(board, fromRow, fromCol, toRow, toCol) > 0) return false;
      break;

    case 'cannon':
      if (dr !== 0 && dc !== 0) return false;
      const between = countPiecesBetween(board, fromRow, fromCol, toRow, toCol);
      if (target) {
        if (between !== 1) return false;
      } else {
        if (between !== 0) return false;
      }
      break;

    case 'pawn':
      if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
      if (piece.color === 'red') {
        if (dr > 0) return false; // Can't move backward
        if (fromRow >= 5 && dc !== 0) return false; // Before river, can't move sideways
      } else {
        if (dr < 0) return false;
        if (fromRow <= 4 && dc !== 0) return false;
      }
      break;
  }

  // Check if move results in king facing king
  const newBoard = cloneBoard(board);
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  if (kingsAreFacing(newBoard)) return false;

  // Check if own king is in check after move
  if (isInCheck(newBoard, piece.color)) return false;

  return true;
}

function kingsAreFacing(board: Board): boolean {
  let redKing: [number, number] | null = null;
  let blackKing: [number, number] | null = null;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'king') {
        if (p.color === 'red') redKing = [r, c];
        else blackKing = [r, c];
      }
    }
  }

  if (!redKing || !blackKing) return false;
  if (redKing[1] !== blackKing[1]) return false;

  const minR = Math.min(redKing[0], blackKing[0]);
  const maxR = Math.max(redKing[0], blackKing[0]);
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][redKing[1]]) return false;
  }

  return true;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  // Find king position
  let kingRow = -1, kingCol = -1;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'king' && p.color === color) {
        kingRow = r;
        kingCol = c;
        break;
      }
    }
    if (kingRow !== -1) break;
  }

  if (kingRow === -1) return true; // King captured

  // Check if any opponent piece can capture the king
  const opponentColor = color === 'red' ? 'black' : 'red';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.color === opponentColor) {
        if (canPieceAttack(board, r, c, kingRow, kingCol, p)) return true;
      }
    }
  }

  return false;
}

function canPieceAttack(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number, piece: Piece): boolean {
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  switch (piece.type) {
    case 'king':
      return Math.abs(dr) + Math.abs(dc) === 1;

    case 'advisor':
      return Math.abs(dr) === 1 && Math.abs(dc) === 1;

    case 'elephant':
      if (Math.abs(dr) !== 2 || Math.abs(dc) !== 2) return false;
      const eyeR = fromRow + dr / 2;
      const eyeC = fromCol + dc / 2;
      return !board[eyeR][eyeC];

    case 'horse': {
      if (!((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2))) return false;
      if (Math.abs(dr) === 2) {
        return !board[fromRow + (dr > 0 ? 1 : -1)][fromCol];
      } else {
        return !board[fromRow][fromCol + (dc > 0 ? 1 : -1)];
      }
    }

    case 'rook':
      if (dr !== 0 && dc !== 0) return false;
      return countPiecesBetween(board, fromRow, fromCol, toRow, toCol) === 0;

    case 'cannon':
      if (dr !== 0 && dc !== 0) return false;
      return countPiecesBetween(board, fromRow, fromCol, toRow, toCol) === 1;

    case 'pawn': {
      if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
      if (piece.color === 'red') {
        if (dr > 0) return false;
        if (fromRow >= 5 && dc !== 0) return false;
      } else {
        if (dr < 0) return false;
        if (fromRow <= 4 && dc !== 0) return false;
      }
      return true;
    }

    default:
      return false;
  }
}

export function getAllValidMoves(board: Board, color: PieceColor): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        for (let tr = 0; tr < 10; tr++) {
          for (let tc = 0; tc < 9; tc++) {
            if (r === tr && c === tc) continue;
            const move: Move = { fromRow: r, fromCol: c, toRow: tr, toCol: tc };
            if (isValidMove(board, move, color)) {
              moves.push(move);
            }
          }
        }
      }
    }
  }
  return moves;
}

export function isCheckmate(board: Board, color: PieceColor): boolean {
  return getAllValidMoves(board, color).length === 0;
}

// Piece values for AI evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  king: 10000,
  rook: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  pawn: 100,
};

// Position bonus tables for red (black is mirrored)
const PAWN_POS_BONUS_RED: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 20, 30, 40, 40, 40, 30, 20, 10],
  [20, 30, 50, 60, 70, 60, 50, 30, 20],
  [20, 40, 60, 80, 90, 80, 60, 40, 20],
  [10, 20, 40, 60, 70, 60, 40, 20, 10],
  [0, 0, 10, 20, 30, 20, 10, 0, 0],
];

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p) {
        let value = PIECE_VALUES[p.type];
        // Position bonus
        if (p.type === 'pawn') {
          if (p.color === 'red') {
            value += PAWN_POS_BONUS_RED[r][c];
          } else {
            value += PAWN_POS_BONUS_RED[9 - r][c];
          }
        }
        if (p.color === 'red') score += value;
        else score -= value;
      }
    }
  }
  return score;
}

function getRawMoves(board: Board, color: PieceColor): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        // Generate moves based on piece type for efficiency
        const pieceMoves = generatePieceMoves(board, r, c, p, color);
        moves.push(...pieceMoves);
      }
    }
  }
  // Filter to only valid moves
  return moves.filter(m => isValidMove(board, m, color));
}

function generatePieceMoves(board: Board, row: number, col: number, piece: Piece, color: PieceColor): Move[] {
  const moves: Move[] = [];

  switch (piece.type) {
    case 'king': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!target || target.color !== color) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
          }
        }
      }
      break;
    }
    case 'advisor': {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!target || target.color !== color) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
          }
        }
      }
      break;
    }
    case 'elephant': {
      const dirs = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!target || target.color !== color) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
          }
        }
      }
      break;
    }
    case 'horse': {
      const horseMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of horseMoves) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!target || target.color !== color) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
          }
        }
      }
      break;
    }
    case 'rook': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let nr = row + dr, nc = col + dc;
        while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (target) {
            if (target.color !== color) {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
            }
            break;
          }
          moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
          nr += dr;
          nc += dc;
        }
      }
      break;
    }
    case 'cannon': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let nr = row + dr, nc = col + dc;
        let jumped = false;
        while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!jumped) {
            if (target) {
              jumped = true;
            } else {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
            }
          } else {
            if (target) {
              if (target.color !== color) {
                moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
              }
              break;
            }
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }
    case 'pawn': {
      if (color === 'red') {
        if (row - 1 >= 0) moves.push({ fromRow: row, fromCol: col, toRow: row - 1, toCol: col });
        if (row <= 4) {
          if (col - 1 >= 0) moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: col - 1 });
          if (col + 1 <= 8) moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: col + 1 });
        }
      } else {
        if (row + 1 <= 9) moves.push({ fromRow: row, fromCol: col, toRow: row + 1, toCol: col });
        if (row >= 5) {
          if (col - 1 >= 0) moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: col - 1 });
          if (col + 1 <= 8) moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: col + 1 });
        }
      }
      break;
    }
  }

  return moves;
}

function makeMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  newBoard[move.toRow][move.toCol] = newBoard[move.fromRow][move.fromCol];
  newBoard[move.fromRow][move.fromCol] = null;
  return newBoard;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateBoard(board);

  const color: PieceColor = isMaximizing ? 'red' : 'black';
  const moves = getRawMoves(board, color);

  if (moves.length === 0) {
    return isMaximizing ? -99999 : 99999;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(board: Board, difficulty: number = 2): Move | null {
  const moves = getRawMoves(board, 'black');
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestEval = Infinity; // Black minimizes

  // Sort moves by capture value for better alpha-beta pruning
  const sortedMoves = moves.sort((a, b) => {
    const aCapture = board[a.toRow][a.toCol];
    const bCapture = board[b.toRow][b.toCol];
    const aVal = aCapture ? PIECE_VALUES[aCapture.type] : 0;
    const bVal = bCapture ? PIECE_VALUES[bCapture.type] : 0;
    return bVal - aVal;
  });

  for (const move of sortedMoves) {
    const newBoard = makeMove(board, move);
    const eval_ = minimax(newBoard, difficulty, -Infinity, Infinity, true);
    if (eval_ < bestEval) {
      bestEval = eval_;
      bestMove = move;
    }
  }

  return bestMove;
}

export function moveToString(board: Board, move: Move): string {
  const piece = board[move.fromRow][move.fromCol];
  if (!piece) return '';
  const name = getPieceName(piece);
  const colNames = piece.color === 'red'
    ? ['九', '八', '七', '六', '五', '四', '三', '二', '一']
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const fromCol = colNames[move.fromCol];

  let action: string;
  let toPos: string;

  if (move.fromRow === move.toRow) {
    action = '平';
    toPos = colNames[move.toCol];
  } else {
    const forward = piece.color === 'red' ? move.toRow < move.fromRow : move.toRow > move.fromRow;
    action = forward ? '进' : '退';

    if (move.fromCol === move.toCol) {
      // Vertical move - show distance
      const dist = Math.abs(move.toRow - move.fromRow);
      const distStr = piece.color === 'red'
        ? ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][dist]
        : String(dist);
      toPos = distStr;
    } else {
      // Diagonal move - show destination column
      toPos = colNames[move.toCol];
    }
  }

  return `${name}${fromCol}${action}${toPos}`;
}
