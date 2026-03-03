import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { GameHUD } from "./GameHUD";
import { GameOverOverlay } from "./GameOverOverlay";
import { PauseOverlay } from "./PauseOverlay";

export class GameUIManager {
  public texture: AdvancedDynamicTexture;
  public hud: GameHUD;
  public gameOverOverlay: GameOverOverlay;
  public pauseOverlay: PauseOverlay;

  constructor(scene: Scene, onBackToMenu: () => void, onResume?: () => void) {
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI", true, scene);

    if (this.texture.layer) {
      (this.texture.layer as any).renderingGroupId = 2;
    }

    this.pauseOverlay = new PauseOverlay(
      this.texture,
      () => {
        this.pauseOverlay.hide();
        if (onResume) onResume();
      },
      () => {
        this.pauseOverlay.hide();
        onBackToMenu();
      },
    );

    this.hud = new GameHUD(this.texture);
    this.gameOverOverlay = new GameOverOverlay(this.texture, onBackToMenu);
  }

  public showGameHUD(player1Name: string, player2Name: string): void {
    this.hud.show(player1Name, player2Name);
  }

  public hideAll(): void {
    this.hud.hide();
    this.gameOverOverlay.hide();
    this.pauseOverlay.hide();
  }

  public dispose(): void {
    this.gameOverOverlay.dispose();
    this.pauseOverlay.dispose();
    this.texture.dispose();
  }
}
