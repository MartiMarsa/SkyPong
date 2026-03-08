/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */

export const AI_DIFFICULTY = {
    EASY: {
        REACTION_DELAY_FRAMES: 30,
        MAX_SPEED_MULTIPLIER: 0.55,
        ACCURACY: 0.2,
        PREDICTION_FACTOR: 0.05,
        ERROR_FREQUENCY: 0.18,
        DEGRADATION_TICK_INTERVAL: 900,     // ~15 seconds at 60fps — degrades fastest
    },
    MEDIUM: {
        REACTION_DELAY_FRAMES: 20,
        MAX_SPEED_MULTIPLIER: 0.55,
        ACCURACY: 0.4,
        PREDICTION_FACTOR: 0.1,
        ERROR_FREQUENCY: 0.12,
        DEGRADATION_TICK_INTERVAL: 1200,    // ~20 seconds at 60fps
    },
    HARD: {
        REACTION_DELAY_FRAMES: 12,
        MAX_SPEED_MULTIPLIER: 0.75,
        ACCURACY: 0.66,
        PREDICTION_FACTOR: 0.45,
        ERROR_FREQUENCY: 0.07,
        DEGRADATION_TICK_INTERVAL: 1950,    // ~32 seconds at 60fps — degrades slowest
    },
} as const;

export const AI_BEHAVIOR = {
    VELOCITY_FALLBACK: 0.1,
    MOVEMENT_THRESHOLD: 0.1,
    ERROR_MULTIPLIER: 2.0,
    SPEED_CALCULATION: {
        MIN_FACTOR: 0.5,
        MAX_FACTOR: 1.0,
    },
    DEGRADATION: {
        /** Error frequency multiplier increase per degradation level */
        ERROR_FREQ_BOOST_PER_LEVEL: 0.2,
        /** Accuracy reduction per degradation level */
        ACCURACY_PENALTY_PER_LEVEL: 0.05,
        /** How much degradation carries over after a goal (0.5 = keep half) */
        RESET_CARRY_FACTOR: 0.5,
        /** Maximum degradation level cap */
        MAX_LEVEL: 10,
        /** Floor — AI accuracy never drops below this */
        MIN_ACCURACY: 0.1,
    },
} as const;
