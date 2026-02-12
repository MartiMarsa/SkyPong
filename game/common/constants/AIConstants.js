/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */
export const AI_DIFFICULTY = {
    EASY: {
        REACTION_DELAY_FRAMES: 15,
        MAX_SPEED_MULTIPLIER: 0.4,
        ACCURACY: 0.6,
        PREDICTION_FACTOR: 0.2,
        ERROR_FREQUENCY: 0.08,
    },
    MEDIUM: {
        REACTION_DELAY_FRAMES: 8,
        MAX_SPEED_MULTIPLIER: 0.75,
        ACCURACY: 0.85,
        PREDICTION_FACTOR: 0.5,
        ERROR_FREQUENCY: 0.03,
    },
    HARD: {
        REACTION_DELAY_FRAMES: 3,
        MAX_SPEED_MULTIPLIER: 0.95,
        ACCURACY: 0.98,
        PREDICTION_FACTOR: 0.9,
        ERROR_FREQUENCY: 0.01,
    },
};
export const AI_BEHAVIOR = {
    VELOCITY_FALLBACK: 0.1,
    MOVEMENT_THRESHOLD: 0.1,
    ERROR_MULTIPLIER: 1.5,
    SPEED_CALCULATION: {
        MIN_FACTOR: 0.5,
        MAX_FACTOR: 1.0,
    },
};
