import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { startGame } from '../../game/Game';
import { TestScene } from '../../game/TestScene';
import LoadingOverlay from '../LoadingOverlay';
import { GameSessionConfig } from '../../types/GameSessionConfig';

const CanvasPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isTestScene, setIsTestScene] = useState(false);
    const testSceneRef = useRef<TestScene | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const initializedRef = useRef(false);
    const initLockRef = useRef(false);
    const [, forceUpdate] = useState({});

    // Loading and overlay state
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState('Loading...');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fadingOut, setFadingOut] = useState(false);

    // Get game config from navigation state
    const gameState = location.state as GameSessionConfig | null;

    useEffect(() => {
        if (!gameState) {
            navigate('/', { replace: true });
        }
    }, [gameState, navigate]);

    if (!gameState) {
        return null;
    }

    const mode = gameState.mode;
    const playerId = gameState.playerId;
    const scoreToWin = gameState.scoreToWin;
    const player1Name = gameState.player1Name || 'Player 1';
    const player2Name = gameState.player2Name || (mode.startsWith('ai-') ? 'AI' : 'Player 2');
    const player1Color = gameState.player1Color || '#00A6ED';
    const player2Color = gameState.player2Color || '#F6511D';
    const pvpRoomId = gameState.pvpRoomId;
    const pvpAction = gameState.pvpAction;

    useEffect(() => {
        setIsLoading(true);
        setFadingOut(false);
        setLoadingMsg('Loading...');
        setErrorMsg(null);
    }, [isTestScene, mode, player1Name, player2Name]);

    useEffect(() => {
        if (!canvasRef.current) {
            setLoadingMsg('Initializing display...');
            return;
        }

        if (initializedRef.current || initLockRef.current) {
            return;
        }
        initLockRef.current = true;

        let dispose: (() => void) | null = null;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;

        function handleReady() {
            setFadingOut(true);
            setTimeout(() => {
                setIsLoading(false);
                setFadingOut(false);
            }, 700);
        }

        function handleError(err: string) {
            setErrorMsg(err);
            setLoadingMsg('');
            setIsLoading(true);
            setFadingOut(false);
        }

        if (isTestScene) {
            try {
                testSceneRef.current = new TestScene(canvasRef.current);
                initializedRef.current = true;
                setTimeout(handleReady, 1200);
            } catch {
                handleError('Failed to load visualization.');
            }
        } else {
            dispose = startGame(
                canvasRef.current,
                mode,
                player1Name,
                player2Name,
                player1Color,
                player2Color,
                (onLaunch, isWaitingForOpponent = false) => {
                    if (isWaitingForOpponent) {
                        setLoadingMsg('Waiting for opponent...');
                        return;
                    }

                    setLoadingMsg(mode === '2p-online' ? 'Starting game...' : 'Ready!');
                    handleReady();

                    setTimeout(() => {
                        if (onLaunch) {
                            onLaunch();
                        }
                    }, 200);
                },
                () => {
                    handleError('Connection failed or room closed.');
                    setTimeout(() => navigate('/'), 2000);
                },
                pvpRoomId,
                pvpAction,
                scoreToWin,
                playerId,
            );

            if (dispose !== null) {
                initializedRef.current = true;
            } else {
                setLoadingMsg('Waiting for game cleanup...');
                initLockRef.current = false;
                retryTimeout = setTimeout(() => {
                    forceUpdate({});
                }, 100);
            }
        }

        return () => {
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
            dispose?.();
            initializedRef.current = false;
            initLockRef.current = false;
        };
    }, [isTestScene, mode, player1Name, player2Name, player1Color, player2Color, pvpRoomId, pvpAction, navigate, scoreToWin, playerId]);

    const toggleScene = () => {
        setIsTestScene(!isTestScene);
    };

    const handleBackToStart = () => {
        navigate('/');
    };

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <canvas ref={canvasRef} id="renderCanvas" style={{ display: 'block' }} />
            <LoadingOverlay
                visible={isLoading || fadingOut}
                fadingOut={fadingOut}
                message={loadingMsg}
                error={errorMsg}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '10px',
                    flexDirection: 'column',
                }}
            >
                <button
                    onClick={toggleScene}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {isTestScene ? 'Load Game' : 'Load Test Scene'}
                </button>
                <button
                    onClick={handleBackToStart}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default CanvasPage;
