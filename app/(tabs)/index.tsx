import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { getCpuMove, getOutcome, getWinningCells, type Cell, type Difficulty, type Mark, type Outcome } from "@/lib/game";

type GameMode = "cpu" | "local";

const COLORS = {
  bg: "#0A1220",
  surface: "#111C2D",
  surfaceRaised: "#17243A",
  surfaceBright: "#1D2C45",
  line: "#273750",
  text: "#F5F7FB",
  muted: "#8E9CB1",
  soft: "#B9C5D5",
  lime: "#B7F36B",
  limeDark: "#8CC94A",
  yellow: "#FFD166",
  yellowDark: "#DCA83F",
  danger: "#FF8E7A",
};

const EMPTY_BOARD: Cell[] = Array(9).fill(null);

async function tapFeedback() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics are optional on simulators and unsupported web previews.
  }
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Mark>("X");
  const [mode, setMode] = useState<GameMode>("cpu");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [round, setRound] = useState(1);

  const winningCells = useMemo(() => getWinningCells(board), [board]);
  const boardSize = Math.min(Math.max(width - 48, 260), 344);
  const cellSize = (boardSize - 20) / 3;
  const isCpuTurn = mode === "cpu" && turn === "O" && !outcome;

  useEffect(() => {
    if (!isCpuTurn) return;

    const timer = setTimeout(() => {
      const move = getCpuMove(board, difficulty);
      if (move !== undefined) makeMove(move, "O");
    }, 420);

    return () => clearTimeout(timer);
  }, [isCpuTurn, board, difficulty]);

  function makeMove(index: number, mark: Mark) {
    if (board[index] || outcome) return;

    const nextBoard = [...board];
    nextBoard[index] = mark;
    const nextOutcome = getOutcome(nextBoard);
    setBoard(nextBoard);

    if (nextOutcome) {
      setOutcome(nextOutcome);
      setScores((current) => ({
        X: current.X + (nextOutcome === "X" ? 1 : 0),
        O: current.O + (nextOutcome === "O" ? 1 : 0),
        draws: current.draws + (nextOutcome === "draw" ? 1 : 0),
      }));
      void tapFeedback();
      return;
    }

    setTurn(mark === "X" ? "O" : "X");
    void tapFeedback();
  }

  function handleCellPress(index: number) {
    if (isCpuTurn || outcome) return;
    makeMove(index, turn);
  }

  function startRound(incrementRound = true) {
    setBoard([...EMPTY_BOARD]);
    setTurn("X");
    setOutcome(null);
    if (incrementRound) setRound((current) => current + 1);
    void tapFeedback();
  }

  function changeMode(nextMode: GameMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    startRound();
  }

  function changeDifficulty(nextDifficulty: Difficulty) {
    if (nextDifficulty === difficulty) return;
    setDifficulty(nextDifficulty);
    startRound();
  }

  function resetMatch() {
    setScores({ X: 0, O: 0, draws: 0 });
    setRound(1);
    startRound(false);
  }

  function showHowToPlay() {
    Alert.alert(
      "How to play",
      "Place three of your marks in a row, column, or diagonal before your opponent. You play as X and always start. No account, network, or personal data is needed.",
      [{ text: "Got it", style: "default" }],
    );
  }

  function showPrivacyNote() {
    Alert.alert(
      "Privacy at a glance",
      "TactiTac is designed to work offline. Gameplay and scores stay on this device. The app does not require an account, ads, location, contacts, camera, microphone, notifications, or other sensitive permissions.",
      [{ text: "Close", style: "default" }],
    );
  }

  const statusLabel = outcome
    ? outcome === "draw"
      ? "DRAW GAME"
      : outcome === "X"
        ? "YOU WIN"
        : mode === "cpu"
          ? "CPU WINS"
          : "O WINS"
    : isCpuTurn
      ? "CPU IS THINKING"
      : mode === "cpu"
        ? "YOUR TURN"
        : `${turn}'S TURN`;

  const statusColor = outcome === "O" && mode === "cpu" ? COLORS.yellow : COLORS.lime;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.ambientGlowOne} />
        <View style={styles.ambientGlowTwo} />

        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <View style={styles.logoMark} accessible accessibilityLabel="TactiTac logo">
              <MaterialIcons name="grid-3x3" size={25} color={COLORS.bg} />
            </View>
            <View>
              <Text style={styles.brandName}>TactiTac</Text>
              <Text style={styles.brandTagline}>the tiny strategy game</Text>
            </View>
          </View>
          <Pressable
            onPress={showHowToPlay}
            accessibilityRole="button"
            accessibilityLabel="How to play"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="help-outline" size={22} color={COLORS.soft} />
          </Pressable>
        </View>

        <View style={styles.introRow}>
          <View>
            <Text style={styles.eyebrow}>QUICK MATCH</Text>
            <Text style={styles.title}>Make your move.</Text>
          </View>
          <View style={styles.roundBadge}>
            <Text style={styles.roundBadgeText}>ROUND {String(round).padStart(2, "0")}</Text>
          </View>
        </View>

        <View style={styles.modeSwitch} accessibilityRole="tablist">
          <Pressable
            onPress={() => changeMode("cpu")}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "cpu" }}
            style={[styles.modeOption, mode === "cpu" && styles.modeOptionActive]}
          >
            <MaterialIcons name="smart-toy" size={17} color={mode === "cpu" ? COLORS.bg : COLORS.muted} />
            <Text style={[styles.modeText, mode === "cpu" && styles.modeTextActive]}>VS CPU</Text>
          </Pressable>
          <Pressable
            onPress={() => changeMode("local")}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "local" }}
            style={[styles.modeOption, mode === "local" && styles.modeOptionActive]}
          >
            <MaterialIcons name="people-outline" size={18} color={mode === "local" ? COLORS.bg : COLORS.muted} />
            <Text style={[styles.modeText, mode === "local" && styles.modeTextActive]}>PASS & PLAY</Text>
          </Pressable>
        </View>

        {mode === "cpu" && (
          <View style={styles.difficultySection}>
            <View style={styles.difficultyHeader}>
              <Text style={styles.difficultyLabel}>CPU DIFFICULTY</Text>
              <Text style={styles.difficultyHint}>
                {difficulty === "easy" ? "WARM UP" : difficulty === "medium" ? "SMART MOVES" : "PERFECT PLAY"}
              </Text>
            </View>
            <View style={styles.difficultySwitch} accessibilityRole="tablist">
              {(["easy", "medium", "unbeatable"] as Difficulty[]).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => changeDifficulty(level)}
                  accessibilityRole="tab"
                  accessibilityLabel={`${level} difficulty`}
                  accessibilityState={{ selected: difficulty === level }}
                  style={({ pressed }) => [
                    styles.difficultyOption,
                    difficulty === level && styles.difficultyOptionActive,
                    pressed && styles.difficultyOptionPressed,
                  ]}
                >
                  <Text style={[styles.difficultyOptionText, difficulty === level && styles.difficultyOptionTextActive]}>
                    {level === "unbeatable" ? "UNBEATABLE" : level.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.scoreStrip}>
          <ScoreCard mark="X" score={scores.X} label={mode === "cpu" ? "YOU" : "PLAYER X"} accent={COLORS.lime} />
          <View style={styles.drawScore}>
            <Text style={styles.drawScoreNumber}>{scores.draws}</Text>
            <Text style={styles.drawScoreLabel}>DRAWS</Text>
          </View>
          <ScoreCard mark="O" score={scores.O} label={mode === "cpu" ? "CPU" : "PLAYER O"} accent={COLORS.yellow} align="right" />
        </View>

        <View style={styles.gameCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <Text style={styles.modeCaption}>{mode === "cpu" ? "SOLO MATCH" : "LOCAL MATCH"}</Text>
          </View>

          <View style={[styles.board, { width: boardSize, height: boardSize }]}>
            {board.map((cell, index) => {
              const isWinningCell = winningCells.includes(index);
              const row = Math.floor(index / 3);
              const col = index % 3;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleCellPress(index)}
                  disabled={Boolean(cell) || Boolean(outcome) || isCpuTurn}
                  accessibilityRole="button"
                  accessibilityLabel={`Row ${row + 1}, column ${col + 1}${cell ? `, ${cell}` : ", empty"}`}
                  style={({ pressed }) => [
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    col < 2 && styles.cellRightBorder,
                    row < 2 && styles.cellBottomBorder,
                    isWinningCell && styles.winningCell,
                    pressed && !cell && styles.cellPressed,
                  ]}
                >
                  {cell ? (
                    <Text style={[styles.mark, { color: cell === "X" ? COLORS.lime : COLORS.yellow }]}>{cell}</Text>
                  ) : (
                    <View style={styles.emptyCellDot} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.nextUpPill}>
            <Text style={styles.nextUpLabel}>{outcome ? "MATCH COMPLETE" : "NEXT UP"}</Text>
            <Text style={[styles.nextUpMark, { color: outcome ? COLORS.soft : turn === "X" ? COLORS.lime : COLORS.yellow }]}>
              {outcome ? (outcome === "draw" ? "NICE GRID" : `${outcome} TAKES IT`) : turn}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => startRound()}
            accessibilityRole="button"
            accessibilityLabel="Start a new round"
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <MaterialIcons name={outcome ? "replay" : "refresh"} size={20} color={COLORS.bg} />
            <Text style={styles.primaryActionText}>{outcome ? "PLAY AGAIN" : "NEW ROUND"}</Text>
          </Pressable>
          <Pressable
            onPress={resetMatch}
            accessibilityRole="button"
            accessibilityLabel="Reset match scores"
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <MaterialIcons name="restart-alt" size={20} color={COLORS.soft} />
            <Text style={styles.secondaryActionText}>RESET</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Pressable onPress={showPrivacyNote} accessibilityRole="button" accessibilityLabel="View privacy information">
            <Text style={styles.footerText}>OFFLINE FIRST  •  NO ACCOUNT  •  NO ADS</Text>
          </Pressable>
          <Text style={styles.footerSubtext}>Made for quick minds & friendly rivalries</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ScoreCard({
  mark,
  score,
  label,
  accent,
  align = "left",
}: {
  mark: Mark;
  score: number;
  label: string;
  accent: string;
  align?: "left" | "right";
}) {
  return (
    <View style={[styles.scoreCard, align === "right" && styles.scoreCardRight]}>
      <Text style={[styles.scoreMark, { color: accent }]}>{mark}</Text>
      <View style={align === "right" ? styles.scoreCopyRight : undefined}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    overflow: "hidden",
  },
  ambientGlowOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(183, 243, 107, 0.045)",
    top: -80,
    right: -80,
  },
  ambientGlowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 209, 102, 0.035)",
    top: 390,
    left: -110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logoMark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.lime,
    transform: [{ rotate: "-6deg" }],
  },
  brandName: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  brandTagline: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(17, 28, 45, 0.8)",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  introRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 18,
  },
  eyebrow: {
    color: COLORS.lime,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    fontWeight: "800",
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -1.1,
    marginTop: 4,
  },
  roundBadge: {
    borderRadius: 99,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 4,
  },
  roundBadgeText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 18,
  },
  modeOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  modeOptionActive: {
    backgroundColor: COLORS.lime,
  },
  modeText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  modeTextActive: {
    color: COLORS.bg,
  },
  difficultySection: {
    marginTop: -6,
    marginBottom: 18,
  },
  difficultyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 3,
    marginBottom: 8,
  },
  difficultyLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  difficultyHint: {
    color: COLORS.lime,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  difficultySwitch: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  difficultyOption: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  difficultyOptionActive: {
    backgroundColor: COLORS.surfaceBright,
    borderWidth: 1,
    borderColor: COLORS.limeDark,
  },
  difficultyOptionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  difficultyOptionText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  difficultyOptionTextActive: {
    color: COLORS.lime,
  },
  scoreStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 92,
  },
  scoreCardRight: {
    flexDirection: "row-reverse",
  },
  scoreCopyRight: {
    alignItems: "flex-end",
  },
  scoreMark: {
    fontSize: 29,
    lineHeight: 33,
    fontWeight: "900",
  },
  scoreNumber: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
  },
  scoreLabel: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  drawScore: {
    alignItems: "center",
  },
  drawScoreNumber: {
    color: COLORS.soft,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
  },
  drawScoreLabel: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  gameCard: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 19,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  statusRow: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  modeCaption: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 22,
    padding: 10,
    overflow: "hidden",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceRaised,
  },
  cellRightBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.line,
  },
  cellBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  winningCell: {
    backgroundColor: "rgba(183, 243, 107, 0.11)",
  },
  cellPressed: {
    backgroundColor: COLORS.surfaceBright,
    transform: [{ scale: 0.96 }],
  },
  mark: {
    fontSize: 58,
    lineHeight: 68,
    fontWeight: "900",
    letterSpacing: -3,
  },
  emptyCellDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#30415B",
  },
  nextUpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 99,
    backgroundColor: COLORS.surfaceBright,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 16,
  },
  nextUpLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  nextUpMark: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionText: {
    color: COLORS.bg,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  secondaryAction: {
    minWidth: 93,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryActionText: {
    color: COLORS.soft,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  footer: {
    alignItems: "center",
    marginTop: 25,
  },
  footerLine: {
    width: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.line,
    marginBottom: 13,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  footerSubtext: {
    color: "#53637A",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
  },
});
