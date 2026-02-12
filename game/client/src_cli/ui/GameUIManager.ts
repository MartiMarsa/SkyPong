import { Scene } from '@babylonjs/core';
import { AdvancedDynamicTexture } from '@babylonjs/gui';
import { GameHUD } from './GameHUD';
import { GameOverOverlay } from './GameOverOverlay';

/**
 * Manages the high-level UI states (HUD) using Babylon.js GUI.
 */
export class GameUIManager {
    public texture: AdvancedDynamicTexture;
    public hud: GameHUD;
    public gameOverOverlay: GameOverOverlay;

    /**
     * Initializes the full-screen UI texture and sub-menus.
     * @param scene - The Babylon.js scene to attach the UI to.
     * @param onBackToMenu - Callback when user clicks back to menu.
     */
    constructor(scene: Scene, onBackToMenu: () => void) {
        this.texture = AdvancedDynamicTexture.CreateFullscreenUI(
            'GameUI',
            true,
            scene,
        );

        // GUI renders on top by default with fullscreen UI
        // Set renderingGroupId to 2 so UI renders above game objects (which use 1)
        if (this.texture.layer) {
            (this.texture.layer as any).renderingGroupId = 2;
        }

        this.hud = new GameHUD(this.texture);
        this.gameOverOverlay = new GameOverOverlay(this.texture, onBackToMenu);
    }

    /**
     * Displays the in-game HUD.
     * @param player1Name - Name of Player 1.
     * @param player2Name - Name of Player 2.
     */
    public showGameHUD(player1Name: string, player2Name: string): void {
        this.hud.show(player1Name, player2Name);
    }

    /**
     * Hides all UI elements.
     */
    public hideAll(): void {
        this.hud.hide();
        this.gameOverOverlay.hide();
    }

    /**
     * Disposes the UI texture and all controls.
     */
    public dispose(): void {
        this.gameOverOverlay.dispose();
        this.texture.dispose();
    }
}
