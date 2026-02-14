import React from 'react';

interface LoadingOverlayProps {
    message?: string;
    error?: string | null;
    visible: boolean;
    fadingOut?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...', error, visible, fadingOut = false }) => {
    console.log('[LoadingOverlay] Render - visible:', visible, 'fadingOut:', fadingOut, 'message:', message);

    if (!visible && !fadingOut) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: '#fff',
            opacity: fadingOut ? 0 : 1,
            pointerEvents: 'all',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: 1.1,
                    color: '#222',
                    marginBottom: 24
                }}>
                    SkyPong <span style={{ fontWeight: 400, fontSize: 20, color: '#666' }}>– 3D Multiplayer Pong</span>
                </div>
                {error ? (
                    <div style={{ fontSize: 20, color: '#b00', marginTop: 8, fontWeight: 500 }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ fontSize: 19, color: '#444' }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
