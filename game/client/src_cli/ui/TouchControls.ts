import { AdvancedDynamicTexture, TextBlock, Control, StackPanel, Button, CornerHandle } from "@babylonjs/gui";
import { InputController } from "src_cli/input/InputController";

export class TouchControls {
    private texture: AdvancedDynamicTexture;
    private textBlock: TextBlock | null = null;
    private controller: InputController | null = null;

    constructor(texture: AdvancedDynamicTexture) {
        this.texture = texture;
    }

    showText(message: string) {
        if (this.textBlock) {
            this.textBlock.text = message;
            return;
        }

        const textBlock = new TextBlock();
        textBlock.text = message;
        textBlock.color = "white";
        textBlock.fontSize = 32;
        textBlock.fontWeight = "bold";
        textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        textBlock.top = "24px";
        this.texture.addControl(textBlock);
        this.textBlock = textBlock;
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

    showControls() {
        const container = new StackPanel();
        container.isVertical = false;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        container.height = "60px";

        const buttonLeft = Button.CreateSimpleButton("btnLeft", "Left Button");
        buttonLeft.width = "150px";
        buttonLeft.height = "40px";
        buttonLeft.color = "white";
        buttonLeft.background = "red";
        buttonLeft.paddingRight = "10px";
        buttonLeft.onPointerDownObservable.add(() => {
            this.controller?.pressLeft();
        })
        buttonLeft.onPointerUpObservable.add(() => {
            this.controller?.releaseLeft();
        })

        const buttonRight = Button.CreateSimpleButton("btnRight", "Right Button");
        buttonRight.width = "150px";
        buttonRight.height = "40px";
        buttonRight.color = "white";
        buttonRight.background = "red";
        buttonRight.paddingLeft = "10px";
        buttonRight.onPointerDownObservable.add(() => {
            this.controller?.pressRight();
        })
        buttonRight.onPointerUpObservable.add(() => {
            this.controller?.releaseRight();
        })

        container.addControl(buttonLeft);
        container.addControl(buttonRight);

        this.texture.addControl(container);
    }
}