import { AdvancedDynamicTexture, TextBlock, StackPanel, Control } from "@babylonjs/gui";
import { GUI_STYLES } from "../config/GUIStyles";
import { GUIElements } from "./GUIElements";

export class GameHUD {
  private _player1Container: StackPanel;
  private _player2Container: StackPanel;

  private _player1Text: TextBlock;
  private _player2Text: TextBlock;
  private _player1ScoreText: TextBlock;
  private _player2ScoreText: TextBlock;
  private _countdownText: TextBlock;

  private _player1Name: string = "Player 1";
  private _player2Name: string = "Player 2";
  private _player1Score: number = 0;
  private _player2Score: number = 0;

  constructor(private _texture: AdvancedDynamicTexture) {
    this._player2Container = GUIElements.CreateStackPanel(
      "player2Container",
      GUI_STYLES.CONTAINER.HUD_PLAYER2,
      true,
    );
    this._texture.addControl(this._player2Container);

    this._player2Text = GUIElements.CreateText("player2Text", "", GUI_STYLES.TEXT.HUD_NAME);
    this._player2ScoreText = GUIElements.CreateText(
      "player2ScoreText",
      "0",
      GUI_STYLES.TEXT.HUD_SCORE,
    );

    this._player2Container.addControl(this._player2Text);
    this._player2Container.addControl(this._player2ScoreText);

    this._player1Container = GUIElements.CreateStackPanel(
      "player1Container",
      GUI_STYLES.CONTAINER.HUD_PLAYER1,
      true,
    );
    this._texture.addControl(this._player1Container);

    this._player1ScoreText = GUIElements.CreateText(
      "player1ScoreText",
      "0",
      GUI_STYLES.TEXT.HUD_SCORE,
    );
    this._player1Text = GUIElements.CreateText("player1Text", "", GUI_STYLES.TEXT.HUD_NAME);

    this._player1Container.addControl(this._player1ScoreText);
    this._player1Container.addControl(this._player1Text);

    this._countdownText = GUIElements.CreateText("countdownText", "", GUI_STYLES.TEXT.COUNTDOWN);
    this._texture.addControl(this._countdownText);
  }

  public showPauseButton(onClick: () => void): void {
      const pauseBtn = GUIElements.CreateIconButton(
          'pauseButton',
          GUI_STYLES.ICON_BUTTON.PAUSE,
          onClick,
          () => {}
      );
      pauseBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      pauseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      pauseBtn.top = "20px";
      pauseBtn.left = "-20px";
      this._texture.addControl(pauseBtn);
  }
  
  public show(player1Name: string, player2Name: string): void {
    this._player1Name = player1Name;
    this._player2Name = player2Name;

    this._player1Text.text = player1Name;
    this._player2Text.text = player2Name;

    this._player1Container.isVisible = true;
    this._player2Container.isVisible = true;
    this._countdownText.isVisible = false;
  }

  public hide(): void {
    this._player1Container.isVisible = false;
    this._player2Container.isVisible = false;
    this._countdownText.isVisible = false;
  }

  public updateCountdown(text: string): void {
    this._countdownText.text = text;
    this._countdownText.isVisible = text !== "";
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

  public updateScores(player1Score: number, player2Score: number, winningScore: string): void {
    if (typeof player1Score !== "number" || typeof player2Score !== "number") {
      console.warn(
        "[GameHUD] updateScores called with invalid values:",
        player1Score,
        player2Score,
      );
      return;
    }
    this._player1Score = player1Score;
    this._player2Score = player2Score;
    this._player1ScoreText.text = player1Score.toString() + "/" + winningScore;
    this._player2ScoreText.text = player2Score.toString() + "/" + winningScore;
  }

  public getScores(): { player1Score: number; player2Score: number } {
    return {
      player1Score: this._player1Score,
      player2Score: this._player2Score,
    };
  }
}
