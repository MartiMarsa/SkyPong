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
    const [isLoading, setIsLoading] = useState(true); // Show overlay on initial load
    const [loadingMsg, setLoadingMsg] = useState('Loading...');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fadingOut, setFadingOut] = useState(false);

    // Get game config from navigation state
    const config = location.state as GameSessionConfig | null;

    useEffect(() => {
        // Overlay shown as soon as page mounts
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

        // Prevent double initialization (React StrictMode)
        if (initializedRef.current || initLockRef.current) {
            return;
        }
        initLockRef.current = true;

        let dispose: (() => void) | null = null;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;

        function handleReady() {
            console.log('[CanvasPage] handleReady called - starting fade out');
            // Start fade out and remove overlay after animation
            setFadingOut(true);
            setTimeout(() => {
                console.log('[CanvasPage] Fade out complete - hiding overlay');
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
                // Simulate load for demo/testing
                setTimeout(handleReady, 1200);
            } catch (e) {
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

            dispose = startGame(
                canvasRef.current,
                config,
                // onGameReady callback, called when all assets/network/game is ready
                (onLaunch, isWaitingForOpponent = false) => {
                    console.log('[CanvasPage] onGameReady callback invoked, waitingForOpponent:', isWaitingForOpponent);

                    if (isWaitingForOpponent) {
                        // For PvP mode, update message but keep overlay visible
                        setLoadingMsg('Waiting for opponent...');
                        // Store the onLaunch callback for later (will be called when both ready)
                        return;
                    }

                    // Game calls this when ready to launch
                    // We update message and trigger fade out
                    setLoadingMsg(isOnlineMode
                        ? 'Starting game...'
                        : 'Ready!');
                    // Fade out overlay
                    handleReady();
                    // After overlay starts fading, trigger the game launch (countdown)
                    setTimeout(() => {
                        console.log('[CanvasPage] Calling onLaunch to start countdown');
                        if (onLaunch) {
                            onLaunch();
                        }
                    }, 200); // Small delay to let fade start
                },
                // onBackToMenu (triggered on network fail or quit)
                () => {
                    handleError('Connection failed or room closed.');
                    setTimeout(() => navigate('/'), 2000);
                },
            );
            // Only mark as initialized if game actually started (not skipped due to lock)
            if (dispose !== null) {
                initializedRef.current = true;
            } else {
                // Game was skipped because another instance is running/cleaning up
                // Schedule a retry after a short delay
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
            {/* Minimal HTML overlay - only dev controls and back button */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 10,
                display: 'flex',
                gap: '10px',
                flexDirection: 'column'
            }}>
                <button
                    onClick={toggleScene}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
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
                        cursor: 'pointer'
                    }}
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default CanvasPage;
