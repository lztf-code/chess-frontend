export type GameType = 'chinese' | 'international';
export type RoomType = 'public' | 'private';
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type UserRole = 'owner' | 'admin' | 'player' | 'spectator';

export interface User {
  id: string;
  nickname: string;
  role: UserRole;
}

export interface ChallengeRequest {
  id: string;
  userId: string;
  nickname: string;
  timestamp: number;
}

export interface DanmakuMessage {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  type: RoomType;
  hasPassword: boolean;
  gameType: GameType;
  ownerName: string;
  playerCount: number;
  spectatorCount: number;
  status: RoomStatus;
}

export interface RoomFullInfo {
  id: string;
  name: string;
  type: RoomType;
  hasPassword: boolean;
  gameType: GameType;
  owner: User;
  admins: User[];
  redPlayer: User | null;
  blackPlayer: User | null;
  spectators: User[];
  challengeQueue: ChallengeRequest[];
  status: RoomStatus;
  currentTurn: string;
  moveHistory: string[];
}
