export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Outcome = Mark | "draw" | null;

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function getOutcome(board: Cell[]): Outcome {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(Boolean) ? "draw" : null;
}

export function getWinningCells(board: Cell[]): number[] {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}

export function getCpuMove(board: Cell[]): number {
  const findTacticalMove = (mark: Mark) => {
    for (const [a, b, c] of WIN_LINES) {
      const values = [board[a], board[b], board[c]];
      const markCount = values.filter((value) => value === mark).length;
      const emptyIndex = [a, b, c].find((index) => board[index] === null);
      if (markCount === 2 && emptyIndex !== undefined) return emptyIndex;
    }
    return null;
  };

  const winningMove = findTacticalMove("O");
  if (winningMove !== null) return winningMove;

  const blockingMove = findTacticalMove("X");
  if (blockingMove !== null) return blockingMove;

  if (board[4] === null) return 4;

  const openCorners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (openCorners.length) return openCorners[Math.floor(Math.random() * openCorners.length)];

  const openCells = board.map((value, index) => (value === null ? index : -1)).filter((index) => index >= 0);
  return openCells[Math.floor(Math.random() * openCells.length)];
}
