/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */
export declare const AI_DIFFICULTY: {
    readonly EASY: {
        readonly REACTION_DELAY_FRAMES: 15;
        readonly MAX_SPEED_MULTIPLIER: 0.4;
        readonly ACCURACY: 0.6;
        readonly PREDICTION_FACTOR: 0.2;
        readonly ERROR_FREQUENCY: 0.08;
    };
    readonly MEDIUM: {
        readonly REACTION_DELAY_FRAMES: 8;
        readonly MAX_SPEED_MULTIPLIER: 0.75;
        readonly ACCURACY: 0.85;
        readonly PREDICTION_FACTOR: 0.5;
        readonly ERROR_FREQUENCY: 0.03;
    };
    readonly HARD: {
        readonly REACTION_DELAY_FRAMES: 3;
        readonly MAX_SPEED_MULTIPLIER: 0.95;
        readonly ACCURACY: 0.98;
        readonly PREDICTION_FACTOR: 0.9;
        readonly ERROR_FREQUENCY: 0.01;
    };
};
export declare const AI_BEHAVIOR: {
    readonly VELOCITY_FALLBACK: 0.1;
    readonly MOVEMENT_THRESHOLD: 0.1;
    readonly ERROR_MULTIPLIER: 1.5;
    readonly SPEED_CALCULATION: {
        readonly MIN_FACTOR: 0.5;
        readonly MAX_FACTOR: 1;
    };
};
