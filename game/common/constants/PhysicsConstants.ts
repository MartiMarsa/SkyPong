/**
 * Physics constants shared between client and server
 * Server uses these for authoritative physics calculations
 * Client uses these for visual effects and predictions
 */

export const PHYSICS = {
    GRAVITY: -0.01,
    
    BALL: {
        BOUNCE_RESTITUTION: 1.0,
        FRICTION: 0.0,
        MASS: 1.0,
        MAX_SPEED: 1.0,
    },
    
    PADDLE: {
        BOUNCE_RESTITUTION: 1.0,
        FRICTION: 0.0,
        MASS: 1.0,
    },
    
    COLLISION: {
        MAX_DISTANCE_SQ: 4.0,
        PADDLE_OFFSET: 0.0,
        /** Threshold for paddle collision detection */
        PADDLE_COLLISION_THRESHOLD: 0.1,
    },
    
    RESPAWN: {
        DELAY_MS: 1000,  // 1 second before respawn
        FALL_THRESHOLD: -5,
    },
    
    /** Physics response parameters for collisions and ball behavior */
    RESPONSE: {
        /** Speed boost multiplier when ball bounces off walls */
        WALL_SPEED_BOOST: 1.02,

        /** Maximum bounce angle in degrees when ball hits paddle edge */
        MAX_BOUNCE_ANGLE_DEG: 70,

        /** Speed multiplier for edge hits on paddle (0.2 = 20% speed increase at edges) */
        EDGE_SPEED_MULTIPLIER: 0.2,
    },

    /** Ball launch parameters for serving */
    LAUNCH: {
        /** Minimum angle from Z axis (degrees) */
        MIN_ANGLE_DEG: 10,
        /** Maximum angle from Z axis (degrees) */
        MAX_ANGLE_DEG: 45,
        /** Base speed magnitude */
        BASE_SPEED: 0.05,
    },
} as const;

export const INTERPOLATION = {
    DEFAULT_SPEED: 18.0,      // Increased for faster response
    COLLISION_SPEED: 35.0,    // Much higher speed during collisions for tighter sync
    PADDLE_SPEED: 0.1,

    BOUNCE: {
        MIN_SPEED: 0.012,     // Faster minimum for high-speed responsiveness
        MAX_SPEED: 0.035,     // Higher max to keep up with fast ball
        MIN_DISTANCE: 0.03,   // Smaller threshold for quicker phase transitions
    },
} as const;

// Client-server synchronization constants
export const SYNC = {
    // Maximum allowed deviation between client visual ball and server authoritative position
    // Tighter value (0.25) prevents visible desync at high speeds
    MAX_DEVIATION: 0.25,

    // Ignore collision data older than this (milliseconds)
    // Reduced to 100ms for tighter sync at high speeds
    COLLISION_EXPIRY_MS: 100,

    // Maximum duration for visual bounce animation (milliseconds)
    // Reduced to 80ms - at MAX_SPEED=1.0, ball moves 0.08 units in 80ms
    MAX_BOUNCE_DURATION_MS: 80,

    // Skip bounce animation if initial deviation exceeds this threshold
    // Prevents animating backward when ball has already moved far past impact
    SKIP_BOUNCE_THRESHOLD: 0.4,

    // Ball speed threshold to skip bounce animation entirely
    // At speeds above this, bounce visual effect is skipped for smoother sync
    HIGH_SPEED_THRESHOLD: 0.7,
} as const;
