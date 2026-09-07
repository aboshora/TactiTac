export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Outcome = Mark | "draw" | null;
export type Difficulty = "easy" | "medium" | "unbeatable";

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

function openCells(board: Cell[]) {
  return board.map((value, index) => (value === null ? index : -1)).filter((index) => index >= 0);
}

function randomOpenCell(board: Cell[]) {
  const cells = openCells(board);
  return cells[Math.floor(Math.random() * cells.length)];
}

function findTacticalMove(board: Cell[], mark: Mark): number | null {
  for (const [a, b, c] of WIN_LINES) {
    const values = [board[a], board[b], board[c]];
    const markCount = values.filter((value) => value === mark).length;
    const emptyIndex = [a, b, c].find((index) => board[index] === null);
    if (markCount === 2 && emptyIndex !== undefined) return emptyIndex;
  }
  return null;
}

function getMediumMove(board: Cell[]): number {
  const winningMove = findTacticalMove(board, "O");
  if (winningMove !== null) return winningMove;

  const blockingMove = findTacticalMove(board, "X");
  if (blockingMove !== null) return blockingMove;

  if (board[4] === null) return 4;

  const openCorners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (openCorners.length) return openCorners[Math.floor(Math.random() * openCorners.length)];

  return randomOpenCell(board);
}

function minimax(board: Cell[], isMaximizing: boolean): number {
  const outcome = getOutcome(board);
  if (outcome === "O") return 10;
  if (outcome === "X") return -10;
  if (outcome === "draw") return 0;

  const cells = openCells(board);
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const index of cells) {
      board[index] = "O";
      bestScore = Math.max(bestScore, minimax(board, false));
      board[index] = null;
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const index of cells) {
    board[index] = "X";
    bestScore = Math.min(bestScore, minimax(board, true));
    board[index] = null;
  }
  return bestScore;
}

function getUnbeatableMove(board: Cell[]): number {
  if (board.every((cell) => cell === null)) return 4;

  let bestScore = -Infinity;
  let bestMove = openCells(board)[0];

  for (const index of openCells(board)) {
    board[index] = "O";
    const score = minimax(board, false);
    board[index] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

export function getCpuMove(board: Cell[], difficulty: Difficulty = "unbeatable"): number {
  if (difficulty === "easy") return randomOpenCell(board);
  if (difficulty === "medium") return getMediumMove(board);
  return getUnbeatableMove(board);
}
