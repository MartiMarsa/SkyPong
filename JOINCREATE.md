# Room Creation and Joining Flow Documentation

This document describes how rooms are created and joined for all game modes in the SkyPong 3D game.

## Overview

The game supports 5 distinct modes that require different room handling:

| Mode | Description | Room Type | Max Players |
|------|-------------|-----------|-------------|
| `ai-easy` | Single player vs Easy AI | `ai_game_room` | 1 |
| `ai-medium` | Single player vs Medium AI | `ai_game_room` | 1 |
| `ai-hard` | Single player vs Hard AI | `ai_game_room` | 1 |
| `2p-local` | Two players on same device | `game_room` | 1 (local split) |
| `2p-online` | Two players over network | `pvp_room` | 2 |

---

## 1. AI Mode (Single Player vs AI)

### Flow

```
StartPage.tsx:232
    ↓ handleModeSelect('ai-easy' | 'ai-medium' | 'ai-hard')
StartPage.tsx:248
    ↓ handleStartGame()
    ↓ navigate('/canvas', { state: { mode, player1Name, player1Color } })
CanvasPage.tsx
    ↓ receives state via useLocation()
Game.ts:50
    ↓ startGame(mode, player1Name, player1Color)
Game.ts:137
    ↓ client.create('ai_game_room', { 
          playerName, 
          playerColor, 
          difficulty: mode.replace('ai-', '') 
      })
AIGameRoom.ts:38
    ↓ onCreate(options)
    ↓ Extracts difficulty from options
AIGameRoom.ts:64
    ↓ Creates AI controller with specified difficulty
AIGameRoom.ts:302
    ↓ onJoin(client, options)
    ↓ Locks room, sets player1, gameStarted = true
```

### Key Code Points

**Client Side:**
- `/game/client/src_cli/game/Game.ts:137` - Creates AI room with difficulty
  ```typescript
  room = await client.create<GameState>(
      SERVER_CONNECTION.ROOMS.AI_GAME_ROOM, 
      { ...joinOptions, difficulty: this._mode.replace('ai-', '') }
  );
  ```

**Server Side:**
- `/game/server/src_serv/rooms/AIGameRoom.ts:38-42` - Extracts difficulty in onCreate
  ```typescript
  onCreate(options: any): void | Promise<any> {
      if (options.difficulty && Object.values(Difficulty).includes(options.difficulty)) {
          this.difficulty = options.difficulty;
      }
  }
  ```

- `/game/server/src_serv/rooms/AIGameRoom.ts:64-69` - Initializes AI with difficulty
  ```typescript
  this.aiController = new AIPaddleController(
      this.serverPaddle2,
      this.serverBall,
      this.physicsEngine,
      this.difficulty
  );
  ```

- `/game/server/src_serv/rooms/AIGameRoom.ts:315` - Locks room after player joins
  ```typescript
  this.lock(); // Lock room to prevent additional joins
  ```

### Parameters Passed

| Parameter | Type | Description |
|-----------|------|-------------|
| `playerName` | string | Display name for player |
| `playerColor` | string | Hex color for player's paddle |
| `difficulty` | 'easy' \| 'medium' \| 'hard' | AI difficulty level |

---

## 2. 2P Local Mode (Two Players on Same Device)

### Flow

```
StartPage.tsx:232
    ↓ handleModeSelect('2p-local')
User enters both player names and colors
StartPage.tsx:248
    ↓ handleStartGame()
    ↓ navigate('/canvas', { 
          state: { 
              mode: '2p-local', 
              player1Name, 
              player2Name, 
              player1Color, 
              player2Color 
          } 
      })
CanvasPage.tsx
    ↓ receives state
Game.ts:50
    ↓ startGame('2p-local', player1Name, player2Name, player1Color, player2Color)
Game.ts:135
    ↓ client.joinOrCreate('game_room', { 
          playerName, 
          player2Name, 
          playerColor, 
          player2Color 
      })
GameRoom.ts:30
    ↓ onCreate() initializes room
GameRoom.ts:312
    ↓ onJoin(client, options)
    ↓ If first player and options.player2Name exists:
       - Sets player2Id = "local_p2"
       - Sets player2Name and player2Color from options
       - gameStarted = true immediately
```

### Key Code Points

**Client Side:**
- `/game/client/src_cli/game/Game.ts:135` - Joins or creates local 2P room
  ```typescript
  room = await client.joinOrCreate<GameState>(
      SERVER_CONNECTION.ROOMS.GAME_ROOM, 
      joinOptions
  );
  ```

**Server Side:**
- `/game/server/src_serv/rooms/GameRoom.ts:314` - Detects local 2P mode
  ```typescript
  const isLocal2P = options.player2Name && options.player2Name !== '';
  ```

- `/game/server/src_serv/rooms/GameRoom.ts:325-330` - Sets up local player 2
  ```typescript
  if (isLocal2P) {
      this.state.player2Id = "local_p2";
      this.state.player2Name = options.player2Name;
      this.state.player2Color = options.player2Color || "#F6511D";
      this.state.gameStarted = true;
  }
  ```

### Parameters Passed

| Parameter | Type | Description |
|-----------|------|-------------|
| `playerName` | string | Player 1 display name |
| `player2Name` | string | Player 2 display name |
| `playerColor` | string | Player 1 paddle color |
| `player2Color` | string | Player 2 paddle color |

---

## 3. 2P Online - Create Room

### Flow

```
StartPage.tsx:232
    ↓ handleModeSelect('2p-online')
User enters name and selects color
StartPage.tsx:258
    ↓ handleEnterLobby()
Lobby displays available rooms
StartPage.tsx:261
    ↓ handleCreateRoom()
    ↓ navigate('/canvas', { 
          state: { 
              mode: '2p-online', 
              player1Name, 
              player1Color, 
              pvpAction: 'create' 
          } 
      })
CanvasPage.tsx
    ↓ receives state
Game.ts:50
    ↓ startGame('2p-online', ..., pvpAction: 'create')
Game.ts:132
    ↓ client.create('pvp_room', { playerName, playerColor })
PvpRoom.ts:41
    ↓ onCreate(options)
    ↓ Sets metadata for lobby listing
    ↓ Starts 2-minute expiration timer
PvpRoom.ts:340
    ↓ onJoin(client, options)
    ↓ Player 1 joins
    ↓ Sets metadata: waitingForOpponent: true
    ↓ Game does NOT start yet (waits for player 2)
```

### Key Code Points

**Client Side:**
- `/game/client/src_cli/components/pages/StartPage.tsx:261-271` - Creates PvP room
  ```typescript
  const handleCreateRoom = () => {
      navigate('/canvas', {
          state: {
              mode: '2p-online',
              player1Name: player1Name.trim() || 'Player 1',
              player2Name: '',
              player1Color,
              pvpAction: 'create',
          }
      });
  };
  ```

- `/game/client/src_cli/game/Game.ts:132` - Creates room
  ```typescript
  room = await client.create<GameState>(
      SERVER_CONNECTION.ROOMS.PVP_ROOM, 
      { playerName: player1Name, playerColor: player1Color }
  );
  ```

**Server Side:**
- `/game/server/src_serv/rooms/PvpRoom.ts:67-71` - Sets room metadata
  ```typescript
  this.setMetadata({
      player1Name: options.playerName || "Player 1",
      player1Color: options.playerColor || "#00A6ED",
      waitingForOpponent: true,
  });
  ```

- `/game/server/src_serv/rooms/PvpRoom.ts:74-88` - Starts expiration timer
  ```typescript
  this.expirationTimer = setTimeout(() => {
      if (!this.player2Client) {
          // Notify player 1 and disconnect
      }
  }, ROOM_EXPIRATION_MS); // 2 minutes
  ```

- `/game/server/src_serv/rooms/PvpRoom.ts:340-354` - Player 1 joins
  ```typescript
  onJoin(client: Client, options: any): void | Promise<any> {
      this.player1Client = client;
      this.state.player1Id = client.sessionId;
      this.state.player1Name = options.playerName || "Player 1";
      this.state.player1Color = options.playerColor || "#00A6ED";
      // Game does NOT start yet - waits for player 2
  }
  ```

### Parameters Passed

| Parameter | Type | Description |
|-----------|------|-------------|
| `playerName` | string | Player 1 (host) display name |
| `playerColor` | string | Player 1 paddle color |
| `pvpAction` | 'create' | Indicates room creation (client-side only) |

---

## 4. 2P Online - Join Existing Room

### Flow

```
StartPage.tsx:206
    ↓ fetchRooms() polls available rooms every 3 seconds
User sees room list with player1Name, player1Color
StartPage.tsx:274
    ↓ handleJoinRoom(roomId)
    ↓ navigate('/canvas', { 
          state: { 
              mode: '2p-online', 
              player1Name, 
              player1Color, 
              pvpRoomId, 
              pvpAction: 'join' 
          } 
      })
CanvasPage.tsx
    ↓ receives state
Game.ts:50
    ↓ startGame('2p-online', ..., pvpRoomId, pvpAction: 'join')
Game.ts:130
    ↓ client.joinById(pvpRoomId, { playerName, playerColor })
PvpRoom.ts:354
    ↓ onJoin(client, options) → Player 2 joins
    ↓ Clears expiration timer
    ↓ Locks room
    ↓ Updates metadata: waitingForOpponent: false
    ↓ Game does NOT start yet (waits for both ready)
Game.ts:226
    ↓ client sends 'client_ready' message
PvpRoom.ts:105
    ↓ onMessage('client_ready')
    ↓ Marks player as ready
    ↓ If both players ready: gameStarted = true
```

### Key Code Points

**Client Side:**
- `/game/client/src_cli/components/pages/StartPage.tsx:206-217` - Fetches available rooms
  ```typescript
  const fetchRooms = useCallback(async () => {
      const client = getClient();
      const rooms = await client.getAvailableRooms(SERVER_CONNECTION.ROOMS.PVP_ROOM);
      const openRooms = rooms.filter((r: any) => 
          r.metadata?.waitingForOpponent && r.clients < 2
      );
      setAvailableRooms(openRooms);
  }, [getClient]);
  ```

- `/game/client/src_cli/components/pages/StartPage.tsx:274-285` - Joins specific room
  ```typescript
  const handleJoinRoom = (roomId: string) => {
      navigate('/canvas', {
          state: {
              mode: '2p-online',
              player1Name: player1Name.trim() || 'Player 1',
              player1Color,
              pvpRoomId: roomId,
              pvpAction: 'join',
          }
      });
  };
  ```

- `/game/client/src_cli/game/Game.ts:130` - Joins by room ID
  ```typescript
  room = await client.joinById<GameState>(
      this._pvpRoomId, 
      { playerName: player1Name, playerColor: player1Color }
  );
  ```

- `/game/client/src_cli/game/Game.ts:226-228` - Signals ready
  ```typescript
  if (this._mode === '2p-online') {
      room.send('client_ready', {});
  }
  ```

**Server Side:**
- `/game/server/src_serv/rooms/PvpRoom.ts:354-381` - Player 2 joins
  ```typescript
  onJoin(client: Client, options: any): void | Promise<any> {
      this.player2Client = client;
      this.state.player2Id = client.sessionId;
      this.state.player2Name = options.playerName || "Player 2";
      this.state.player2Color = options.playerColor || "#F6511D";
      
      // Cancel expiration timer
      if (this.expirationTimer) {
          clearTimeout(this.expirationTimer);
          this.expirationTimer = null;
      }
      
      // Lock room
      this.lock();
      
      // Update metadata
      this.setMetadata({
          waitingForOpponent: false,
      });
      
      // Don't start yet - wait for both clients ready
  }
  ```

- `/game/server/src_serv/rooms/PvpRoom.ts:105-120` - Handles ready signal
  ```typescript
  this.onMessage("client_ready", (client, data) => {
      // Mark appropriate player as ready
      if (client.sessionId === this.player1Client?.sessionId) {
          this.state.player1Ready = true;
      } else if (client.sessionId === this.player2Client?.sessionId) {
          this.state.player2Ready = true;
      }
      
      // Check if both ready
      if (this.state.player1Ready && this.state.player2Ready && !this.state.gameStarted) {
          this.state.gameStarted = true;
      }
  });
  ```

### Parameters Passed

| Parameter | Type | Description |
|-----------|------|-------------|
| `playerName` | string | Player 2 (joiner) display name |
| `playerColor` | string | Player 2 paddle color |
| `pvpRoomId` | string | ID of room to join (client-side) |
| `pvpAction` | 'join' | Indicates joining (client-side) |

---

## 5. Room Expiration (Edge Case)

If player 2 never joins within 2 minutes, the room expires.

### Flow

```
Room created, player1 waiting
↓
2 minutes pass without player2 joining
↓
PvpRoom.ts:74
    ↓ expiration timer fires
PvpRoom.ts:79
    ↓ player1Client.send('room_expired', {...})
Game.ts:190
    ↓ room.onMessage('room_expired')
    ↓ alert('Room expired — no opponent joined within 2 minutes.')
    ↓ onBackToMenu()
```

### Key Code Points

- `/game/server/src_serv/rooms/PvpRoom.ts:74-88` - Expiration logic
  ```typescript
  this.expirationTimer = setTimeout(() => {
      if (!this.player2Client) {
          Logger.info(`[PvP] Room expired`);
          if (this.player1Client) {
              this.player1Client.send("room_expired", {
                  message: "No opponent joined. Returning to menu.",
              });
          }
          setTimeout(() => {
              this.disconnect().catch(() => {});
          }, 500);
      }
  }, ROOM_EXPIRATION_MS);
  ```

- `/game/client/src_cli/game/Game.ts:190-195` - Client handles expiration
  ```typescript
  room.onMessage('room_expired', () => {
      if (this._onBackToMenu) {
          alert('Room expired — no opponent joined within 2 minutes.');
          this._onBackToMenu();
      }
  });
  ```

---

## 6. Complete Data Flow: UI to Server

This section describes the complete path data takes from user interaction to server room creation.

### Flow Overview

```
User clicks button (StartPage.tsx)
    ↓
React Router navigate() with state
    ↓
CanvasPage.tsx receives via useLocation()
    ↓
Calls Game.startGame() with parameters
    ↓
Game.ts constructs joinOptions
    ↓
Colyseus client method sends WebSocket message
    ↓
Server room onCreate()/onJoin() receives options
```

### Step-by-Step Breakdown

#### Step 1: StartPage.tsx - Data Collection & Packaging

**AI Mode (Lines 248-254):**
```typescript
const handleStartGame = () => {
    const p1Name = player1Name.trim() || 'Player 1';
    const p2Name = 'AI';  // Hardcoded for AI modes
    const state: any = { 
        mode: selectedMode,           // 'ai-easy', 'ai-medium', 'ai-hard'
        player1Name: p1Name, 
        player2Name: p2Name, 
        player1Color 
    };
    navigate('/canvas', { state });
};
```

**PvP Create Room (Lines 259-269):**
```typescript
const handleCreateRoom = () => {
    navigate('/canvas', {
        state: {
            mode: '2p-online',
            player1Name: player1Name.trim() || 'Player 1',
            player2Name: '',
            player1Color,
            pvpAction: 'create',          // Signals Game.ts to create new room
        }
    });
};
```

**PvP Join Room (Lines 271-282):**
```typescript
const handleJoinRoom = (roomId: string) => {
    navigate('/canvas', {
        state: {
            mode: '2p-online',
            player1Name: player1Name.trim() || 'Player 1',
            player2Name: '',
            player1Color,
            pvpRoomId: roomId,            // Specific room to join
            pvpAction: 'join',            // Signals Game.ts to join existing room
        }
    });
};
```

#### Step 2: React Router - State Transfer

State is passed via React Router's `navigate()` and received by CanvasPage.tsx using `useLocation()`:

```typescript
// In CanvasPage.tsx
const location = useLocation();
const { 
    mode, 
    player1Name, 
    player2Name, 
    player1Color, 
    player2Color,
    pvpRoomId,
    pvpAction 
} = location.state || {};
```

#### Step 3: CanvasPage.tsx - Calls Game.startGame()

CanvasPage extracts state and passes to Game class:

```typescript
startGame(
    canvas,
    location.state.mode,
    location.state.player1Name,
    location.state.player2Name,
    location.state.player1Color,
    location.state.player2Color,
    onGameReady,
    onBackToMenu,
    location.state.pvpRoomId,      // Only for PvP join
    location.state.pvpAction       // 'create' or 'join' for PvP
);
```

#### Step 4: Game.ts - Server Connection

**This is where data is actually sent to the server.**

**Common joinOptions construction (Lines 122-126):**
```typescript
const joinOptions = {
    playerName: player1Name,        // Always sent
    player2Name: player2Name,       // Only populated for 2p-local
    playerColor: player1Color,      // Always sent
};
```

**PvP Online Mode (Lines 128-133):**
```typescript
if (this._mode === '2p-online') {
    if (this._pvpAction === 'join' && this._pvpRoomId) {
        // Join existing room by ID
        room = await client.joinById<GameState>(
            this._pvpRoomId,          // Room ID from URL/state
            { 
                playerName: player1Name,    // ← Sent to server
                playerColor: player1Color   // ← Sent to server
            }
        );
    } else {
        // Create new room
        room = await client.create<GameState>(
            SERVER_CONNECTION.ROOMS.PVP_ROOM,  // 'pvp_room'
            { 
                playerName: player1Name,    // ← Sent to server
                playerColor: player1Color   // ← Sent to server
            }
        );
    }
}
```

**2P Local Mode (Lines 134-135):**
```typescript
else if (this._mode === '2p-local') {
    room = await client.joinOrCreate<GameState>(
        SERVER_CONNECTION.ROOMS.GAME_ROOM,  // 'game_room'
        joinOptions  // ← {playerName, player2Name, playerColor}
    );
}
```

**AI Mode (Lines 136-137):**
```typescript
else if (this._mode.startsWith('ai-')) {
    room = await client.create<GameState>(
        SERVER_CONNECTION.ROOMS.AI_GAME_ROOM,  // 'ai_game_room'
        { 
            ...joinOptions,              // playerName, playerColor
            difficulty: this._mode.replace('ai-', '')  // 'easy'/'medium'/'hard'
        }
    );
}
```

### What Gets Sent to Server

| Mode | Method | Room Type | Data Payload |
|------|--------|-----------|--------------|
| AI Easy | `client.create()` | `ai_game_room` | `{playerName, playerColor, difficulty: 'easy'}` |
| AI Medium | `client.create()` | `ai_game_room` | `{playerName, playerColor, difficulty: 'medium'}` |
| AI Hard | `client.create()` | `ai_game_room` | `{playerName, playerColor, difficulty: 'hard'}` |
| 2P Local | `client.joinOrCreate()` | `game_room` | `{playerName, player2Name, playerColor, player2Color}` |
| PvP Create | `client.create()` | `pvp_room` | `{playerName, playerColor}` |
| PvP Join | `client.joinById(roomId)` | `pvp_room` | `{playerName, playerColor}` |

### Server-Side Reception

The data arrives in the server's room handlers:

- **AIGameRoom.ts** `onCreate(options)` / `onJoin(client, options)` - Line 38/302
- **GameRoom.ts** `onCreate(options)` / `onJoin(client, options)` - Line 30/312
- **PvpRoom.ts** `onCreate(options)` / `onJoin(client, options)` - Line 41/340

---

## Summary: All Entry Points

| Action | Client File | Function/Line | Server File | Function/Line |
|--------|-------------|---------------|-------------|---------------|
| **AI Create** | `Game.ts` | `client.create()` at line 137 | `AIGameRoom.ts` | `onCreate()` at line 38 |
| **2P Local Join/Create** | `Game.ts` | `client.joinOrCreate()` at line 135 | `GameRoom.ts` | `onCreate()` at line 30 + `onJoin()` at line 312 |
| **PvP Create** | `Game.ts` | `client.create()` at line 132 | `PvpRoom.ts` | `onCreate()` at line 41 |
| **PvP Join** | `Game.ts` | `client.joinById()` at line 130 | `PvpRoom.ts` | `onJoin()` at line 354 |
| **Signal Ready (PvP)** | `Game.ts` | `room.send('client_ready')` at line 227 | `PvpRoom.ts` | `onMessage('client_ready')` at line 105 |

---

## Configuration Parameters Reference

### Client-to-Server Parameters

| Mode | Parameters | File | Line |
|------|------------|------|------|
| AI Easy | `{ playerName, playerColor, difficulty: 'easy' }` | `Game.ts` | 137 |
| AI Medium | `{ playerName, playerColor, difficulty: 'medium' }` | `Game.ts` | 137 |
| AI Hard | `{ playerName, playerColor, difficulty: 'hard' }` | `Game.ts` | 137 |
| 2P Local | `{ playerName, player2Name, playerColor, player2Color }` | `Game.ts` | 135 |
| PvP Create | `{ playerName, playerColor }` | `Game.ts` | 132 |
| PvP Join | `{ playerName, playerColor }` | `Game.ts` | 130 |

### Client Navigation State

All modes pass configuration through React Router state:

```typescript
// AI Mode
{ mode: 'ai-easy' | 'ai-medium' | 'ai-hard', player1Name, player1Color }

// 2P Local
{ mode: '2p-local', player1Name, player2Name, player1Color, player2Color }

// PvP Create
{ mode: '2p-online', player1Name, player1Color, pvpAction: 'create' }

// PvP Join
{ mode: '2p-online', player1Name, player1Color, pvpRoomId, pvpAction: 'join' }
```

---

## Room Types Configuration

Defined in `/game/server/src_serv/index.ts`:

```typescript
gameServer.define("game_room", GameRoom);       // Local 2-player
gameServer.define("ai_game_room", AIGameRoom);  // Single-player vs AI
gameServer.define("pvp_room", PvpRoom)          // Online PvP
    .enableRealtimeListing();                   // Enable room listing for lobby
```

And in `/game/client/src_cli/config/ServerConnectionConfig.ts`:

```typescript
ROOMS: {
    GAME_ROOM: 'game_room',
    AI_GAME_ROOM: 'ai_game_room',
    PVP_ROOM: 'pvp_room',
}
```
