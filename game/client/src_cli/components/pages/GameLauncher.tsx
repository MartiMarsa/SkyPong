import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { decodeConfig } from '../../utils/configDecoder';

const STYLES = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        gap: '20px',
    },
    title: {
        color: 'white',
        fontSize: '36px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    },
    subtitle: {
        color: '#aaa',
        fontSize: '18px',
        textAlign: 'center' as const,
        maxWidth: '500px',
    },
    errorContainer: {
        padding: '20px 30px',
        backgroundColor: '#f4433622',
        border: '1px solid #f44336',
        borderRadius: '8px',
        maxWidth: '500px',
    },
    errorTitle: {
        color: '#f44336',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    errorMessage: {
        color: '#ff6b6b',
        fontSize: '16px',
    },
    button: {
        padding: '15px 40px',
        fontSize: '20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        minWidth: '200px',
        transition: 'transform 0.1s, box-shadow 0.1s',
    },
    backButton: {
        padding: '15px 40px',
        fontSize: '20px',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        minWidth: '200px',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #333',
        borderTop: '4px solid #00A6ED',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#aaa',
        fontSize: '18px',
    },
};

// Add keyframes for spinner animation
const spinnerKeyframes = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

const GameLauncher: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Inject spinner animation styles
        const styleElement = document.createElement('style');
        styleElement.textContent = spinnerKeyframes;
        document.head.appendChild(styleElement);

        // FRONT here is the config received decoded
        const base64Config = searchParams.get('config');
        const result = decodeConfig(base64Config);

        if (result.valid) {
            // FRONT here we use the React Router to navigate to the canvas and bring the config along
            navigate('/canvas', { state: result.config });
        } else {
            // Show error
            setError(result.error);
            setIsLoading(false);
        }

        return () => {
            document.head.removeChild(styleElement);
        };
    }, [searchParams, navigate]);

    const handleBackToMenu = () => {
        navigate('/');
    };

    // Loading state
    if (isLoading && !error) {
        return (
            <div style={STYLES.container}>
                <div style={STYLES.loadingSpinner}></div>
                <p style={STYLES.loadingText}>Loading game configuration...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={STYLES.container}>
                <h1 style={STYLES.title}>Configuration Error</h1>
                <div style={STYLES.errorContainer}>
                    <div style={STYLES.errorTitle}>Unable to start game</div>
                    <div style={STYLES.errorMessage}>{error}</div>
                </div>
                <button
                    onClick={handleBackToMenu}
                    style={STYLES.backButton}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#555';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#666';
                    }}
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    // Should not reach here (navigates away on success)
    return null;
};

export default GameLauncher;
