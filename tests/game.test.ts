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

  it("Easy chooses the only available move", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", null] as Cell[];

    expect(getCpuMove(board, "easy")).toBe(8);
  });

  it("Medium takes a winning move before choosing a defensive move", () => {
    const board = ["O", "O", null, "X", "X", null, null, null, null] as Cell[];

    expect(getCpuMove(board, "medium")).toBe(2);
  });

  it("Medium blocks the opponent when no winning move is available", () => {
    const board = ["X", "X", null, "O", null, null, null, null, null] as Cell[];

    expect(getCpuMove(board, "medium")).toBe(2);
  });

  it("Unbeatable takes a winning move", () => {
    const board = ["O", "O", null, "X", "X", null, null, null, null] as Cell[];

    expect(getCpuMove(board, "unbeatable")).toBe(2);
  });

  it("Unbeatable chooses a safe side against the classic corner fork", () => {
    const board = ["X", null, null, null, "O", null, null, null, "X"] as Cell[];
    const move = getCpuMove(board, "unbeatable");

    expect([1, 3, 5, 7]).toContain(move);
  });

  it("Unbeatable opens with the center", () => {
    expect(getCpuMove(empty(), "unbeatable")).toBe(4);
  });
});
