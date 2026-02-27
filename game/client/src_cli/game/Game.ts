import {
    Scene,
    Vector3,
    Observer,
    Color3,
} from "@babylonjs/core";
import { InputController } from "../input/InputController";
import { DebugMonitor } from "../utils/DebugMonitor";
import { ClientEngine } from "./ClientEngine";
import { RoomManager } from "./RoomManager";
import { GameLoop } from "./GameLoop";
import { CountdownManager } from "./CountdownManager";
import { adjustCamera } from '../utils/Camera';
import { GameSessionConfig } from '../types/GameSessionConfig';

// Module-level lock to prevent duplicate game instances (React StrictMode)
let gameInstanceLock = false;

export class Game {
    private _debugMonitor: DebugMonitor | null = null;
    private _input: InputController | null = null;
    private _room: any = null;
    private _renderObserver: Observer<Scene> | null = null;
    private _renderObservable: any = null;
    private _config: GameSessionConfig | null = null;
    private _onGameReady: ((onLaunch: () => void, isWaitingForOpponent?: boolean) => void) | null = null;
    private _onBackToMenu: (() => void) | null = null;
    private _gui: any = null;
    private _isGameOver: boolean = false;
    private _intervals: number[] = [];
    private _isPlayer2: boolean = false;
    private _clientEngine: ClientEngine | null = null;
    private _roomManager: RoomManager | null = null;
    private _gameLoop: GameLoop | null = null;
    private _countdownManager: CountdownManager | null = null;

    startGame = (
        canvas: HTMLCanvasElement,
        config: GameSessionConfig,
        onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void,
        onBackToMenu?: () => void,
    ) => {
        if (gameInstanceLock) return null;
        gameInstanceLock = true;

        this._config = config;
        this._onGameReady = onGameReady || null;
        this._onBackToMenu = onBackToMenu || null;

        const player1Name = config.playerName || 'Player 1';
        const player2Name = config.player2Name || 'Player 2';
        const player1Color = config.playerColor || '#00A6ED';
        const player2Color = config.player2Color || '#F6511D';
        const { gameMode } = config;

        // Initialize ClientEngine (graphics & entities)
        const clientEngine = new ClientEngine(canvas, config);
        this._clientEngine = clientEngine;
        const engine = clientEngine.engineSetup.engine;

        // Determine initial player 2 name based on game mode
        const isPvPMode = gameMode === 'local-2p' || gameMode === 'online-create' || gameMode === 'online-join';
        const isAIMode = gameMode.startsWith('ai-');
        const initialPlayer2Name = isPvPMode ? 'Waiting...' : (isAIMode ? 'AI' : player2Name);

        // Initialize entities with back to menu callback
        const onBackToMenuCallback = () => {
            if (this._onBackToMenu) {
                this._onBackToMenu();
            }
        };
        const entities = clientEngine.init(player1Name, initialPlayer2Name, onBackToMenuCallback);
        const { ball, table, paddle, paddle2, gui, touchControls } = entities;
        this._gui = gui;

        const debugMonitor = new DebugMonitor();
        this._debugMonitor = debugMonitor;

        let activeScene: Scene | null = null;

        const createScene = async () => {
            const scene = clientEngine.scene;

            try {
                const roomManager = new RoomManager({
                    onPlayerAssignment: ({ isPlayer2, player1Id, player2Id }) => {
                        this._isPlayer2 = isPlayer2;
                        clientEngine.engineSetup.setIsPlayer2(isPlayer2);
                        const cam = clientEngine.engineSetup.camera;
                        const mesh = table.mesh;
                        const center = mesh.getBoundingInfo().boundingBox.centerWorld;
                        adjustCamera(cam, mesh, clientEngine.engineSetup.engine);
                        if (isPlayer2) {
                            cam.position = new Vector3(cam.position.x, cam.position.y, -cam.position.z);
                        }
                        cam.setTarget(center);
                    },
                    onPlayerColorUpdate: ({ p1Color, p2Color, isPlayer2 }) => {
                        gui.hud.updatePlayerColors(isPlayer2 ? p2Color : p1Color, isPlayer2 ? p1Color : p2Color);
                        [paddle, paddle2].forEach((p, i) => {
                            const color = i === 0 ? p1Color : p2Color;
                            const mat = p.mesh.material as any;
                            if (mat?.albedoColor) mat.albedoColor = Color3.FromHexString(color);
                            if (mat?.subSurface?.tintColor) mat.subSurface.tintColor = Color3.FromHexString(color);
                        });
                    },
                    onBallUpdate: ({ x, y, z }) => {
                        this._gameLoop?.updateBallPosition(x, y, z);
                    },
                    onBallCollision: ({ lastImpactX, lastImpactZ, collisionTime }) => {
                        ball.triggerBounce(lastImpactX, lastImpactZ, collisionTime);
                    },
                    onPaddleUpdate: ({ paddleIndex, x, z, enabled }) => {
                        this._gameLoop?.updatePaddlePosition(paddleIndex, x, z);
                    },
                    onScoreUpdate: ({ player1Score, player2Score }) => {
                        gui.hud.updateScores(player1Score, player2Score);
                    },
                    onGameOver: ({ winner, player1Name, player2Name, player1Score, player2Score }) => {
                        if (!this._isGameOver) {
                            this._isGameOver = true;
                            this._gameLoop?.setGameOver(true);
                            const room = roomManager.room;
                            const isP1Winner = winner === room?.state.player1Id;
                            gui.gameOverOverlay.show(
                                isP1Winner ? player1Name : player2Name,
                                isP1Winner, player1Score, player2Score,
                                player1Name, player2Name
                            );
                        }
                    },
                    onPlayerNameUpdate: ({ player1Name, player2Name }) => {
                        const room = roomManager.room;
                        if (!room) return;
                        let bottomLabel = player1Name;
                        let topLabel = player2Name;
                        if (room.sessionId === room.state.player1Id) {
                            bottomLabel = player1Name;
                            topLabel = player2Name;
                        } else if (room.sessionId === room.state.player2Id) {
                            bottomLabel = player2Name;
                            topLabel = player1Name;
                        }
                        gui.hud.updatePlayerNames(bottomLabel, topLabel);
                    },
                    onRoomExpired: () => {
                        if (this._onBackToMenu) {
                            alert('Room expired — no opponent joined within 2 minutes.');
                            this._onBackToMenu();
                        }
                    },
                    onError: (error) => {
                        console.error("Join error", error);
                        alert('Failed to connect to game server. Please try again.');
                        if (this._onBackToMenu) this._onBackToMenu();
                    },
                });

                this._roomManager = roomManager;
                const room = await roomManager.connect(gameMode, config, config.roomId);
                this._room = room;

                const isOnlineMode = gameMode === 'online-create' || gameMode === 'online-join';

                // Create GameLoop first with initial positions
                const input = new InputController(scene);
                this._input = input;

                touchControls.setInputController(input);

                const gameLoop = new GameLoop({
                    engine,
                    scene,
                    inputController: input,
                    roomManager,
                    ball,
                    paddle,
                    paddle2,
                    debugMonitor,
                    camera: clientEngine.engineSetup.camera,
                });
                this._gameLoop = gameLoop;

                // Read initial positions from room state before setting up listeners
                console.log('[DEBUG] Initial ball state:', { x: room.state.ball.x, y: room.state.ball.y, z: room.state.ball.z, enabled: room.state.ball.enabled });
                console.log('[DEBUG] Initial paddle1 state:', { x: room.state.paddle.x, z: room.state.paddle.z, enabled: room.state.paddle.enabled });
                console.log('[DEBUG] Initial paddle2 state:', { x: room.state.paddle2.x, z: room.state.paddle2.z, enabled: room.state.paddle2.enabled });

                // Initialize GameLoop with default positions and enabled states
                // The RoomManager callbacks (onBallUpdate, onPaddleUpdate) will update positions when state arrives
                gameLoop.setInitialStates(
                    room.state.ball.enabled ?? true,
                    room.state.paddle.enabled ?? true,
                    room.state.paddle2.enabled ?? true
                );
                gameLoop.setupStateListeners();
                gameLoop.start();

                if (isPvPMode) {
                    if (this._gui && room.state) {
                        const p1Name = room.state.player1Name || player1Name;
                        const p2Name = room.state.player2Name || 'Waiting...';
                        let bottomLabel = p1Name;
                        let topLabel = p2Name;

                        if (room.sessionId === room.state.player2Id) {
                            bottomLabel = p2Name || 'Waiting...';
                            topLabel = p1Name;
                        }

                        this._gui.hud.updatePlayerNames(bottomLabel, topLabel);
                    }

                    const signalGameReady = () => {
                        if (isOnlineMode) {
                            roomManager.signalClientReady();
                        }

                        if (room.state?.gameStarted) {
                            if (this._onGameReady) {
                                const callback = this._onGameReady;
                                this._onGameReady = null;
                                callback(() => this._countdownManager?.start(), false);
                            } else {
                                this._countdownManager?.start();
                            }
                        } else {
                            if (this._onGameReady) {
                                const countdownCallback = () => this._countdownManager?.start();
                                this._onGameReady(countdownCallback, true);
                            }
                        }
                    };

                    if (isOnlineMode) {
                        scene.executeWhenReady(() => signalGameReady());
                    } else {
                        if (this._gui) {
                            scene.executeWhenReady(() => signalGameReady());
                        }
                    }

                    if (room.state?.gameStarted && this._onGameReady) {
                        const callback = this._onGameReady;
                        this._onGameReady = null;
                        callback(() => this._countdownManager?.start(), false);
                    }
                } else {
                    const signalGameReady = () => {
                        if (this._onGameReady) {
                            const cb = this._onGameReady;
                            this._onGameReady = null;
                            cb(() => this._countdownManager?.start());
                        } else {
                            this._countdownManager?.start();
                        }
                    };
                    scene.executeWhenReady(() => signalGameReady());
                }

                this._countdownManager = new CountdownManager({
                    onCountdownUpdate: (count) => {
                        if (count > 0) {
                            gui.hud.updateCountdown(count.toString());
                        } else {
                            gui.hud.updateCountdown('');
                        }
                    },
                    onCountdownComplete: () => {
                        roomManager.sendLaunch();
                    },
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
        this._roomManager?.disconnect();
        this._roomManager = null;
        this._room = null;
        this._renderObserver && this._renderObservable?.remove(this._renderObserver);
        this._renderObserver = null;
        this._renderObservable = null;
        this._input?.dispose();
        this._input = null;
        this._debugMonitor?.dispose();
        this._debugMonitor = null;
        this._clientEngine?.dispose();
        this._clientEngine = null;
        this._gui = null;
        this._gameLoop?.dispose();
        this._gameLoop = null;
        this._countdownManager?.dispose();
        this._countdownManager = null;
    }
}

export const startGame = (
    canvas: HTMLCanvasElement,
    config: GameSessionConfig,
    onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void,
    onBackToMenu?: () => void,
) => {
    const game = new Game();
    return game.startGame(canvas, config, onGameReady, onBackToMenu);
};
