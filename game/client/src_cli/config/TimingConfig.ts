/**
 * Client timing configuration
 * Used for countdowns, collision windows, and client-side timing
 */

export const CLIENT_TIMING = {
    COUNTDOWN: {
        DURATION_SECONDS: 3,
        INTERVAL_MS: 1000,
    },
    
    COLLISION: {
        WINDOW_MS: 200,
    },
} as const;
