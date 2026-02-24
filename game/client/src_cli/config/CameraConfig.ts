/**
 * Camera configuration
 * Used by Camera utility and test scenes
 */

import { Vector3 } from '@babylonjs/core';

export const CAMERA = {
    DEFAULT_POSITION: new Vector3(0, 10, -20),
    TOP_DOWN_POSITION: new Vector3(30,50,0),
    MARGIN: 1.2,
    
    TEST_SCENE: {
        ALPHA: Math.PI / 4,
        BETA: Math.PI / 2.5,
        RADIUS: 5,
        MIN_Z: 0.1,
        WHEEL_PRECISION: 50,
    },
} as const;
