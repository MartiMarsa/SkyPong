/**
 * Visual configuration for colors, UI positioning, and visual effects
 * Used by game entities and UI components
 */

import { Color3 } from '@babylonjs/core';

export const VISUAL = {
    PADDLES: {
        PLAYER1: {
            ALBEDO: new Color3(0.2, 0.4, 1.0),
            TINT: new Color3(0.7, 0.8, 1.0),
        },
        PLAYER2: {
            ALBEDO: new Color3(1.0, 0.2, 0.2),
            TINT: new Color3(1.0, 0.7, 0.7),
        },
    },
    
    SMOOTHING: {
        PADDLE_LERP_SPEED: 10.0,
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
    },
} as const;
