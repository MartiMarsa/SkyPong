# Game.ts Refactoring Guide

This document provides step-by-step instructions to refactor the monolithic `Game.ts` into smaller, focused modules.

---

## Current State (COMPLETED)

| Step | Status | Details |
|------|--------|---------|
| Step 1: ClientEngine.ts | ✅ Done | Graphics & entities initialization |
| Step 2: RoomManager.ts | ✅ Done | Networking, state listeners, input handling |
| Step 3: Game.ts integration | ✅ Done | Uses both modules |

### Line Count Progress
| File | Before | After | Reduction |
|------|--------|-------|-----------|
| Game.ts | 509 | ~380 | ~25% |

---

## Architecture

```
Game.ts (orchestrator ~380 lines)
├── ClientEngine.ts (graphics & entities)
└── RoomManager.ts (networking & state)

Remaining: GameLoop.ts (render & input loop) - NOT YET EXTRACTED
```

---

## Files Created

### 1. `game/client/src_cli/game/ClientEngine.ts`
- Handles engine setup, scene creation
- Creates ball, table, paddles
- Sets up GUI and touch controls
- Handles disposal

### 2. `game/client/src_cli/game/RoomManager.ts`
- Colyseus client connection
- Game mode switch (online-create, online-join, local-2p, AI modes)
- State listeners (ball, paddle, scores, game over)
- Input sending to server
- Room cleanup

---

## Bug Fixes Applied

### Paddle Y Position Issue
**Problem**: Paddles appeared in middle of table on game start

**Root Cause**: In Game.ts, the `enabled` state variables were initialized to `true` instead of reading from room state. The `.listen()` method only fires on changes, not with initial value.

**Fix**: Read initial enabled values directly from room state:
```typescript
// Before (broken)
let isBallEnabled = true;

// After (fixed)
let isBallEnabled = roomManager.room?.state.ball.enabled ?? true;
```

---

## Next Steps

### 1. Create GameLoop.ts (RECOMMENDED)
Extract the render loop and input handling from Game.ts:

- **Render loop**: Ball/paddle interpolation, debug monitor updates
- **Input handling**: InputController integration, input sending throttling
- **Interpolation**: Lerp factor calculations

### 2. Cleanup Opportunities

Consider these additional optimizations:

- **Move `targetPosition` vectors** to RoomManager callbacks instead of Game.ts
- **Extract countdown logic** to a separate `CountdownManager.ts` class
- **Move initial HUD setup** (isPvP/isAI mode blocks) to a dedicated method
- **DebugMonitor integration**: Could be moved to ClientEngine or a new DebugManager class

### 3. Code Review Checklist

- [ ] Remove unused imports in ClientEngine.ts (currently has unused `Client` import from colyseus.js)
- [ ] Review callback structure - consider if callbacks could be more type-safe
- [ ] Consider adding JSDoc comments to RoomManager public methods

---

## Commands

```bash
# Build the client
cd game/client && npm run build

# Clean compiled .js files
rm -f game/client/src_cli/**/*.js
```

---

## Notes

- The `GameUIManager` callback for `onBackToMenu` is now properly wired through ClientEngine
- Player name/color updates happen after room join - handled in Game.ts
- DebugMonitor is kept in Game.ts for now (could be moved later)
- Initial enabled state must be read from room state before setting up listeners
