export interface ITextStyle {
    color: string;
    fontSize: number;
    fontFamily?: string;
    height?: string;
    textVerticalAlignment?: number;
    fontWeight?: string;
    outlineWidth?: number;
    outlineColor?: string;
}

export interface IButtonStyle {
    width: string;
    height: string;
    color: string;
    background: string;
    fontSize: number;
    cornerRadius: number;
}

export interface IContainerStyle {
    background: string;
    cornerRadius: number;
    thickness: number;
    verticalAlignment: number;
}

export interface IPanelStyle {
    spacing: number;
    padding: string;
}

export interface IInputStyle {
    width: string;
    height: string;
    color: string;
    background: string;
    focusedBackground: string;
}

export const GUI_STYLES = {
    TEXT: {
        PLAYER_TOP: {
            color: '#ff7e7e',
            fontSize: 24,
            fontWeight: 'bold',
            outlineWidth: 2,
            outlineColor: 'black',
        } as ITextStyle,
        PLAYER_BOTTOM: {
            color: '#7eb8ff',
            fontSize: 24,
            fontWeight: 'bold',
            outlineWidth: 2,
            outlineColor: 'black',
        } as ITextStyle,
        COUNTDOWN: {
            color: '#4CAF50',
            fontSize: 120,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
        } as ITextStyle,
        VS: {
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: 72,
            fontWeight: 'bold',
        } as ITextStyle,
        TITLE: {
            color: '#FFD700',
            fontSize: 30,
            height: '60px',
        } as ITextStyle,
        BODY: {
            color: '#FFFFFF',
            fontSize: 24,
            height: '50px',
        } as ITextStyle,
    },
    BUTTON: {
        PRIMARY: {
            width: '200px',
            height: '60px',
            color: '#FFFFFF',
            background: '#008000',
            fontSize: 24,
            cornerRadius: 20,
        } as IButtonStyle,
    },
    CONTAINER: {
        MAIN: {
            background: '#333333BB',
            cornerRadius: 10,
            thickness: 2,
            verticalAlignment: 2,
        } as IContainerStyle,
        END: {
            background: '#fffefebb',
            cornerRadius: 10,
            thickness: 2,
            verticalAlignment: 2,
        } as IContainerStyle,
    },
    PANEL: {
        MAIN: {
            spacing: 20,
            padding: '20px',
        } as IPanelStyle,
    },
};
