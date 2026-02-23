import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";

export class TouchControls {
    private texture: AdvancedDynamicTexture;
    private textBlock: TextBlock | null = null;

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
}