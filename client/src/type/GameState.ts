export interface SpectatorEvent {
  board: string[];
  currentPlayer: number;
  winner: string;
  spectator: boolean;
}

export interface NewGameEvent {
  board: string[];
  player: number;
  currentPlayer: number;
  winner: string;
}