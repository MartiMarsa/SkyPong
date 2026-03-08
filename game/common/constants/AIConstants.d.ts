/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */
export declare const AI_DIFFICULTY: {
    readonly EASY: {
        readonly REACTION_DELAY_FRAMES: 30;
        readonly MAX_SPEED_MULTIPLIER: 0.55;
        readonly ACCURACY: 0.2;
        readonly PREDICTION_FACTOR: 0.05;
        readonly ERROR_FREQUENCY: 0.18;
        readonly DEGRADATION_TICK_INTERVAL: 900;
    };
    readonly MEDIUM: {
        readonly REACTION_DELAY_FRAMES: 20;
        readonly MAX_SPEED_MULTIPLIER: 0.55;
        readonly ACCURACY: 0.4;
        readonly PREDICTION_FACTOR: 0.1;
        readonly ERROR_FREQUENCY: 0.12;
        readonly DEGRADATION_TICK_INTERVAL: 1200;
    };
    readonly HARD: {
        readonly REACTION_DELAY_FRAMES: 12;
        readonly MAX_SPEED_MULTIPLIER: 0.75;
        readonly ACCURACY: 0.66;
        readonly PREDICTION_FACTOR: 0.45;
        readonly ERROR_FREQUENCY: 0.07;
        readonly DEGRADATION_TICK_INTERVAL: 1950;
    };
};
export declare const AI_BEHAVIOR: {
    readonly VELOCITY_FALLBACK: 0.1;
    readonly MOVEMENT_THRESHOLD: 0.1;
    readonly ERROR_MULTIPLIER: 2.0;
    readonly SPEED_CALCULATION: {
        readonly MIN_FACTOR: 0.5;
        readonly MAX_FACTOR: 1;
    };
    readonly DEGRADATION: {
        readonly ERROR_FREQ_BOOST_PER_LEVEL: 0.2;
        readonly ACCURACY_PENALTY_PER_LEVEL: 0.05;
        readonly RESET_CARRY_FACTOR: 0.5;
        readonly MAX_LEVEL: 10;
        readonly MIN_ACCURACY: 0.1;
    };
};
    readonly MEDIUM: {
        readonly REACTION_DELAY_FRAMES: 10;
        readonly MAX_SPEED_MULTIPLIER: 0.75;
        readonly ACCURACY: 0.7;
        readonly PREDICTION_FACTOR: 0.4;
        readonly ERROR_FREQUENCY: 0.05;
    };
    readonly HARD: {
        readonly REACTION_DELAY_FRAMES: 4;
        readonly MAX_SPEED_MULTIPLIER: 0.95;
        readonly ACCURACY: 0.92;
        readonly PREDICTION_FACTOR: 0.8;
        readonly ERROR_FREQUENCY: 0.02;
    };
};
export declare const AI_BEHAVIOR: {
    readonly VELOCITY_FALLBACK: 0.1;
    readonly MOVEMENT_THRESHOLD: 0.1;
    readonly ERROR_MULTIPLIER: 2.0;
    readonly SPEED_CALCULATION: {
        readonly MIN_FACTOR: 0.5;
        readonly MAX_FACTOR: 1;
    };
};
