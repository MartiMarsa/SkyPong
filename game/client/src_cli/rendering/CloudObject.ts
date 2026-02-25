import { Scene, Vector3, SpriteManager, Sprite, Color4 } from "@babylonjs/core";

export class CloudObject {
  // Use a static SpriteManager so it is only created once, no matter how many clouds you make
  private static spriteManager: SpriteManager | null = null;

  public sprite: Sprite;

  constructor(scene: Scene, position: Vector3) {
    if (!CloudObject.spriteManager) {
      CloudObject.spriteManager = new SpriteManager(
        "cloudsManager",
        "https://www.babylonjs.com/Scenes/Clouds/cloud.png",
        100,
        256,
        scene
      );
    }

    this.sprite = new Sprite("cloudSprite", CloudObject.spriteManager);

    this.sprite.position = position;

    
    this.sprite.color = new Color4(1, 1, 1, 1); // Last number is opacity
    
    // this.sprite.size = Math.random() * 20 + 10; 
    this.sprite.size = 20; 
    // this.sprite.width = Math.random() * 50 + 30;
    // this.sprite.height = Math.random() * 15 + 50;
    // this.sprite.width = 30;
    // this.sprite.height = 15;

    // if (Math.round(Math.random() * 5) === 0) {
    //   this.sprite.angle = Math.PI * 20 / 90;
    // }
    // if (Math.round(Math.random() * 2) === 0) {
    //   this.sprite.invertU = true;
    // }
    // if (Math.round(Math.random() * 4) === 0) {
    //   this.sprite.invertV = true;
    // }
  }
}