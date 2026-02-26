import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeConfig } from '../../utils/configDecoder';
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
    const config = location.state as GameSessionConfig | null;

    useEffect(() => {
        setIsLoading(true);
        setFadingOut(false);
        setLoadingMsg('Loading...');
        setErrorMsg(null);
    }, [isTestScene, config]);

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
            // Start game with config - GUI is now handled by Babylon.js
            if (!config) {
                handleError('No game configuration provided');
                setTimeout(() => navigate('/'), 2000);
                return;
            }

            const isOnlineMode = config.gameMode === 'online-create' || config.gameMode === 'online-join';

            // FRONT this is where the game actually starts
            dispose = startGame(
                canvasRef.current,
                config,
                // onGameReady callback, called when all assets/network/game is ready
                (onLaunch, isWaitingForOpponent = false) => {
                    if (isWaitingForOpponent) {
                        setLoadingMsg('Waiting for opponent...');
                        return;
                    }

                    // Game calls this when ready to launch
                    // We update message and trigger fade out
                    setLoadingMsg(isOnlineMode
                        ? 'Starting game...'
                        : 'Ready!');
                    // Fade out overlay
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
    }, [isTestScene, config, navigate]);

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
