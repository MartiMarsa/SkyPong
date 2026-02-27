# Game.ts Refactoring Guide

This document provides step-by-step instructions to refactor the monolithic `Game.ts` into smaller, focused modules.

---

## Current State (COMPLETED)

| Step | Status | Details |
|------|--------|---------|
| Step 1: ClientEngine.ts | ✅ Done | Graphics & entities initialization |
| Step 2: RoomManager.ts | ✅ Done | Networking, state listeners, input handling |
| Step 3: Game.ts integration | ✅ Done | Uses both modules |
| Step 4: GameLoop.ts | ✅ Done | Render loop, interpolation, input handling |
| Step 5: CountdownManager.ts | ✅ Done | Countdown timer logic |

### Line Count Progress
| File | Original | After All Extractions | Current |
|------|----------|----------------------|---------|
| Game.ts | 509 | ~380 | ~330 |
| GameLoop.ts | - | ~185 | ~185 |
| CountdownManager.ts | - | ~40 | ~40 |

---

## Architecture

```
Game.ts (orchestrator ~330 lines)
├── ClientEngine.ts (graphics & entities)
├── RoomManager.ts (networking & state)
├── GameLoop.ts (render & input loop)
└── CountdownManager.ts (countdown timer)
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

### 3. `game/client/src_cli/game/GameLoop.ts`
- Render loop (ball/paddle interpolation)
- Input throttling and sending
- Debug monitor updates
- Default spawn positions for ball and paddles
- State listeners for enabled flags

### 4. `game/client/src_cli/game/CountdownManager.ts`
- Countdown timer logic
- Methods: `start()`, `stop()`, `dispose()`
- Callbacks for countdown updates and completion

---

## Bug Fixes Applied

### Bug 1: Paddles/Ball Invisible - Initial State Sync Issue

**Problem**: Ball and paddles were invisible or in wrong positions on game start.

**Root Cause**: In the refactored code, `roomManager.connect()` returns immediately but the room state hasn't synced yet. Reading `room.state.ball.x` etc. returns `undefined`.

**Fix**: Set default spawn positions in GameLoop constructor:
```typescript
// Set default spawn positions until server state arrives
// Table depth is 10, paddles are at ±4.9 (half depth - half paddle depth)
this._targetPaddlePosition.set(0, this._paddle.mesh.position.y, -GMCN.TABLE.SIZE.depth / 2 + GMCN.PADDLE.SIZE.depth / 2);
this._targetPaddle2Position.set(0, this._paddle2.mesh.position.y, GMCN.TABLE.SIZE.depth / 2 - GMCN.PADDLE.SIZE.depth / 2);
this._targetPosition.set(0, GMCN.BALL.RADIUS, 0);
```

Also added defensive checks to ignore undefined values:
```typescript
public updateBallPosition(x: number, y: number, z: number): void {
    if (x === undefined || y === undefined || z === undefined || isNaN(x) || isNaN(y) || isNaN(z)) {
        return;
    }
    this._targetPosition.set(x, y, z);
}
```

### Bug 2: Paddle Y Position Issue (Legacy)

**Problem**: Paddles appeared in middle of table on game start (original bug before GameLoop extraction)

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

### Completed
- ✅ Create GameLoop.ts
- ✅ Create CountdownManager.ts

### Remaining Refactoring Opportunities

#### 1. Remove Debug Logs (Quick - 5 min)
- **Location**: Lines 185-187 in Game.ts
- **Issue**: console.log statements left in production code
- **Action**: Remove debug console.log statements

#### 2. Remove Unused Variables (Quick - 5 min)
- **Location**: Game.ts class properties
- **Issue**: 
  - `_renderObserver` and `_renderObservable` - GameLoop handles rendering now
  - `_intervals` - CountdownManager handles its own intervals
- **Action**: Remove unused class properties and cleanup code

#### 3. Consolidate signalGameReady Logic (Medium - 15 min)
- **Location**: Lines 199-259 in Game.ts
- **Issue**: PvP and non-PvP branches have duplicated `signalGameReady` logic
- **Action**: Extract to a helper function or dedicated method

#### 4. Extract Callback Setup (Medium - 20 min)
- **Location**: Lines 85-157 in Game.ts
- **Issue**: Large RoomManager callback object makes code hard to read
- **Action**: Extract to a factory function or dedicated callback builder

#### 5. Create GameReadyManager (Advanced - 30+ min)
- **Issue**: Game-ready/countdown flow is complex and scattered
- **Action**: Create a dedicated class that handles:
  - Waiting for opponent (online mode)
  - Game start detection
  - Countdown triggering
  - Player assignment callbacks

---

## Code Review Checklist

- [x] Remove unused imports in ClientEngine.ts (removed unused `Client` import from colyseus.js)
- [ ] Review callback structure - consider if callbacks could be more type-safe
- [ ] Consider adding JSDoc comments to RoomManager public methods
- [x] Initial state sync issue fixed (room.state undefined bug)

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
- GameLoop sets default spawn positions until server state syncs
- CountdownManager handles its own intervals (no longer uses Game._intervals)
