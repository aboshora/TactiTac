import { describe, expect, it } from "vitest";

import { getCpuMove, getOutcome, getWinningCells, type Cell } from "../lib/game";

const empty = (): Cell[] => Array(9).fill(null);

describe("TactiTac game rules", () => {
  it("detects a horizontal win and its winning cells", () => {
    const board = ["X", "X", "X", null, "O", null, null, null, "O"] as Cell[];

    expect(getOutcome(board)).toBe("X");
    expect(getWinningCells(board)).toEqual([0, 1, 2]);
  });

  it("detects a diagonal win", () => {
    const board = ["O", "X", null, null, "O", "X", null, null, "O"] as Cell[];

    expect(getOutcome(board)).toBe("O");
    expect(getWinningCells(board)).toEqual([0, 4, 8]);
  });

  it("detects a draw when every cell is filled without a winner", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"] as Cell[];

    expect(getOutcome(board)).toBe("draw");
    expect(getWinningCells(board)).toEqual([]);
  });

  it("takes a winning move before choosing a defensive move", () => {
    const board = ["O", "O", null, "X", "X", null, null, null, null] as Cell[];

    expect(getCpuMove(board)).toBe(2);
  });

  it("blocks the opponent when no winning move is available", () => {
    const board = ["X", "X", null, "O", null, null, null, null, null] as Cell[];

    expect(getCpuMove(board)).toBe(2);
  });

  it("prefers the center on an empty board", () => {
    expect(getCpuMove(empty())).toBe(4);
  });
});
