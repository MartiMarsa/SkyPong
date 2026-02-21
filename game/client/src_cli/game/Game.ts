import {
    Scene,
    Vector3,
    Observer,
    Color3,
} from "@babylonjs/core";
import * as Colyseus from "colyseus.js";
import { InputController } from "../input/InputController";
import { ClientBall } from "../entities/ClientBall";
import { ClientTable } from "../entities/ClientTable";
import { ClientPaddle } from "../entities/ClientPaddle";
import { SceneLights } from "../rendering/SceneLights";
import { DebugMonitor } from "../utils/DebugMonitor";
import { EngineSetup } from "../rendering/EngineSetup";
import { GMCN, INTERPOLATION, NETWORK } from '@skypong/common/constants';
import { GameUIManager } from '../ui/GameUIManager';
import { SERVER_CONNECTION, VISUAL, CLIENT_TIMING, RENDERING, CAMERA } from '../config';
import { adjustCamera } from '../utils/Camera';

interface GameState {
    ball: any; paddle: any; paddle2: any;
    player1Id: string; player2Id: string;
    player1Name: string; player2Name: string;
    player1Color: string; player2Color: string;
    player1Score: number; player2Score: number;
    winningScore: number;
    winner: string; gameOver: boolean; gameStarted: boolean;
}

// Module-level lock to prevent duplicate game instances (React StrictMode)
let gameInstanceLock = false;

export class Game {
    private _engineSetup: EngineSetup | null = null;
    private _debugMonitor: DebugMonitor | null = null;
    private _input: InputController | null = null;
    private _room: Colyseus.Room<GameState> | null = null;
    private _renderObserver: Observer<Scene> | null = null;
    private _renderObservable: any = null;
    private _mode: string = '2p-local';
    private _onGameReady: ((onLaunch: () => void, isWaitingForOpponent?: boolean) => void) | null = null;
    private _onBackToMenu: (() => void) | null = null;
    private _gui: GameUIManager | null = null;
    private _isGameOver: boolean = false;
    private _intervals: number[] = [];
    private _isPlayer2: boolean = false;
    private _pvpRoomId: string | undefined = undefined;
    private _pvpAction: 'create' | 'join' | undefined = undefined;

    startGame = (
        canvas: HTMLCanvasElement,
        mode = '2p-local',
        player1Name = 'Player 1',
        player2Name = 'Player 2',
        player1Color = '#00A6ED',
        player2Color = '#F6511D',
        onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void,
        onBackToMenu?: () => void,
        pvpRoomId?: string,
        pvpAction?: 'create' | 'join',
        scoreToWin: number = 5,
        playerId?: string,
    ) => {
        if (gameInstanceLock) return null;
        gameInstanceLock = true;

        this._mode = mode;
        this._onGameReady = onGameReady || null;
        this._onBackToMenu = onBackToMenu || null;
        this._pvpRoomId = pvpRoomId;
        this._pvpAction = pvpAction;
        const engineSetup = new EngineSetup(canvas);
        this._engineSetup = engineSetup;
        const engine = engineSetup.engine;

        const client = new Colyseus.Client(SERVER_CONNECTION.WS_URL);
        let activeScene: Scene | null = null;

        const createScene = async () => {
            const scene = engineSetup.scene;
            engineSetup.camera.setTarget(Vector3.Zero());

            const shadowGenerator = SceneLights.Create(scene);

            const ball = new ClientBall(scene);
            const table = new ClientTable(scene);

            const skybox = scene.getMeshByName("hdrSkyBox");
            const refractionRenderList = skybox ? [table.mesh, skybox, ball.mesh] : [table.mesh];

            const createPaddle = (name: string) => new ClientPaddle(scene, {
                name, materialKey: "CLEARGLASS",
                albedoColor: new Color3(0.5, 0.5, 0.5),
                tintColor: new Color3(0.5, 0.5, 0.5),
                refractionRenderList,
            });
            const paddle = createPaddle("paddle1");
            const paddle2 = createPaddle("paddle2");

            const debugMonitor = new DebugMonitor();
            this._debugMonitor = debugMonitor;

            // Create Babylon.js GUI for in-game UI
            const gui = new GameUIManager(scene, () => {
                if (this._onBackToMenu) {
                    this._onBackToMenu();
                }
            });
            this._gui = gui;
            // For PvP modes, show "Waiting..." for Player 2 until they join
            const isPvPMode = this._mode === '2p-local' || this._mode === '2p-online';
            const initialPlayer2Name = isPvPMode ? 'Waiting...' : player2Name;
            gui.showGameHUD(player1Name, initialPlayer2Name);

            shadowGenerator.addShadowCaster(ball.mesh);
            engineSetup.setResizeTarget(table.mesh);

            [table.mesh, ball.mesh, paddle.mesh, paddle2.mesh].forEach(m => {
                m.renderingGroupId = RENDERING.RENDERING_GROUPS.GAME_OBJECTS;
            });

            try {
                let room: Colyseus.Room<GameState>;
                const joinOptions = {
                    playerName: player1Name,
                    player2Name: player2Name,
                    playerColor: player1Color,
                    scoreToWin,
                    playerId,
                };

                if (this._mode === '2p-online') {
                    if (this._pvpAction === 'join' && this._pvpRoomId) {
                        room = await client.joinById<GameState>(this._pvpRoomId, { playerName: player1Name, playerColor: player1Color, scoreToWin, playerId });
                    } else {
                        room = await client.create<GameState>(SERVER_CONNECTION.ROOMS.PVP_ROOM, { playerName: player1Name, playerColor: player1Color, scoreToWin, playerId });
                    }
                } else if (this._mode === '2p-local') {
                    room = await client.joinOrCreate<GameState>(SERVER_CONNECTION.ROOMS.GAME_ROOM, { playerName: player1Name, playerColor: player1Color, scoreToWin, playerId });
                } else if (this._mode.startsWith('ai-')) {
                    room = await client.create<GameState>(SERVER_CONNECTION.ROOMS.AI_GAME_ROOM, { ...joinOptions, difficulty: this._mode.replace('ai-', '') });
                } else {
                    room = await client.create<GameState>(SERVER_CONNECTION.ROOMS.AI_GAME_ROOM, { ...joinOptions, difficulty: 'easy' });
                }

                this._room = room;

                let cameraSetupComplete = false;

                const checkPlayerAssignment = () => {
                    if (cameraSetupComplete) return;
                    
                    const cam = engineSetup.camera;
                    const mesh = table.mesh;
                    const center = mesh.getBoundingInfo().boundingBox.centerWorld;
                    
                    this._isPlayer2 = room.sessionId === room.state.player2Id;
                    engineSetup.setIsPlayer2(this._isPlayer2);
                    adjustCamera(cam, mesh, engineSetup.engine);
                    
                    if (this._isPlayer2) {
                        cam.position = new Vector3(cam.position.x, cam.position.y, -cam.position.z);
                    }
                    cam.setTarget(center);
                    cameraSetupComplete = true;
                };

                const updatePlayerColorsFromState = () => {
                    if (!room.state || !this._gui) return;
                    
                    const p1Color = room.state.player1Color || '#00A6ED';
                    const p2Color = room.state.player2Color || '#F6511D';
                    const isPlayer2 = room.sessionId === room.state.player2Id;
                    
                    this._gui.hud.updatePlayerColors(isPlayer2 ? p2Color : p1Color, isPlayer2 ? p1Color : p2Color);
                    
                    [paddle, paddle2].forEach((p, i) => {
                        const color = i === 0 ? p1Color : p2Color;
                        const mat = p.mesh.material as any;
                        if (mat?.albedoColor) mat.albedoColor = Color3.FromHexString(color);
                        if (mat?.tintColor) mat.tintColor = Color3.FromHexString(color);
                    });
                };

                if (room.state.player1Id || room.state.player2Id) checkPlayerAssignment();
                ['player2Id', 'player1Id'].forEach(prop =>
                    (room.state as any).listen(prop, checkPlayerAssignment)
                );
                ['player1Color', 'player2Color'].forEach(prop =>
                    (room.state as any).listen(prop, updatePlayerColorsFromState)
                );

                // Handle room expiration
                room.onMessage('room_expired', () => {
                    if (this._onBackToMenu) {
                        alert('Room expired — no opponent joined within 2 minutes.');
                        this._onBackToMenu();
                    }
                });

                // For PvP modes, update HUD with actual player names from server state
                    // and wait for second player before starting countdown
                    const isPvPMode = this._mode === '2p-local' || this._mode === '2p-online';
                    if (isPvPMode) {
                        // Update HUD with actual names and colors from server
                        if (this._gui && room.state) {
                            const p1Name = room.state.player1Name || player1Name;
                            const p2Name = room.state.player2Name || 'Waiting...';
                            let bottomLabel = p1Name;
                            let topLabel = p2Name;
                            
                            // Mark "You" player
                            if (room.sessionId === room.state.player2Id) {
                                bottomLabel = p2Name ? `${p2Name} (You)` : 'Waiting...';
                                topLabel = p1Name;
                            }
                            
                            this._gui.hud.updatePlayerNames(bottomLabel, topLabel);
                            
                            // Apply colors from state (this will be called again when colors change via listeners)
                            updatePlayerColorsFromState();
                        }

                        // Store the countdown callback to call when both are ready
                        let countdownCallback: (() => void) | null = null;
                        
                        // Callback for when both clients/network are ready, before countdown
                        const signalGameReady = () => {
                            // For online PvP, send "client_ready" message to server
                            if (this._mode === '2p-online') {
                                room.send('client_ready', {});
                            }
                            
                            // Check if game has already started
                            if (room.state?.gameStarted) {
                                // Both clients are ready, fade out and start countdown
                                if (this._onGameReady) {
                                    const callback = this._onGameReady;
                                    this._onGameReady = null;
                                    callback(() => this._startCountdown(room), false);
                                } else {
                                    this._startCountdown(room);
                                }
                            } else {
                                // Signal that we're waiting for opponent
                                if (this._onGameReady) {
                                    countdownCallback = () => this._startCountdown(room);
                                    this._onGameReady(countdownCallback, true);
                                }
                            }
                        };

                        // For online PvP, signal ready immediately after assets load
                        if (this._mode === '2p-online') {
                            setTimeout(() => signalGameReady(), 100);
                        } else {
                            // For 2p-local, show waiting message
                            if (this._gui) {
                                this._gui.hud.updateCountdown('Waiting for opponent...');
                            }
                        }
                        
                        // Listen for gameStarted to become true (when both clients are ready)
                        (room.state as any).listen('gameStarted', (value: boolean) => {
                            if (value && countdownCallback && this._onGameReady) {
                                // Both clients are ready, fade out and start countdown
                                const callback = this._onGameReady;
                                this._onGameReady = null;
                                callback(countdownCallback, false);
                            }
                        });
                        
                        // Check initial state in case gameStarted is already true
                        if (room.state?.gameStarted && countdownCallback && this._onGameReady) {
                            const callback = this._onGameReady;
                            this._onGameReady = null;
                            callback(countdownCallback, false);
                        }
                    // Update Player 2's name when they join
                    (room.state as any).listen('player2Name', (value: string) => {
                        if (value && this._gui) {
                            let bottomLabel = room.state.player1Name;
                            let topLabel = value;
                            if (room.sessionId === room.state.player1Id) {
                                bottomLabel = `${room.state.player1Name} (You)`;
                                topLabel = value;
                            } else if (room.sessionId === room.state.player2Id) {
                                bottomLabel = `${value} (You)`;
                                topLabel = room.state.player1Name;
                            }
                            this._gui.hud.updatePlayerNames(bottomLabel, topLabel);
                        }
                    });
                } else {
                    if (this._gui && room.state) {
                        const p1Color = room.state.player1Color || player1Color;
                        const p2Color = room.state.player2Color || player2Color;
                        this._gui.hud.updatePlayerColors(p1Color, p2Color);
                        
                        [paddle, paddle2].forEach((p, i) => {
                            const color = i === 0 ? p1Color : p2Color;
                            const mat = p.mesh.material as any;
                            if (mat?.albedoColor) mat.albedoColor = Color3.FromHexString(color);
                        });
                    }
                    
                    const signalGameReady = () => {
                        if (this._onGameReady) {
                            const cb = this._onGameReady;
                            this._onGameReady = null;
                            cb(() => this._startCountdown(room));
                        } else {
                            this._startCountdown(room);
                        }
                    };
                    room.state ? setTimeout(signalGameReady, 100) :
                        room.onStateChange.once(() => setTimeout(signalGameReady, 100));
                }


                const targetPosition = new Vector3(0, 0, 0);
                let lastBallPosition = ball.mesh.position.clone();
                let lastSpeedSampleAt = performance.now();
                let speedUpdateCounter = 0;

                room.state.ball.onChange(() => {
                    targetPosition.set(
                        room.state.ball.x,
                        room.state.ball.y,
                        room.state.ball.z,
                    );
                });

                let lastCollisionAt = 0;

                room.state.ball.listen("collisionCount", (currentVal: number, prevVal: number) => {
                    ball.triggerBounce(
                        room.state.ball.lastImpactX,
                        room.state.ball.lastImpactZ,
                        room.state.ball.collisionTime
                    );
                    lastCollisionAt = performance.now();
                });

                const targetPaddlePosition = new Vector3(0, 0, 0);
                const targetPaddle2Position = new Vector3(0, 0, 0);

                room.state.paddle.onChange(() => {
                    targetPaddlePosition.set(
                        room.state.paddle.x,
                        paddle.mesh.position.y,
                        room.state.paddle.z,
                    );
                });

                room.state.paddle2.onChange(() => {
                    targetPaddle2Position.set(
                        room.state.paddle2.x,
                        paddle2.mesh.position.y,
                        room.state.paddle2.z,
                    );
                });

                (room.state as any).listen('player1Score', (value: number) =>
                    this._gui?.hud.updateScores(value, room.state.player2Score));
                (room.state as any).listen('player2Score', (value: number) =>
                    this._gui?.hud.updateScores(room.state.player1Score, value));

                (room.state as any).listen('gameOver', (value: boolean) => {
                    if (value && !this._isGameOver && this._gui) {
                        this._isGameOver = true;
                        const isP1Winner = room.state.winner === room.state.player1Id;
                        this._gui.gameOverOverlay.show(
                            isP1Winner ? room.state.player1Name : room.state.player2Name,
                            isP1Winner, room.state.player1Score, room.state.player2Score,
                            room.state.player1Name, room.state.player2Name
                        );
                    }
                });

                const input = new InputController(scene);
                this._input = input;

                let speed = 0;
                let inputSendCounter = 0;

                this._renderObservable = scene.onBeforeRenderObservable;
                this._renderObserver = this._renderObservable.add(() => {
                    const deltaTime = engine.getDeltaTime();
                    const collisionDetected = performance.now() - lastCollisionAt < CLIENT_TIMING.COLLISION.WINDOW_MS;
                    const now = performance.now();

                    if (++speedUpdateCounter >= NETWORK.SYNC.SPEED_UPDATE_INTERVAL_FRAMES) {
                        const elapsed = (now - lastSpeedSampleAt) / 1000;
                        speed = elapsed > 0 ? Vector3.Distance(ball.mesh.position, lastBallPosition) / elapsed : 0;
                        lastBallPosition.copyFrom(ball.mesh.position);
                        lastSpeedSampleAt = now;
                        speedUpdateCounter = 0;
                    }

                    const ballSmoothingSpeed = collisionDetected ? INTERPOLATION.COLLISION_SPEED : INTERPOLATION.DEFAULT_SPEED;
                    const paddleSmoothingSpeed = VISUAL.SMOOTHING.PADDLE_LERP_SPEED;

                    const ballLerpFactor = 1 - Math.exp(-ballSmoothingSpeed * (deltaTime / 1000));
                    const paddleLerpFactor = 1 - Math.exp(-paddleSmoothingSpeed * (deltaTime / 1000));

                    ball.update(targetPosition, ballLerpFactor, room.state.ball.enabled, deltaTime);
                    paddle.update(targetPaddlePosition, paddleLerpFactor, room.state.paddle.enabled);
                    paddle2.update(targetPaddle2Position, paddleLerpFactor, room.state.paddle2.enabled);
                    debugMonitor.update(
                        ball.mesh.position,
                        engineSetup.camera.position,
                        room.state.ball.enabled,
                        collisionDetected,
                        speed,
                    );

                    if (++inputSendCounter >= NETWORK.SYNC.INPUT_SEND_INTERVAL_FRAMES && !this._isGameOver) {
                        room.send('input', this._mode === '2p-online'
                            ? { a: !!input.inputMap['a'], d: !!input.inputMap['d'] }
                            : input.inputMap);
                        inputSendCounter = 0;
                    }
                });
            } catch (e) {
                console.error("Join error", e);
                alert('Failed to connect to game server. Please try again.');
                if (this._onBackToMenu) {
                    this._onBackToMenu();
                }
            }

            return scene;
        };

        createScene().then((scene) => {
            activeScene = scene;
            if (this._room) engine.runRenderLoop(() => scene.render());
        });

        let isDisposed = false;
        return () => {
            if (isDisposed) return;
            isDisposed = true;
            this._cleanup();
            engine.stopRenderLoop();
            activeScene?.dispose();
            engine.dispose();
            gameInstanceLock = false;
        };
    };

    private _cleanup(): void {
        this._intervals.forEach(id => clearInterval(id));
        this._intervals = [];
        this._room?.leave();
        this._room?.removeAllListeners();
        this._room = null;
        this._renderObserver && this._renderObservable?.remove(this._renderObserver);
        this._renderObserver = null;
        this._renderObservable = null;
        this._input?.dispose();
        this._input = null;
        this._debugMonitor?.dispose();
        this._debugMonitor = null;
        this._engineSetup?.dispose();
        this._engineSetup = null;
        this._gui?.dispose();
        this._gui = null;
    }

    private _startCountdown(room: Colyseus.Room<GameState>): void {
        let currentCount = CLIENT_TIMING.COUNTDOWN.DURATION_SECONDS;

        if (this._gui) {
            this._gui.hud.updateCountdown(currentCount.toString());
        }

        const countdownInterval = window.setInterval(() => {
            currentCount--;

            if (currentCount > 0) {
                if (this._gui) {
                    this._gui.hud.updateCountdown(currentCount.toString());
                }
            } else {
                clearInterval(countdownInterval);
                const idx = this._intervals.indexOf(countdownInterval);
                if (idx > -1) this._intervals.splice(idx, 1);
                if (this._gui) {
                    this._gui.hud.updateCountdown('');
                }
                room.send('launch', {});
            }
        }, CLIENT_TIMING.COUNTDOWN.INTERVAL_MS);
        this._intervals.push(countdownInterval);
    }
}

export const startGame = (
    canvas: HTMLCanvasElement,
    mode: string = '2p-local',
    player1Name: string = 'Player 1',
    player2Name: string = 'Player 2',
    player1Color: string = '#00A6ED',
    player2Color: string = '#F6511D',
    onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void,
    onBackToMenu?: () => void,
    pvpRoomId?: string,
    pvpAction?: 'create' | 'join',
    scoreToWin: number = 5,
    playerId?: string,
) => {
    const game = new Game();
    return game.startGame(canvas, mode, player1Name, player2Name, player1Color, player2Color, onGameReady, onBackToMenu, pvpRoomId, pvpAction, scoreToWin, playerId);
};
