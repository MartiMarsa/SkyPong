import { AdvancedDynamicTexture, Control, TextBlock } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';

/**
 * Head-Up Display responsible for showing player names, scores, and countdowns.
 */
export class GameHUD {
    private _player1Text: TextBlock;
    private _player2Text: TextBlock;
    private _player1ScoreText: TextBlock;
    private _player2ScoreText: TextBlock;
    private _countdownText: TextBlock;

    private _player1Name: string = 'Player 1';
    private _player2Name: string = 'Player 2';
    private _player1Score: number = 0;
    private _player2Score: number = 0;

    /**
     * Creates the HUD elements but keeps them hidden initially.
     * @param texture - The advanced dynamic texture to attach controls to.
     */
    constructor(private _texture: AdvancedDynamicTexture) {
        this._player1Text = GUIElements.CreateHUDText(
            'player1Text',
            '',
            GUI_STYLES.HUD.PLAYER1_NAME,
        );
        this._texture.addControl(this._player1Text);

        this._player1ScoreText = GUIElements.CreateHUDText(
            'player1ScoreText',
            '0',
            GUI_STYLES.HUD.PLAYER1_SCORE,
        );
        this._texture.addControl(this._player1ScoreText);

        this._player2Text = GUIElements.CreateHUDText(
            'player2Text',
            '',
            GUI_STYLES.HUD.PLAYER2_NAME,
        );
        this._texture.addControl(this._player2Text);

        this._player2ScoreText = GUIElements.CreateHUDText(
            'player2ScoreText',
            '0',
            GUI_STYLES.HUD.PLAYER2_SCORE,
        );
        this._texture.addControl(this._player2ScoreText);

        this._countdownText = GUIElements.CreateHUDText(
            'countdownText',
            '',
            GUI_STYLES.HUD.COUNTDOWN,
        );
        this._texture.addControl(this._countdownText);
    }

    /**
     * Activates the HUD with player names.
     * @param player1Name - Name of Player 1.
     * @param player2Name - Name of Player 2.
     */
    public show(player1Name: string, player2Name: string): void {
        this._player1Name = player1Name;
        this._player2Name = player2Name;

        this._player1Text.text = player1Name;
        this._player2Text.text = player2Name;

        this._player1Text.isVisible = true;
        this._player2Text.isVisible = true;
        this._player1ScoreText.isVisible = true;
        this._player2ScoreText.isVisible = true;
        this._countdownText.isVisible = false;
    }

    /** Hides all HUD elements. */
    public hide(): void {
        this._player1Text.isVisible = false;
        this._player2Text.isVisible = false;
        this._player1ScoreText.isVisible = false;
        this._player2ScoreText.isVisible = false;
        this._countdownText.isVisible = false;
    }

    /**
     * Updates the center countdown text.
     * @param text - The text to display (e.g., "3", "2", "1", "GO!").
     */
    public updateCountdown(text: string): void {
        this._countdownText.text = text;
        this._countdownText.isVisible = text !== '';
    }

    /**
     * Updates player names.
     * @param player1Name - Name of Player 1.
     * @param player2Name - Name of Player 2.
     */
    public updatePlayerNames(player1Name: string, player2Name: string): void {
        this._player1Name = player1Name;
        this._player2Name = player2Name;
        this._player1Text.text = player1Name;
        this._player2Text.text = player2Name;
    }

    /**
     * Updates player name colors.
     * @param player1Color - Color for Player 1 name (hex string).
     * @param player2Color - Color for Player 2 name (hex string).
     */
    public updatePlayerColors(player1Color: string, player2Color: string): void {
        this._player1Text.color = player1Color;
        this._player2Text.color = player2Color;
    }

    /**
     * Updates player scores display.
     * @param player1Score - Score of Player 1.
     * @param player2Score - Score of Player 2.
     */
    public updateScores(player1Score: number, player2Score: number): void {
        if (typeof player1Score !== 'number' || typeof player2Score !== 'number') {
            console.warn('[GameHUD] updateScores called with invalid values:', player1Score, player2Score);
            return;
        }
        this._player1Score = player1Score;
        this._player2Score = player2Score;
        this._player1ScoreText.text = player1Score.toString();
        this._player2ScoreText.text = player2Score.toString();
    }

    /**
     * Gets current player scores.
     * @returns Object containing both player scores.
     */
    public getScores(): { player1Score: number; player2Score: number } {
        return {
            player1Score: this._player1Score,
            player2Score: this._player2Score
        };
    }
}
