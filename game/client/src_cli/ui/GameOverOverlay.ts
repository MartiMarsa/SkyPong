import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';

export class GameOverOverlay {
    private _container: ReturnType<typeof GUIElements.CreateContainer>;
    private _titleText: ReturnType<typeof GUIElements.CreateText>;
    private _winnerText: ReturnType<typeof GUIElements.CreateText>;
    private _scoreText: ReturnType<typeof GUIElements.CreateText>;
    private _backButton: Button;
    private _isVisible: boolean = false;

    constructor(
        private _texture: AdvancedDynamicTexture,
        private _onBackClick: () => void
    ) {
        this._container = GUIElements.CreateContainer('gameOverContainer', GUI_STYLES.CONTAINER.OVERLAY);
        this._container.isVisible = false;
        this._container.isHitTestVisible = true;
        this._container.zIndex = 100;
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

        const buttonStyle = {
            ...GUI_STYLES.BUTTON.DEFAULT,
            ...GUI_STYLES.GAME_OVER_POSITIONS.BUTTON,
            zIndex: 101,
        };
        this._backButton = GUIElements.CreateTextButton(
            'backButton',
            'Back to Game Selection',
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
