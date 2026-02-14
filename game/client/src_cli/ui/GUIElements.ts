import {
    Button,
    TextBlock,
    Rectangle,
    StackPanel,
    Control,
} from '@babylonjs/gui';
import {
    ITextStyle,
    IButtonStyle,
    IContainerStyle,
    IPanelStyle,
} from '../config/GUIStyles';

/**
 * Factory class for creating styled Babylon.js GUI controls.
 */
export class GUIElements {
    /**
     * Creates a styled text block.
     * @param name - The name of the control.
     * @param content - The text to display.
     * @param style - The style configuration object.
     */
    public static CreateText(
        name: string,
        content: string,
        style: ITextStyle,
    ): TextBlock {
        const text = new TextBlock(name);
        text.text = content;
        text.color = style.color;
        text.fontSize = style.fontSize;

        if (style.height) text.height = style.height;
        if (style.fontFamily) text.fontFamily = style.fontFamily;
        if (style.fontWeight) text.fontWeight = style.fontWeight;
        if (style.outlineWidth) text.outlineWidth = style.outlineWidth;
        if (style.outlineColor) text.outlineColor = style.outlineColor;

        if (style.textVerticalAlignment !== undefined) {
            text.textVerticalAlignment = style.textVerticalAlignment;
        } else {
            text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        }

        text.resizeToFit = true;
        return text;
    }

    /**
     * Creates a styled button with a click handler.
     * @param name - The name of the control.
     * @param content - The button label text.
     * @param style - The style configuration object.
     * @param onClick - Optional callback invoked on pointer up.
     */
    public static CreateButton(
        name: string,
        content: string,
        style: IButtonStyle,
        onClick?: () => void,
    ): Button {
        const btn = Button.CreateSimpleButton(name, content);
        btn.width = style.width;
        btn.height = style.height;
        btn.color = style.color;
        btn.background = style.background;
        btn.cornerRadius = style.cornerRadius;
        btn.fontSize = style.fontSize;

        if (onClick) {
            btn.onPointerUpObservable.add(onClick);
        }
        return btn;
    }

    /**
     * Creates a background container (Rectangle).
     * @param name - The name of the control.
     * @param style - The style configuration object.
     */
    public static CreateContainer(
        name: string,
        style: IContainerStyle,
    ): Rectangle {
        const rect = new Rectangle(name);
        rect.background = style.background;
        rect.cornerRadius = style.cornerRadius;
        rect.thickness = style.thickness;
        rect.verticalAlignment = style.verticalAlignment;
        rect.adaptWidthToChildren = true;
        rect.adaptHeightToChildren = true;
        return rect;
    }

    /**
     * Creates a stack panel for organizing child controls vertically.
     * @param name - The name of the control.
     * @param style - The style configuration object.
     */
    public static CreateStackPanel(
        name: string,
        style: IPanelStyle,
    ): StackPanel {
        const panel = new StackPanel(name);
        panel.spacing = style.spacing;
        panel.paddingTop = style.padding;
        panel.paddingBottom = style.padding;
        panel.paddingLeft = style.padding;
        panel.paddingRight = style.padding;
        panel.adaptWidthToChildren = true;
        panel.adaptHeightToChildren = true;
        return panel;
    }
}
