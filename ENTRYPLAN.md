# Game Client Entry Simplification Plan

## Overview

This document outlines a plan to simplify the client initialization and entry flow for the SkyPong game. The current process has unnecessary complexity, redundant navigation steps, and tightly coupled code that makes maintenance difficult.

---

## Architecture Overview

The game has two entry points:

### 1. Production Mode (via Next.js front)
The Next.js app serves as the entry point and loads the game in an iframe:

```
Next.js Front (port 3000)
  └── /play (game mode selection)
      └── /launch?config=... (GameLauncher - validates config)
          └── /canvas?config=... (CanvasPage - renders iframe)
              └── /game-engine/launch?config=... (iframe → game client)
                  └── Game.ts (actual game initialization)
```

**Key files in `/front`:**
- `app/launch/page.tsx` - Validates and redirects to canvas
- `app/canvas/page.tsx` - Renders GameScreen with iframe
- `app/ui/game-front/GameScreen.tsx` - Iframe loading `/game-engine/launch`
- `app/lib/game/launch-config.ts` - GameConfig schema (mode, difficulty, etc.)
- `app/lib/game/engine-launch-config.ts` - Maps to game client's format

### 2. Dev/Testing Mode (direct game client)
The game client can be run standalone:

```
Game Client (Vite dev server)
  └── index.tsx (React Router)
      └── / (StartPage)
          └── /launch (GameLauncher - decodes config)
              └── /canvas (CanvasPage - starts game)
                  └── Game.ts
```

---

## Current State Issues

### Issues in `/front` (Next.js)

#### 1. Redundant Navigation Flow
- **Current**: `/` → `/launch` → `/canvas`
- **Problem**: `/launch` is an intermediate step that only validates/re-encodes config and immediately redirects to `/canvas`
- **Impact**: Extra route, extra component

#### 2. Double Config Encoding
- In `/front/app/ui/game-front/GameLauncher.tsx`:
  1. Decodes base64 config (`decodeGameConfig`)
  2. Re-encodes it (`encodeGameConfig`)
  3. Redirects to `/canvas`
- Then in `/canvas`, the config is decoded again to pass to GameScreen

#### 3. Two Config Formats
- **GameConfig** (`front/app/lib/game/launch-config.ts`): Front-end format
  ```typescript
  interface GameConfig {
    mode: 'AI' | 'ONLINE' | 'LOCAL';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    pointsToWin: number;
    ballColor: string;
    roomId?: string;
    onlineRole?: 'create' | 'join';
  }
  ```
- **EngineLaunchConfig** (`front/app/lib/game/engine-launch-config.ts`): Game client format
  ```typescript
  interface EngineLaunchConfig {
    playerName: string;
    playerColor: string;
    gameMode: 'ai-easy' | 'ai-medium' | 'ai-hard' | 'local-2p' | 'online-create' | 'online-join';
    player2Name?: string;
    player2Color?: string;
    roomId?: string;
  }
  ```
- Mapping happens in `GameScreen.tsx` → `engine-launch-config.ts`

#### 4. Iframe Routing Duplication
- Both front and game client have `/launch` and `/canvas` routes
- The game client routes are only reachable via iframe

---

### Issues in `/game/client` (Game Client)

#### 5. Duplicate Route Definition
In `game/client/src_cli/index.tsx:15,17`:
```tsx
<Route path="/launch" element={<GameLauncher />} />
<Route path="/launch" element={<GameLauncher />} />
```
This is a bug - the second definition is never reached.

#### 6. Monolithic Game.ts (556 lines)
The `Game` class handles:
- Babylon.js Engine/Scene initialization
- Colyseus networking
- Input handling
- Game entity creation
- State synchronization
- UI management
- Render loop
- Game lifecycle

#### 7. Debug Code Left in Production
Multiple `console.log` statements throughout the codebase that should be removed or replaced with proper logging.

#### 8. Mode Handling Complexity
Large switch statement in `Game.ts:148-170` with different room types for:
- `online-create`
- `online-join`
- `local-2p`
- `ai-easy`/`ai-medium`/`ai-hard`

---

## Simplification Plan

### Phase 1: Frontend Route Consolidation (Low Risk)

#### 1.1 Remove Intermediate Launch Route in Front
- **File**: `front/app/launch/page.tsx`
- **Action**: Remove `/launch` route entirely
- **Result**: User goes directly from mode selection to `/canvas`

#### 1.2 Simplify CanvasPage in Front
- **File**: `front/app/canvas/page.tsx`
- **Action**: Remove unnecessary decode/encode cycle, pass config via state or keep in URL
- **Alternative**: Validate config once, pass to GameScreen directly without URL encoding

**Before**:
```
PlayPage → navigate('/launch?config=...')
GameLauncher (validate + re-encode) → navigate('/canvas?config=...')
CanvasPage (decode + render GameScreen)
GameScreen (iframe /game-engine/launch?config=...)
```

**After**:
```
PlayPage → navigate('/canvas', { state: config })
CanvasPage (render GameScreen with config directly)
GameScreen (iframe /game-engine/canvas?config=...)
```

---

### Phase 2: Game Client Route Consolidation (Low Risk)

#### 2.1 Fix Duplicate Route
- **File**: `game/client/src_cli/index.tsx`
- **Action**: Remove duplicate `/launch` entry

#### 2.2 Remove Intermediate Launch Route in Game Client
- **File**: `game/client/src_cli/index.tsx`
- **Action**: Remove `/launch` route entirely
- **Result**: Flow becomes `/` → `/canvas?config=...`

#### 2.3 Move Config Decoding to CanvasPage
- **Files**: 
  - `game/client/src_cli/components/pages/CanvasPage.tsx`
  - `game/client/src_cli/utils/configDecoder.ts`
- **Action**: Decode config directly in CanvasPage instead of GameLauncher

---

### Phase 3: Config Format Unification (Medium Risk)

#### 3.1 Use Single Config Format
- **Option A**: Use `EngineLaunchConfig` throughout the entire flow
  - Modify `front/app/lib/game/launch-config.ts` to use engine format
  - Pros: Eliminates mapping, single source of truth
  - Cons: Front loses abstraction over game client details

- **Option B**: Keep `GameConfig` in front, decode once in game client
  - Front sends `GameConfig` to game client
  - Game client handles mapping internally
  - Pros: Better separation of concerns
  - Cons: Still needs mapping in game client

**Recommendation**: Option B - Keep abstraction in front, but decode once at game entry point

#### 3.2 Remove Double Validation
- Currently: Config validated in `/launch` (front) AND `/launch` (game client)
- After: Validate in `/canvas` (front) only, pass validated config to game client

---

### Phase 4: Code Cleanup (Low Risk)

#### 4.1 Remove Debug Console Logs
- **Files to audit**:
  - `game/client/src_cli/game/Game.ts`
  - `game/client/src_cli/rendering/EngineSetup.ts`
  - `game/client/src_cli/components/LoadingOverlay.tsx`
- **Action**: Remove or replace with proper debug logger

#### 4.2 Remove Unused Imports/Variables
- **File**: `game/client/src_cli/game/Game.ts:426`
- **Action**: Remove `inputSendCounter` comment and unused counter

---

### Phase 5: Architecture Refactoring (Medium Risk)

#### 5.1 Extract RoomManager
Create `game/client/src_cli/network/RoomManager.ts`:
```typescript
export class RoomManager {
  private client: Colyseus.Client;
  private room: Colyseus.Room<GameState> | null = null;

  async joinRoom(config: GameSessionConfig): Promise<Colyseus.Room<GameState>>;
  leaveRoom(): void;
  sendInput(input: InputState): void;
  onStateChange(callback: (state: GameState) => void): void;
}
```

#### 5.2 Extract GameEngine
Create `game/client/src_cli/game/GameEngine.ts`:
```typescript
export class GameEngine {
  private engine: Engine;
  private scene: Scene;
  private entities: { ball: ClientBall; paddle: ClientPaddle; paddle2: ClientPaddle };

  constructor(canvas: HTMLCanvasElement, config: GameSessionConfig);
  start(room: Colyseus.Room<GameState>): void;
  dispose(): void;
}
```

#### 5.3 Extract InputHandler
Create `game/client/src_cli/input/InputHandler.ts`:
- Consolidate keyboard/touch/mouse input logic
- Provide unified interface for paddle movement

#### 5.4 Simplify Game.ts
After extraction, `Game.ts` should primarily:
```typescript
export class Game {
  private engine: GameEngine;
  private roomManager: RoomManager;
  private ui: GameUIManager;

  start(canvas: HTMLCanvasElement, config: GameSessionConfig): CleanupFn;
}
```

---

### Phase 6: Configuration Simplification (Low Risk)

#### 6.1 Environment-Based Server URLs
- **File**: `game/client/src_cli/config/ServerConnectionConfig.ts`
- **Change**: Read from `import.meta.env` instead of hardcoded values

#### 6.2 Consolidate Config Types
- **File**: `game/client/src_cli/types/GameSessionConfig.ts`
- **Action**: Add defaults for optional fields to reduce null checks

---

## Implementation Order

1. **Week 1**: Phase 1 (Frontend Route Consolidation)
   - Remove /launch route in front
   - Simplify CanvasPage to use state instead of URL encoding

2. **Week 2**: Phase 2 (Game Client Route Consolidation)
   - Fix duplicate route in index.tsx
   - Remove /launch route in game client
   - Move decoding to CanvasPage

3. **Week 3**: Phase 3 (Config Format Unification)
   - Choose config strategy (Option A or B)
   - Implement single validation point

4. **Week 4**: Phase 4 (Code Cleanup)
   - Remove console.log statements
   - Fix unused variables
   - Clean up TODO comments

5. **Week 5**: Phase 5.1 (Extract RoomManager)
   - Create RoomManager class
   - Move networking logic from Game.ts
   - Test all game modes

6. **Week 6**: Phase 5.2-5.4 (Further extraction)
   - Extract GameEngine
   - Simplify main Game class
   - Add integration tests

7. **Week 7**: Phase 6 (Configuration)
   - Environment-based config
   - Type improvements

---

## Files to Modify

### Front (`/front`)
| File | Changes |
|------|---------|
| `app/launch/page.tsx` | Delete |
| `app/canvas/page.tsx` | Pass config via state, simplify |
| `app/ui/game-front/GameScreen.tsx` | Update iframe URL pattern |
| `app/lib/game/launch-config.ts` | Optional: align with engine format |

### Game Client (`/game/client`)
| File | Changes |
|------|---------|
| `src_cli/index.tsx` | Remove /launch route, fix duplicate |
| `src_cli/components/pages/GameLauncher.tsx` | Delete |
| `src_cli/components/pages/CanvasPage.tsx` | Add config decoding |
| `src_cli/game/Game.ts` | Refactor, extract classes |
| `src_cli/game/TestScene.ts` | Minor cleanup |
| `src_cli/config/ServerConnectionConfig.ts` | Environment-based |
| `src_cli/types/GameSessionConfig.ts` | Add defaults |

---

## Testing Checklist

After each phase:
- [ ] Local 2P mode works
- [ ] Online create/join works
- [ ] AI modes (easy/medium/hard) work
- [ ] Touch controls work on mobile
- [ ] Game cleanup (back to menu) works
- [ ] No memory leaks on restart
- [ ] Iframe communication works (if applicable)

---

## Success Metrics

- **Route count in game client**: 3 → 2
- **Route count in front**: 2 → 1
- **Game.ts lines**: ~556 → ~200
- **Console.log statements**: Removed or replaced with debug flag
- **Config decoding**: Single location per layer
- **Test coverage**: Add basic smoke tests for each game mode
