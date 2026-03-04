import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';
import { GameSessionConfig } from '../types/GameSessionConfig';

export class GameOverOverlay {
    private _container: ReturnType<typeof GUIElements.CreateContainer>;
    private _titleText: ReturnType<typeof GUIElements.CreateText>;
    private _winnerText: ReturnType<typeof GUIElements.CreateText>;
    private _scoreText: ReturnType<typeof GUIElements.CreateText>;
    private _retryButton: Button | null = null;
    private _backButton: Button;
    private _isVisible: boolean = false;
    private _config: GameSessionConfig;
    private _onRetry: (() => void) | null = null;

    constructor(
        private _texture: AdvancedDynamicTexture,
        private _onBackClick: () => void,
        config: GameSessionConfig,
        onRetry?: () => void
    ) {
        this._config = config;
        this._onRetry = onRetry || null;
        this._container = GUIElements.CreateContainer('gameOverContainer', GUI_STYLES.CONTAINER.OVERLAY);
        this._container.isVisible = false;
        this._container.isHitTestVisible = true;
        this._container.zIndex = 100;
        this._container.adaptWidthToChildren = false;
        this._container.adaptHeightToChildren = false;
        this._texture.addControl(this._container);

        const titleStyle = {
            ...GUI_STYLES.TEXT.GAME_OVER_TITLE,
            top: GUI_STYLES.GAME_OVER_POSITIONS.TITLE.top,
        };
        this._titleText = GUIElements.CreateText('gameOverTitle', 'GAME OVER', titleStyle);
        this._container.addControl(this._titleText);

        const winnerStyle = {
            ...GUI_STYLES.TEXT.GAME_OVER_WINNER,
            top: GUI_STYLES.GAME_OVER_POSITIONS.WINNER.top,
        };
        this._winnerText = GUIElements.CreateText('winnerText', '', winnerStyle);
        this._container.addControl(this._winnerText);

        const scoreStyle = {
            ...GUI_STYLES.TEXT.GAME_OVER_SCORE,
            top: GUI_STYLES.GAME_OVER_POSITIONS.SCORE.top,
        };
        this._scoreText = GUIElements.CreateText('finalScoreText', '', scoreStyle);
        this._container.addControl(this._scoreText);

        // Show retry button only for local/AI modes (not for online modes)
        const showRetryButton = ['ai-easy', 'ai-medium', 'ai-hard', 'local-2p'].includes(this._config.gameMode);
        
        if (showRetryButton && this._onRetry) {
            const retryButtonStyle = {
                ...GUI_STYLES.BUTTON.DEFAULT,
                top: '100px',
                zIndex: 101,
                background: '#235789',
                width: '280px',
            };
            this._retryButton = GUIElements.CreateTextButton(
                'retryButton',
                'Play Again',
                retryButtonStyle,
                () => {
                    console.log('[GameOverOverlay] Retry button clicked');
                    if (this._onRetry) {
                        this._onRetry();
                    }
                }
            );
            this._container.addControl(this._retryButton);
        }

        const buttonStyle = {
            ...GUI_STYLES.BUTTON.DEFAULT,
            top: '180px',
            zIndex: 101,
            width: '280px',
        };
        this._backButton = GUIElements.CreateTextButton(
            'backButton',
            'Back to Menu',
            buttonStyle,
            () => {
                console.log('[GameOverOverlay] Back button clicked');
                this._onBackClick();
            }
        );
        this._container.addControl(this._backButton);
    }

    public show(
        winnerName: string,
        isWinnerPlayer1: boolean,
        player1Score: number,
        player2Score: number,
        player1Name: string,
        player2Name: string
    ): void {
        this._winnerText.text = `${winnerName} Wins!`;
        this._winnerText.color = isWinnerPlayer1 ? '#7eb8ff' : '#ff7e7e';

        this._scoreText.text = `${player1Name}: ${player1Score} - ${player2Name}: ${player2Score}`;

        this._container.isVisible = true;
        this._isVisible = true;
    }

    public hide(): void {
        this._container.isVisible = false;
        this._isVisible = false;
    }

    public isVisible(): boolean {
        return this._isVisible;
    }

    public dispose(): void {
        this._container.dispose();
    }
}
