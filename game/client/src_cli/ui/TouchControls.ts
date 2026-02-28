import { AdvancedDynamicTexture, Control, StackPanel } from "@babylonjs/gui";
import { InputController } from "src_cli/input/InputController";
import { GUI_STYLES } from "../config/GUIStyles";
import { GUIElements } from "./GUIElements";

export class TouchControls {
  private texture: AdvancedDynamicTexture;
  private container: StackPanel | null = null;
  private controller: InputController | null = null;

  constructor(texture: AdvancedDynamicTexture) {
    this.texture = texture;
  }

  public hideControls(): void {
    if (this.container) {
      this.texture.removeControl(this.container);
      this.container = null;
    }
  }

  public setInputController(controller: InputController): void {
    this.controller = controller;
  }

  public showControls(): void {
    this.container = new StackPanel();
    this.container.isVertical = false;
    this.container.horizontalAlignment =
      GUI_STYLES.TOUCH_CONTAINER.horizontalAlignment;
    this.container.verticalAlignment =
      GUI_STYLES.TOUCH_CONTAINER.verticalAlignment;
    this.container.height = GUI_STYLES.TOUCH_CONTAINER.height;

    const leftButton = GUIElements.CreateIconButton(
      "btnLeft",
      GUI_STYLES.ICON_BUTTON.LEFT,
      () => this.controller?.pressLeft(),
      () => this.controller?.releaseLeft(),
    );
    leftButton.paddingRight = GUI_STYLES.ICON_BUTTON.LEFT.paddingRight ?? "0px";

    const rightButton = GUIElements.CreateIconButton(
      "btnRight",
      GUI_STYLES.ICON_BUTTON.RIGHT,
      () => this.controller?.pressRight(),
      () => this.controller?.releaseRight(),
    );
    rightButton.paddingLeft = GUI_STYLES.ICON_BUTTON.RIGHT.paddingLeft ?? "0px";

    this.container.addControl(leftButton);
    this.container.addControl(rightButton);

    this.texture.addControl(this.container);
  }
}
