// International Chess Game Logic

export type IPieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type IPieceColor = 'white' | 'black';

export interface IPiece {
  type: IPieceType;
  color: IPieceColor;
  hasMoved?: boolean;
}

export type IBoard = (IPiece | null)[][];

export interface IMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  promotion?: IPieceType;
  isEnPassant?: boolean;
  isCastleKing?: boolean;
  isCastleQueen?: boolean;
}

const PIECE_UNICODE: Record<IPieceType, { white: string; black: string }> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

export function getPieceSymbol(piece: IPiece): string {
  return PIECE_UNICODE[piece.type][piece.color];
}

export function createInitialBoard(): IBoard {
  const board: IBoard = Array.from({ length: 8 }, () => Array(8).fill(null));

  const backRow: IPieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: 'black', hasMoved: false };
    board[1][c] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][c] = { type: 'pawn', color: 'white', hasMoved: false };
    board[7][c] = { type: backRow[c], color: 'white', hasMoved: false };
  }

  return board;
}

export function cloneIBoard(board: IBoard): IBoard {
  return board.map(row => row.map(p => p ? { ...p } : null));
}

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board: IBoard, color: IPieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p?.type === 'king' && p.color === color) return [r, c];
    }
  }
  return null;
}

function isSquareAttacked(board: IBoard, row: number, col: number, byColor: IPieceColor): boolean {
  // Check knight attacks
  const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr, nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'knight') return true;
    }
  }

  // Check pawn attacks
  const pawnDir = byColor === 'white' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const nr = row + pawnDir, nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'pawn') return true;
    }
  }

  // Check king attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr, nc = col + dc;
      if (isInBounds(nr, nc)) {
        const p = board[nr][nc];
        if (p && p.color === byColor && p.type === 'king') return true;
      }
    }
  }

  // Check sliding pieces (rook, bishop, queen)
  // Rook/Queen directions
  const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of rookDirs) {
    let nr = row + dr, nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'rook' || p.type === 'queen')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Bishop/Queen directions
  const bishopDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of bishopDirs) {
    let nr = row + dr, nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'bishop' || p.type === 'queen')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

export function isKingInCheck(board: IBoard, color: IPieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return true;
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos[0], kingPos[1], opponentColor);
}

function generateRawMoves(board: IBoard, row: number, col: number): IMove[] {
  const piece = board[row][col];
  if (!piece) return [];
  const moves: IMove[] = [];
  const color = piece.color;

  const addMove = (tr: number, tc: number, extra?: Partial<IMove>) => {
    if (!isInBounds(tr, tc)) return;
    const target = board[tr][tc];
    if (target && target.color === color) return;
    moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc, ...extra });
  };

  switch (piece.type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      const promotionRow = color === 'white' ? 0 : 7;

      // Forward
      const nr = row + dir;
      if (isInBounds(nr, col) && !board[nr][col]) {
        if (nr === promotionRow) {
          for (const pt of ['queen', 'rook', 'bishop', 'knight'] as IPieceType[]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, promotion: pt });
          }
        } else {
          moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col });
        }
        // Double move
        if (row === startRow) {
          const nr2 = row + dir * 2;
          if (!board[nr2][col]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr2, toCol: col });
          }
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color !== color) {
            if (nr === promotionRow) {
              for (const pt of ['queen', 'rook', 'bishop', 'knight'] as IPieceType[]) {
                moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, promotion: pt });
              }
            } else {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
            }
          }
          // En passant
          const epTarget = board[row][nc];
          if (epTarget && epTarget.type === 'pawn' && epTarget.color !== color && !board[nr][nc]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, isEnPassant: true });
          }
        }
      }
      break;
    }

    case 'knight': {
      const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of knightOffsets) {
        addMove(row + dr, col + dc);
      }
      break;
    }

    case 'bishop': {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        let tr = row + dr, tc = col + dc;
        while (isInBounds(tr, tc)) {
          const target = board[tr][tc];
          if (target) {
            if (target.color !== color) moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
            break;
          }
          moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
          tr += dr;
          tc += dc;
        }
      }
      break;
    }

    case 'rook': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let tr = row + dr, tc = col + dc;
        while (isInBounds(tr, tc)) {
          const target = board[tr][tc];
          if (target) {
            if (target.color !== color) moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
            break;
          }
          moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
          tr += dr;
          tc += dc;
        }
      }
      break;
    }

    case 'queen': {
      const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const [dr, dc] of dirs) {
        let tr = row + dr, tc = col + dc;
        while (isInBounds(tr, tc)) {
          const target = board[tr][tc];
          if (target) {
            if (target.color !== color) moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
            break;
          }
          moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
          tr += dr;
          tc += dc;
        }
      }
      break;
    }

    case 'king': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          addMove(row + dr, col + dc);
        }
      }
      // Castling
      if (!piece.hasMoved && !isKingInCheck(board, color)) {
        // King side
        const kingSideRook = board[row][7];
        if (kingSideRook && kingSideRook.type === 'rook' && !kingSideRook.hasMoved) {
          if (!board[row][5] && !board[row][6]) {
            const opponentColor = color === 'white' ? 'black' : 'white';
            if (!isSquareAttacked(board, row, 5, opponentColor) && !isSquareAttacked(board, row, 6, opponentColor)) {
              moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: 6, isCastleKing: true });
            }
          }
        }
        // Queen side
        const queenSideRook = board[row][0];
        if (queenSideRook && queenSideRook.type === 'rook' && !queenSideRook.hasMoved) {
          if (!board[row][1] && !board[row][2] && !board[row][3]) {
            const opponentColor = color === 'white' ? 'black' : 'white';
            if (!isSquareAttacked(board, row, 2, opponentColor) && !isSquareAttacked(board, row, 3, opponentColor)) {
              moves.push({ fromRow: row, fromCol: col, toRow: row, toCol: 2, isCastleQueen: true });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

export function isValidIMove(board: IBoard, move: IMove): boolean {
  const piece = board[move.fromRow][move.fromCol];
  if (!piece) return false;

  const newBoard = applyMove(board, move);
  return !isKingInCheck(newBoard, piece.color);
}

function applyMove(board: IBoard, move: IMove): IBoard {
  const newBoard = cloneIBoard(board);
  const piece = newBoard[move.fromRow][move.fromCol]!;

  newBoard[move.toRow][move.toCol] = { ...piece, hasMoved: true };
  newBoard[move.fromRow][move.fromCol] = null;

  // En passant capture
  if (move.isEnPassant) {
    newBoard[move.fromRow][move.toCol] = null;
  }

  // Castling
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

  // Promotion
  if (move.promotion) {
    newBoard[move.toRow][move.toCol] = { type: move.promotion, color: piece.color, hasMoved: true };
  }

  return newBoard;
}

export function getAllValidMoves(board: IBoard, color: IPieceColor): IMove[] {
  const moves: IMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const rawMoves = generateRawMoves(board, r, c);
        for (const move of rawMoves) {
          if (isValidIMove(board, move)) {
            moves.push(move);
          }
        }
      }
    }
  }
  return moves;
}

export function isICheckmate(board: IBoard, color: IPieceColor): boolean {
  return isKingInCheck(board, color) && getAllValidMoves(board, color).length === 0;
}

export function isIStalemate(board: IBoard, color: IPieceColor): boolean {
  return !isKingInCheck(board, color) && getAllValidMoves(board, color).length === 0;
}

// AI evaluation
const PIECE_VALUES: Record<IPieceType, number> = {
  king: 20000,
  queen: 900,
  rook: 500,
  bishop: 330,
  knight: 320,
  pawn: 100,
};

// Position tables for white (flip for black)
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 10, 5, 10, 10, 5, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const POS_TABLES: Record<IPieceType, number[][]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_TABLE,
};

function evaluateIBoard(board: IBoard): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        let value = PIECE_VALUES[p.type];
        const table = POS_TABLES[p.type];
        if (p.color === 'white') {
          value += table[r][c];
          score += value;
        } else {
          value += table[7 - r][c];
          score -= value;
        }
      }
    }
  }
  return score;
}

function minimaxI(
  board: IBoard,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateIBoard(board);

  const color: IPieceColor = isMaximizing ? 'white' : 'black';
  const moves = getAllValidMoves(board, color);

  if (moves.length === 0) {
    if (isKingInCheck(board, color)) {
      return isMaximizing ? -99999 : 99999;
    }
    return 0; // Stalemate
  }

  // Sort moves for better pruning
  const sortedMoves = [...moves].sort((a, b) => {
    const aCapture = board[a.toRow][a.toCol];
    const bCapture = board[b.toRow][b.toCol];
    const aVal = aCapture ? PIECE_VALUES[aCapture.type] : 0;
    const bVal = bCapture ? PIECE_VALUES[bCapture.type] : 0;
    return bVal - aVal;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      const newBoard = applyMove(board, move);
      const eval_ = minimaxI(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      const newBoard = applyMove(board, move);
      const eval_ = minimaxI(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getIAIMove(board: IBoard, difficulty: number = 2): IMove | null {
  const moves = getAllValidMoves(board, 'black');
  if (moves.length === 0) return null;

  let bestMove: IMove | null = null;
  let bestEval = Infinity;

  // Sort moves by capture value for better pruning
  const sortedMoves = [...moves].sort((a, b) => {
    const aCapture = board[a.toRow][a.toCol];
    const bCapture = board[b.toRow][b.toCol];
    const aVal = aCapture ? PIECE_VALUES[aCapture.type] : 0;
    const bVal = bCapture ? PIECE_VALUES[bCapture.type] : 0;
    return bVal - aVal;
  });

  for (const move of sortedMoves) {
    const newBoard = applyMove(board, move);
    const eval_ = minimaxI(newBoard, difficulty, -Infinity, Infinity, true);
    if (eval_ < bestEval) {
      bestEval = eval_;
      bestMove = move;
    }
  }

  return bestMove;
}

export function moveItoAlgebraic(board: IBoard, move: IMove): string {
  const piece = board[move.fromRow][move.fromCol];
  if (!piece) return '';

  const cols = 'abcdefgh';
  const toStr = `${cols[move.toCol]}${8 - move.toRow}`;

  if (move.isCastleKing) return 'O-O';
  if (move.isCastleQueen) return 'O-O-O';

  let str = '';
  if (piece.type !== 'pawn') {
    str += piece.type.charAt(0).toUpperCase();
    if (piece.type === 'knight') str = 'N';
  }

  const isCapture = board[move.toRow][move.toCol] || move.isEnPassant;
  if (piece.type === 'pawn' && isCapture) {
    str += cols[move.fromCol];
  }

  if (isCapture) str += 'x';
  str += toStr;

  if (move.promotion) str += `=${move.promotion.charAt(0).toUpperCase()}`;

  // Check if the move results in check
  const newBoard = applyMove(board, move);
  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  if (isKingInCheck(newBoard, opponentColor)) {
    if (isICheckmate(newBoard, opponentColor)) str += '#';
    else str += '+';
  }

  return str;
}
