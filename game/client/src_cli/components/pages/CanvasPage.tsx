import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { decodeConfig } from '../../utils/configDecoder';
import { startGame } from '../../game/Game';
import { TestScene } from '../../game/TestScene';
import LoadingOverlay from '../LoadingOverlay';
import { GameSessionConfig } from '../../types/GameSessionConfig';
import { LoadingManager } from '../../game/LoadingManager';
import { LoadingState, INITIAL_LOADING_STATE } from '../../types/LoadingTypes';

const CanvasPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isTestScene, setIsTestScene] = useState(false);
    const testSceneRef = useRef<TestScene | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const initializedRef = useRef(false);
    const initLockRef = useRef(false);
    const loadingManagerRef = useRef<LoadingManager | null>(null);
    const [, forceUpdate] = useState({});

    const [loadingState, setLoadingState] = useState<LoadingState>(INITIAL_LOADING_STATE);

    const [searchParams] = useSearchParams();

    const getConfig = (): GameSessionConfig | null => {
        const encoded = searchParams.get('config');
        if (encoded) {
            const result = decodeConfig(encoded);
            if (result.valid) return result.config;
        }

        const stateConfig = location.state as GameSessionConfig | null;
        return stateConfig;
    };
    const config = useMemo(() => getConfig(), [location.state, searchParams]);

    useEffect(() => {
        setLoadingState(INITIAL_LOADING_STATE);
        loadingManagerRef.current = null;
    }, [isTestScene, config]);

    useEffect(() => {
        if (!canvasRef.current) {
            setLoadingState((prev) => ({
                ...prev,
                message: 'Initializing display...',
            }));
            return;
        }

        if (initializedRef.current || initLockRef.current) {
            return;
        }
        initLockRef.current = true;

        let dispose: (() => void) | null = null;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;

        function handleReady() {
            setLoadingState((prev) => ({
                ...prev,
                isFadingOut: true,
            }));
            setTimeout(() => {
                setLoadingState((prev) => ({
                    ...prev,
                    phase: 'error',
                    isFadingOut: false,
                }));
            }, 700);
        }

        if (isTestScene) {
            try {
                testSceneRef.current = new TestScene(canvasRef.current);
                initializedRef.current = true;
                setTimeout(() => {
                    setLoadingState((prev) => ({
                        ...prev,
                        phase: 'ready',
                        message: 'Ready!',
                    }));
                    handleReady();
                }, 1200);
            } catch {
                setLoadingState((prev) => ({
                    ...prev,
                    phase: 'error',
                    message: '',
                    error: { code: 'unknown', details: 'Failed to load visualization.' },
                }));
            }
        } else {
            if (!config) {
                setLoadingState((prev) => ({
                    ...prev,
                    phase: 'error',
                    message: '',
                    error: { code: 'configuration-invalid', details: 'No game configuration provided' },
                }));
                setTimeout(() => navigate('/'), 2000);
                return;
            }

            const isOnlineMode = config.gameMode === 'online-create' || config.gameMode === 'online-join';
            const isPvPMode = config.gameMode === 'local-2p' || isOnlineMode;

            dispose = startGame(
                canvasRef.current,
                config,
                (onLaunch, isWaitingForOpponent = false) => {
                    if (isWaitingForOpponent) {
                        setLoadingState((prev) => ({
                            ...prev,
                            phase: 'waiting-for-opponent',
                            message: 'Waiting for opponent...',
                        }));
                        return;
                    }

                    setLoadingState((prev) => ({
                        ...prev,
                        phase: isOnlineMode ? 'starting' : 'ready',
                        message: isOnlineMode ? 'Starting game...' : 'Ready!',
                    }));
                    handleReady();

                    setTimeout(() => {
                        if (onLaunch) {
                            onLaunch();
                        }
                        canvasRef.current?.focus();
                    }, 200);
                },
                () => {
                    setLoadingState((prev) => ({
                        ...prev,
                        phase: 'error',
                        message: '',
                        error: { code: 'connection-failed', details: 'Connection failed or room closed.' },
                    }));
                    setTimeout(() => navigate('/'), 2000);
                },
                (loadingManager) => {
                    loadingManagerRef.current = loadingManager;
                    loadingManager.onStateChange((state: LoadingState) => {
                        setLoadingState(state);
                    });
                },
            );

            if (dispose !== null) {
                initializedRef.current = true;
            } else {
                setLoadingState((prev) => ({
                    ...prev,
                    message: 'Waiting for game cleanup...',
                }));
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
            loadingManagerRef.current?.dispose();
            loadingManagerRef.current = null;
            dispose?.();
            initializedRef.current = false;
            initLockRef.current = false;
        };
    }, [isTestScene, config, navigate]);

    const toggleScene = () => {
        setIsTestScene(!isTestScene);
    };

    const handleBackToStart = () => {
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'game-exit' }, '*');
        }
        navigate('/');
    };

    const isOverlayVisible = loadingState.phase !== 'error' || loadingState.error !== null;

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <canvas ref={canvasRef} id="renderCanvas" style={{ display: 'block' }} />
            <LoadingOverlay
                state={loadingState}
                visible={isOverlayVisible}
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
