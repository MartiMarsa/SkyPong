import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import { GUI_STYLES } from '../config/GUIStyles';
import { GUIElements } from './GUIElements';

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

    constructor(private _texture: AdvancedDynamicTexture) {
        const player1NameStyle = {
            ...GUI_STYLES.TEXT.HUD_NAME,
            ...GUI_STYLES.HUD_POSITIONS.PLAYER1_NAME,
        };
        this._player1Text = GUIElements.CreateText('player1Text', '', player1NameStyle);
        this._texture.addControl(this._player1Text);

        const player1ScoreStyle = {
            ...GUI_STYLES.TEXT.HUD_SCORE,
            ...GUI_STYLES.HUD_POSITIONS.PLAYER1_SCORE,
        };
        this._player1ScoreText = GUIElements.CreateText('player1ScoreText', '0', player1ScoreStyle);
        this._texture.addControl(this._player1ScoreText);

        const player2NameStyle = {
            ...GUI_STYLES.TEXT.HUD_NAME,
            ...GUI_STYLES.HUD_POSITIONS.PLAYER2_NAME,
        };
        this._player2Text = GUIElements.CreateText('player2Text', '', player2NameStyle);
        this._texture.addControl(this._player2Text);

        const player2ScoreStyle = {
            ...GUI_STYLES.TEXT.HUD_SCORE,
            ...GUI_STYLES.HUD_POSITIONS.PLAYER2_SCORE,
        };
        this._player2ScoreText = GUIElements.CreateText('player2ScoreText', '0', player2ScoreStyle);
        this._texture.addControl(this._player2ScoreText);

        this._countdownText = GUIElements.CreateText('countdownText', '', GUI_STYLES.TEXT.COUNTDOWN);
        this._texture.addControl(this._countdownText);
    }

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

    public hide(): void {
        this._player1Text.isVisible = false;
        this._player2Text.isVisible = false;
        this._player1ScoreText.isVisible = false;
        this._player2ScoreText.isVisible = false;
        this._countdownText.isVisible = false;
    }

    public updateCountdown(text: string): void {
        this._countdownText.text = text;
        this._countdownText.isVisible = text !== '';
    }

    public updatePlayerNames(player1Name: string, player2Name: string): void {
        this._player1Name = player1Name;
        this._player2Name = player2Name;
        this._player1Text.text = player1Name;
        this._player2Text.text = player2Name;
    }

    public updatePlayerColors(player1Color: string, player2Color: string): void {
        this._player1Text.color = player1Color;
        this._player2Text.color = player2Color;
    }

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

    public getScores(): { player1Score: number; player2Score: number } {
        return {
            player1Score: this._player1Score,
            player2Score: this._player2Score,
        };
    }
}
