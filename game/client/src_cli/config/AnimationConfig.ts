/**
 * Animation configuration
 * Used for ball interpolation and animation thresholds
 */

export const ANIMATION = {
    BALL: {
        LARGE_JUMP_THRESHOLD: 2.0,
        BOUNCE_EXIT_THRESHOLD: 0.01,
        MIN_ROTATION_DISTANCE: 0.0001,
        LERP_FACTOR_MULTIPLIER: 2,
        MAX_BLEND_FACTOR: 0.3,
    },
    
    TEST_SCENE: {
        ROTATION_SPEED: { Y: 0.005, X: 0.002 },
    },
} as const;
