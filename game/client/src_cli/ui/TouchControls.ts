import { AdvancedDynamicTexture, Control, StackPanel, Button, Image, TextBlock } from "@babylonjs/gui";
import { InputController } from "src_cli/input/InputController";
import { GUI_STYLES } from "../config/GUIStyles";

export class TouchControls {
    private texture: AdvancedDynamicTexture;
    private textBlock: TextBlock | null = null;
    private controller: InputController | null = null;

    constructor(texture: AdvancedDynamicTexture) {
        this.texture = texture;
    }

    hideText() {
        if (this.textBlock) {
            this.texture.removeControl(this.textBlock);
            this.textBlock = null;
        }
    }

    setInputController(controller: InputController) {
        this.controller = controller;
    }

    private createIconButton(
        name: string,
        style: typeof GUI_STYLES.TOUCH_CONTROLS.BUTTON_LEFT,
        onPointerDown: () => void,
        onPointerUp: () => void,
    ): Button {
        const button = Button.CreateSimpleButton(name, style.text || '');
        button.width = style.width;
        button.height = style.height;
        button.color = style.color;
        button.background = style.background;
        button.thickness = 0;
        button.fontSize = 0;

        if (style.iconUrl) {
            const icon = new Image(`${name}Icon`, style.iconUrl);
            icon.width = style.iconWidth ?? '40px';
            icon.height = style.iconHeight ?? '40px';
            icon.stretch = Image.STRETCH_UNIFORM;
            icon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            icon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            button.addControl(icon);
        }

        button.onPointerDownObservable.add(onPointerDown);
        button.onPointerUpObservable.add(onPointerUp);

        return button;
    }

    showControls() {
        const container = new StackPanel();
        container.isVertical = false;
        container.horizontalAlignment = GUI_STYLES.TOUCH_CONTROLS.CONTAINER.horizontalAlignment;
        container.verticalAlignment = GUI_STYLES.TOUCH_CONTROLS.CONTAINER.verticalAlignment;
        container.height = GUI_STYLES.TOUCH_CONTROLS.CONTAINER.height;

        const leftStyle = GUI_STYLES.TOUCH_CONTROLS.BUTTON_LEFT;
        const buttonLeft = this.createIconButton(
            'btnLeft',
            leftStyle,
            () => this.controller?.pressLeft(),
            () => this.controller?.releaseLeft(),
        );
        buttonLeft.paddingRight = leftStyle.paddingRight ?? '0px';

        const rightStyle = GUI_STYLES.TOUCH_CONTROLS.BUTTON_RIGHT;
        const buttonRight = this.createIconButton(
            'btnRight',
            rightStyle,
            () => this.controller?.pressRight(),
            () => this.controller?.releaseRight(),
        );
        buttonRight.paddingLeft = rightStyle.paddingLeft ?? '0px';

        container.addControl(buttonLeft);
        container.addControl(buttonRight);

        this.texture.addControl(container);
    }
}
