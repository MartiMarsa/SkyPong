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
| Game.ts | 509 | ~380 | ~295 |
| GameLoop.ts | - | ~185 | ~185 |
| CountdownManager.ts | - | ~40 | ~40 |

---

## Architecture

```
Game.ts (orchestrator ~295 lines)
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
- ✅ Remove debug logs
- ✅ Remove unused variables (_renderObserver, _renderObservable, _intervals)
- ✅ Consolidate signalGameReady logic (extracted to _signalGameReady helper method)
- ✅ Extract callback setup (extracted to _createRoomManagerCallbacks factory method)

### Remaining Refactoring Opportunities

#### 5. Create GameReadyManager (Advanced - 30+ min)

**Location**: Current code scattered in `game/client/src_cli/game/Game.ts`:
- Lines 188-210: PvP mode game ready logic (inside `createScene`)
- Lines 212-223: CountdownManager instantiation with callbacks
- Lines 269-284: `_signalGameReady()` helper method
- Lines 300-362: `_createRoomManagerCallbacks()` - specifically `onPlayerAssignment` callback

**Issue**: Game-ready/countdown flow is complex and scattered across multiple places in Game.ts. The flow involves:
1. Waiting for opponent (online mode)
2. Game start detection (`room.state.gameStarted`)
3. Countdown triggering (3-2-1-GO!)
4. Player assignment (camera adjustment based on player position)

**Action**: Create a dedicated class `GameReadyManager.ts` that handles:

```typescript
// Proposed interface
interface GameReadyManagerConfig {
  roomManager: RoomManager;
  countdownManager: CountdownManager;
  gui: any;
  isPvP: boolean;
  isOnline: boolean;
  onPlayerAssignment?: (params: { isPlayer2: boolean }) => void;
}

class GameReadyManager {
  constructor(config: GameReadyManagerConfig);
  
  // Start the game ready flow (call after room joins)
  start(): void;
  
  // Signal that client is ready (online mode)
  signalReady(): void;
  
  // Check if game has started
  isGameStarted(): boolean;
  
  // Cleanup
  dispose(): void;
}
```

**Methods to extract from Game.ts:**
1. `_signalGameReady()` logic → `GameReadyManager.handleGameReady()`
2. CountdownManager instantiation → move to GameReadyManager constructor
3. `onPlayerAssignment` callback → pass as config option, handle inside GameReadyManager

**Implementation steps:**
1. Create `game/client/src_cli/game/GameReadyManager.ts`
2. Move countdown-related code from Game.ts to new class
3. Update Game.ts to use GameReadyManager
4. Remove `_signalGameReady()` and related countdown code from Game.ts

**Note**: After implementing, run `rm -f game/client/src_cli/**/*.js` to cleanup compiled JS files.

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

# Clean compiled .js files (always do this after build!)
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
- Added `_signalGameReady()` helper method to consolidate PvP/non-PvP game ready logic
- Added `_createRoomManagerCallbacks()` factory method to extract RoomManager callback setup
