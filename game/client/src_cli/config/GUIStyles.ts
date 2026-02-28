import { Control } from '@babylonjs/gui';

export interface ITextStyleEx extends ITextStyle {
    horizontalAlignment?: number;
    verticalAlignment?: number;
    top?: string;
}

export interface IButtonStyleEx extends IButtonStyle {
    horizontalAlignment?: number;
    verticalAlignment?: number;
    top?: string;
    zIndex?: number;
}

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

export interface ITouchContainerStyle {
    height: string;
    horizontalAlignment: number;
    verticalAlignment: number;
}

export interface ITouchButtonStyle {
    width: string;
    height: string;
    color: string;
    background: string;
    text: string;
    paddingRight?: string;
    paddingLeft?: string;
    iconUrl?: string;
    iconWidth?: string;
    iconHeight?: string;
}

export interface IUIPositioning {
    HUD: {
        PLAYER1: {
            NAME_TOP: string;
            SCORE_TOP: string;
            SCORE_FONT_SIZE: string;
        };
        PLAYER2: {
            NAME_TOP: string;
            SCORE_TOP: string;
            SCORE_FONT_SIZE: string;
        };
    };
    GAME_OVER: {
        TITLE: { TOP: string; FONT_SIZE: number; OUTLINE_WIDTH: number };
        WINNER: { TOP: string; FONT_SIZE: number; OUTLINE_WIDTH: number };
        SCORE: { TOP: string; FONT_SIZE: number };
        BUTTON: { TOP: string; WIDTH: string; HEIGHT: string };
    };
    DEBUG: {
        BOTTOM: string;
        LEFT: string;
        UPDATE_INTERVAL_FRAMES: number;
    };
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
        GAME_OVER_TITLE: {
            color: '#FFD700',
            fontSize: 64,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
        } as ITextStyle,
        GAME_OVER_WINNER: {
            color: '#FFFFFF',
            fontSize: 48,
            fontWeight: 'bold',
            outlineWidth: 3,
            outlineColor: 'black',
        } as ITextStyle,
        GAME_OVER_SCORE: {
            color: '#AAAAAA',
            fontSize: 36,
            fontWeight: 'bold',
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
        GAME_OVER: {
            width: '300px',
            height: '70px',
            color: '#FFFFFF',
            background: '#4CAF50',
            fontSize: 24,
            cornerRadius: 10,
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
        GAME_OVER: {
            background: 'rgba(0, 0, 0, 0.8)',
            cornerRadius: 0,
            thickness: 0,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        } as IContainerStyle,
    },
    PANEL: {
        MAIN: {
            spacing: 20,
            padding: '20px',
        } as IPanelStyle,
    },
    TOUCH_CONTROLS: {
        CONTAINER: {
            height: '80px',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
        } as ITouchContainerStyle,
        BUTTON_LEFT: {
            width: '80px',
            height: '60px',
            color: 'white',
            background: 'transparent',
            text: '',
            paddingRight: '20px',
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xNi41IDUuNjdsLTUuNzUgNS43NUw1LjY3IDE2LjUiLz48L3N2Zz4=',
            iconWidth: '48px',
            iconHeight: '48px',
        } as ITouchButtonStyle,
        BUTTON_RIGHT: {
            width: '80px',
            height: '60px',
            color: 'white',
            background: 'transparent',
            text: '',
            paddingLeft: '20px',
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik03LjUgNS42N2w1Ljc1IDUuNzVMMTguMzEgMTYuNSIvPjwvc3ZnPg==',
            iconWidth: '48px',
            iconHeight: '48px',
        } as ITouchButtonStyle,
    },
    UI_POSITIONING: {
        HUD: {
            PLAYER1: {
                NAME_TOP: '-100px',
                SCORE_TOP: '-50px',
                SCORE_FONT_SIZE: '48px',
            },
            PLAYER2: {
                NAME_TOP: '60px',
                SCORE_TOP: '110px',
                SCORE_FONT_SIZE: '48px',
            },
        },
        GAME_OVER: {
            TITLE: { TOP: '-200px', FONT_SIZE: 64, OUTLINE_WIDTH: 4 },
            WINNER: { TOP: '-80px', FONT_SIZE: 48, OUTLINE_WIDTH: 3 },
            SCORE: { TOP: '20px', FONT_SIZE: 36 },
            BUTTON: { TOP: '150px', WIDTH: '300px', HEIGHT: '70px' },
        },
        DEBUG: {
            BOTTOM: '10px',
            LEFT: '10px',
            UPDATE_INTERVAL_FRAMES: 3,
        },
    } as IUIPositioning,

    HUD: {
        PLAYER1_NAME: {
            color: '#7eb8ff',
            fontSize: 24,
            fontWeight: 'bold',
            outlineWidth: 2,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
            top: '-100px',
        } as ITextStyleEx,
        PLAYER1_SCORE: {
            color: '#4CAF50',
            fontSize: 48,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
            top: '-50px',
        } as ITextStyleEx,
        PLAYER2_NAME: {
            color: '#ff7e7e',
            fontSize: 24,
            fontWeight: 'bold',
            outlineWidth: 2,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
            top: '60px',
        } as ITextStyleEx,
        PLAYER2_SCORE: {
            color: '#4CAF50',
            fontSize: 48,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
            top: '110px',
        } as ITextStyleEx,
        COUNTDOWN: {
            color: '#4CAF50',
            fontSize: 120,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        } as ITextStyleEx,
    },

    GAME_OVER: {
        CONTAINER: {
            background: 'rgba(0, 0, 0, 0.8)',
            cornerRadius: 0,
            thickness: 0,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        } as IContainerStyle,
        TITLE: {
            color: '#FFD700',
            fontSize: 64,
            fontWeight: 'bold',
            outlineWidth: 4,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
            top: '-200px',
        } as ITextStyleEx,
        WINNER: {
            color: '#FFFFFF',
            fontSize: 48,
            fontWeight: 'bold',
            outlineWidth: 3,
            outlineColor: 'black',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
            top: '-80px',
        } as ITextStyleEx,
        SCORE: {
            color: '#AAAAAA',
            fontSize: 36,
            fontWeight: 'bold',
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
            top: '20px',
        } as ITextStyleEx,
        BUTTON: {
            width: '300px',
            height: '70px',
            color: '#FFFFFF',
            background: '#4CAF50',
            fontSize: 24,
            cornerRadius: 10,
            horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
            top: '150px',
            zIndex: 101,
        } as IButtonStyleEx,
    },
};
