import { AdvancedDynamicTexture, Control, TextBlock, Rectangle, Button } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';
import { VISUAL } from '../config';

/**
 * Game Over overlay showing winner, final scores, and navigation options.
 */
export class GameOverOverlay {
    private _container: Rectangle;
    private _titleText: TextBlock;
    private _winnerText: TextBlock;
    private _scoreText: TextBlock;
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
        // Semi-transparent full-screen background
        this._container = new Rectangle('gameOverContainer');
        this._container.width = '100%';
        this._container.height = '100%';
        this._container.background = 'rgba(0, 0, 0, 0.8)';
        this._container.thickness = 0;
        this._container.isVisible = false;
        this._container.isHitTestVisible = true;
        this._container.zIndex = 100; // Ensure it's on top
        this._texture.addControl(this._container);

        // Title text
        this._titleText = GUIElements.CreateText(
            'gameOverTitle',
            'GAME OVER',
            {
                color: '#FFD700',
                fontSize: VISUAL.UI_POSITIONING.GAME_OVER.TITLE.FONT_SIZE,
                fontWeight: 'bold',
                outlineWidth: VISUAL.UI_POSITIONING.GAME_OVER.TITLE.OUTLINE_WIDTH,
                outlineColor: 'black',
            }
        );
        this._titleText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._titleText.top = VISUAL.UI_POSITIONING.GAME_OVER.TITLE.TOP;
        this._container.addControl(this._titleText);

        // Winner announcement text
        this._winnerText = GUIElements.CreateText(
            'winnerText',
            '',
            {
                color: '#FFFFFF',
                fontSize: VISUAL.UI_POSITIONING.GAME_OVER.WINNER.FONT_SIZE,
                fontWeight: 'bold',
                outlineWidth: VISUAL.UI_POSITIONING.GAME_OVER.WINNER.OUTLINE_WIDTH,
                outlineColor: 'black',
            }
        );
        this._winnerText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._winnerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._winnerText.top = VISUAL.UI_POSITIONING.GAME_OVER.WINNER.TOP;
        this._container.addControl(this._winnerText);

        // Final score text
        this._scoreText = GUIElements.CreateText(
            'finalScoreText',
            '',
            {
                color: '#AAAAAA',
                fontSize: VISUAL.UI_POSITIONING.GAME_OVER.SCORE.FONT_SIZE,
                fontWeight: 'bold',
            }
        );
        this._scoreText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._scoreText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._scoreText.top = VISUAL.UI_POSITIONING.GAME_OVER.SCORE.TOP;
        this._container.addControl(this._scoreText);

        // Back to menu button
        this._backButton = GUIElements.CreateButton(
            'backButton',
            'Back to Game Selection',
            {
                width: VISUAL.UI_POSITIONING.GAME_OVER.BUTTON.WIDTH,
                height: VISUAL.UI_POSITIONING.GAME_OVER.BUTTON.HEIGHT,
                color: '#FFFFFF',
                background: '#4CAF50',
                fontSize: 24,
                cornerRadius: 10,
            },
            () => {
                console.log('[GameOverOverlay] Back button clicked');
                if (this._onBackClick) {
                    this._onBackClick();
                }
            }
        );
        this._backButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._backButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._backButton.top = VISUAL.UI_POSITIONING.GAME_OVER.BUTTON.TOP;
        this._backButton.zIndex = 101; // Ensure button is above container
        this._backButton.isHitTestVisible = true;
        this._backButton.isPointerBlocker = true;
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
        // Update winner text
        this._winnerText.text = `${winnerName} Wins!`;
        this._winnerText.color = isWinnerPlayer1 ? '#7eb8ff' : '#ff7e7e';

        // Update score text
        this._scoreText.text = `${player1Name}: ${player1Score} - ${player2Name}: ${player2Score}`;

        // Show the overlay
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
