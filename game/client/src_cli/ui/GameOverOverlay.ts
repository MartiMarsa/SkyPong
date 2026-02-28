import { AdvancedDynamicTexture, Rectangle, Button } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';

/**
 * Game Over overlay showing winner, final scores, and navigation options.
 */
export class GameOverOverlay {
    private _container: Rectangle;
    private _titleText: import('@babylonjs/gui').TextBlock;
    private _winnerText: import('@babylonjs/gui').TextBlock;
    private _scoreText: import('@babylonjs/gui').TextBlock;
    private _backButton: Button;
    private _isVisible: boolean = false;

    /**
     * Creates the game over overlay elements (initially hidden).
     * @param texture - The advanced dynamic texture to attach controls to.
     * @param onBackClick - Callback when back button is clicked.
     */
    constructor(
        private _texture: AdvancedDynamicTexture,
        private _onBackClick: () => void
    ) {
        this._container = GUIElements.CreateContainer('gameOverContainer', GUI_STYLES.GAME_OVER.CONTAINER);
        this._container.width = '100%';
        this._container.height = '100%';
        this._container.isVisible = false;
        this._container.isHitTestVisible = true;
        this._container.zIndex = 100;
        this._texture.addControl(this._container);

        this._titleText = GUIElements.CreatePositionedText(
            'gameOverTitle',
            'GAME OVER',
            GUI_STYLES.GAME_OVER.TITLE,
        );
        this._container.addControl(this._titleText);

        this._winnerText = GUIElements.CreatePositionedText(
            'winnerText',
            '',
            GUI_STYLES.GAME_OVER.WINNER,
        );
        this._container.addControl(this._winnerText);

        this._scoreText = GUIElements.CreatePositionedText(
            'finalScoreText',
            '',
            GUI_STYLES.GAME_OVER.SCORE,
        );
        this._container.addControl(this._scoreText);

        this._backButton = GUIElements.CreatePositionedButton(
            'backButton',
            'Back to Game Selection',
            GUI_STYLES.GAME_OVER.BUTTON,
            () => {
                console.log('[GameOverOverlay] Back button clicked');
                this._onBackClick();
            }
        );
        this._container.addControl(this._backButton);
    }

    /**
     * Shows the game over overlay with winner information.
     * @param winnerName - Name of the winning player.
     * @param isWinnerPlayer1 - Whether player 1 won (affects styling).
     * @param player1Score - Final score of player 1.
     * @param player2Score - Final score of player 2.
     * @param player1Name - Name of player 1.
     * @param player2Name - Name of player 2.
     */
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

    /**
     * Hides the game over overlay.
     */
    public hide(): void {
        this._container.isVisible = false;
        this._isVisible = false;
    }

    /**
     * Checks if the overlay is currently visible.
     * @returns True if visible, false otherwise.
     */
    public isVisible(): boolean {
        return this._isVisible;
    }

    /**
     * Disposes all overlay controls.
     */
    public dispose(): void {
        this._container.dispose();
    }
}
