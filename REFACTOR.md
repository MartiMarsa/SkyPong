# Game.ts Refactoring Guide

This document provides step-by-step instructions to refactor the monolithic `Game.ts` into smaller, focused modules.

---

## Current State

- **Game.ts**: 556 lines handling engine setup, scene creation, entity management, networking, state handling, render loop, and cleanup
- **Problem**: Hard to maintain, test, and understand

---

## Target Architecture

```
Game.ts (orchestrator)
├── ClientEngine.ts (graphics & entities)
├── RoomManager.ts (networking & state)
└── GameLoop.ts (render & input loop)
```

---

## Step 1: Create ClientEngine.ts

### File: `src_cli/game/ClientEngine.ts`

Create a new file with the following structure:

```typescript
import {
    Scene,
    Vector3,
    Color3,
} from "@babylonjs/core";
import { ClientBall } from "../entities/ClientBall";
import { ClientTable } from "../entities/ClientTable";
import { ClientPaddle } from "../entities/ClientPaddle";
import { SceneLights } from "../rendering/SceneLights";
import { EngineSetup, CameraViewType } from "../rendering/EngineSetup";
import { GameUIManager } from "../ui/GameUIManager";
import { TouchControls } from "../ui/TouchControls";
import { touchDetection } from "../utils/touchDetection";
import { RENDERING } from "../config";
import { GameSessionConfig } from "../types/GameSessionConfig";

export interface GameEntities {
    ball: ClientBall;
    table: ClientTable;
    paddle: ClientPaddle;
    paddle2: ClientPaddle;
    gui: GameUIManager;
    touchControls: TouchControls;
}

export class ClientEngine {
    public engineSetup: EngineSetup;
    public scene: Scene;
    private _entities: GameEntities | null = null;
    private _touchControls: TouchControls | null = null;

    constructor(canvas: HTMLCanvasElement, config: GameSessionConfig) {
        const { gameMode, cameraView } = config;
        const isLocal2P = gameMode === 'local-2p';
        
        this.engineSetup = new EngineSetup(
            canvas, 
            false, 
            cameraView || (isLocal2P ? 'top-down' : 'angled')
        );
        this.scene = this.engineSetup.scene;
    }

    public init(player1Name: string, player2Name: string): GameEntities {
        const scene = this.scene;
        
        // Setup camera
        this.engineSetup.camera.setTarget(Vector3.Zero());
        
        // Create lights
        const shadowGenerator = SceneLights.Create(scene);
        
        // Create entities
        const ball = new ClientBall(scene);
        const table = new ClientTable(scene);
        
        // Setup refraction render list
        const skybox = scene.getMeshByName("hdrSkyBox");
        const refractionRenderList = skybox 
            ? [table.mesh, skybox, ball.mesh] 
            : [table.mesh];
        
        // Create paddles
        const createPaddle = (name: string) => new ClientPaddle(scene, {
            name,
            materialKey: "CLEARGLASS",
            albedoColor: new Color3(0.5, 0.5, 0.5),
            tintColor: new Color3(0.5, 0.5, 0.5),
            refractionRenderList,
        });
        
        const paddle = createPaddle("paddle1");
        const paddle2 = createPaddle("paddle2");
        
        // Setup GUI
        const gui = new GameUIManager(scene, () => {
            // Callback handled by Game.ts
        });
        
        // Setup touch controls
        const hasTouch = touchDetection();
        const touchControls = new TouchControls(gui.texture);
        
        if (hasTouch) {
            touchControls.showControls();
        }
        
        this._touchControls = touchControls;
        
        // Set rendering group
        [table.mesh, ball.mesh, paddle.mesh, paddle2.mesh].forEach(m => {
            m.renderingGroupId = RENDERING.RENDERING_GROUPS.GAME_OBJECTS;
        });
        
        // Add shadow casters
        shadowGenerator.addShadowCaster(ball.mesh);
        
        // Set resize target
        this.engineSetup.setResizeTarget(table.mesh);
        
        // Initial HUD - Game.ts will update names later
        gui.showGameHUD(player1Name, player2Name);
        
        this._entities = { ball, table, paddle, paddle2, gui, touchControls };
        return this._entities;
    }

    public getEntities(): GameEntities | null {
        return this._entities;
    }

    public dispose(): void {
        this._touchControls?.dispose();
        this._entities?.gui.dispose();
        this._entities = null;
        this.engineSetup.dispose();
    }
}
```

---

## Step 2: Update Game.ts to use ClientEngine

### 2.1 Remove unused imports

Delete these lines from the imports section (now handled by ClientEngine):

```typescript
// DELETE these imports:
import { ClientBall } from "../entities/ClientBall";
import { ClientTable } from "../entities/ClientTable";
import { ClientPaddle } from "../entities/ClientPaddle";
import { SceneLights } from "../rendering/SceneLights";
import { EngineSetup } from "../rendering/EngineSetup";
import { GameUIManager } from '../ui/GameUIManager';
import { TouchControls } from '../ui/TouchControls';
import { touchDetection } from '../utils/touchDetection';
import { RENDERING } from '../config';
```

### 2.2 Add new import

```typescript
// ADD this import:
import { ClientEngine } from "./ClientEngine";
```

### 2.3 Replace entity creation code

Find this section in `startGame()` (around lines 75-137):

```typescript
// DELETE this entire block:
const engineSetup = new EngineSetup(canvas, false, cameraView || (isLocal2P ? 'top-down' : 'angled'));
this._engineSetup = engineSetup;
const engine = engineSetup.engine;

// ... (all entity creation code) ...

gui.showGameHUD(player1Name, initialPlayer2Name);
```

**REPLACE with:**

```typescript
const clientEngine = new ClientEngine(canvas, config);
const entities = clientEngine.init(player1Name, player2Name);
const { ball, table, paddle, paddle2, gui, touchControls } = entities;
const engine = clientEngine.engineSetup.engine;
```

### 2.4 Update references

Throughout Game.ts, replace:

| Old Reference | New Reference |
|---------------|----------------|
| `engineSetup` | `clientEngine.engineSetup` |
| `this._engineSetup` | `clientEngine.engineSetup` |
| `this._gui` | `gui` |

### 2.5 Remove unused class properties

In the `Game` class, remove properties that are now handled by ClientEngine:

```typescript
// REMOVE from class:
private _engineSetup: EngineSetup | null = null;
private _debugMonitor: DebugMonitor | null = null;
// (keep debugMonitor for now, move later)
```

### 2.6 Update cleanup method

Replace `this._engineSetup?.dispose()` with:

```typescript
clientEngine.dispose();
```

---

## Step 3: Build and Test

Run the build to check for errors:

```bash
cd game/client && npm run build
```

---

## Next Steps (For Next Session)

After ClientEngine is working, proceed to:

1. **Create RoomManager.ts**
   - Extract Colyseus client and room logic
   - Move mode handling (switch statement)
   - Move state listeners
   - Handle room connection/disconnection

2. **Create GameLoop.ts**
   - Extract render loop
   - Extract interpolation logic
   - Extract input handling

3. **Finalize Game.ts**
   - Use all extracted classes
   - Remove remaining duplicate code

---

## Notes

- The `GameUIManager` callback for `onBackToMenu` needs to be wired up properly - consider passing it from Game.ts to ClientEngine
- Player name/color updates happen after room join - these are handled in Game.ts after getting entities
- Keep the DebugMonitor for now - it can be integrated into ClientEngine later
