import { Vector3 } from "@babylonjs/core";
import { INTERPOLATION } from '@skypong/common/constants';
import { ANIMATION } from '../config';

export interface InterpolationConfig {
    defaultSpeed: number;
    collisionSpeed: number;
    minSpeed: number;
    maxSpeed: number;
    minDistance: number;
}

export interface BounceState {
    isActive: boolean;
    target: Vector3;
    direction: Vector3;
    totalDistance: number;
}

export class InterpolationEngine {
    private config: InterpolationConfig;
    private tempVector: Vector3 = new Vector3();

    constructor(config: Partial<InterpolationConfig> = {}) {
        this.config = {
            defaultSpeed: config.defaultSpeed ?? INTERPOLATION.DEFAULT_SPEED,
            collisionSpeed: config.collisionSpeed ?? INTERPOLATION.COLLISION_SPEED,
            minSpeed: config.minSpeed ?? INTERPOLATION.BOUNCE.MIN_SPEED,
            maxSpeed: config.maxSpeed ?? INTERPOLATION.BOUNCE.MAX_SPEED,
            minDistance: config.minDistance ?? INTERPOLATION.BOUNCE.MIN_DISTANCE,
        };
    }

    public calculateLerpFactor(deltaTime: number, isCollision: boolean): number {
        const speed = isCollision ? this.config.collisionSpeed : this.config.defaultSpeed;
        return 1 - Math.exp(-speed * (deltaTime / 1000));
    }

    public interpolate(
        current: Vector3,
        target: Vector3,
        lerpFactor: number,
        out: Vector3
    ): void {
        Vector3.LerpToRef(current, target, lerpFactor, out);
    }

    public startBounce(bounceState: BounceState, targetX: number, targetY: number, targetZ: number, currentPosition: Vector3): void {
        bounceState.isActive = true;
        bounceState.target.set(targetX, targetY, targetZ);
        bounceState.target.subtractToRef(currentPosition, bounceState.direction);
        bounceState.totalDistance = Math.max(bounceState.direction.length(), this.config.minDistance);
        
        if (bounceState.totalDistance > 0) {
            bounceState.direction.normalize();
        }
    }

    public updateBounce(
        bounceState: BounceState,
        currentPosition: Vector3,
        deltaTime: number,
        out: Vector3
    ): boolean {
        if (!bounceState.isActive) {
            out.copyFrom(currentPosition);
            return false;
        }

        bounceState.target.subtractToRef(currentPosition, this.tempVector);
        const remainingDistance = this.tempVector.length();

        if (remainingDistance <= 0) {
            bounceState.isActive = false;
            out.copyFrom(bounceState.target);
            return false;
        }

        const progress = Math.min(1.0, 1.0 - (remainingDistance / bounceState.totalDistance));
        const easedProgress = progress * progress * (3 - 2 * progress);

        const speedRange = this.config.maxSpeed - this.config.minSpeed;
        const speed = this.config.minSpeed + speedRange * (1 - Math.abs(easedProgress - 0.5) * 2);
        const step = speed * deltaTime;

        if (remainingDistance <= step) {
            out.copyFrom(bounceState.target);
            bounceState.isActive = false;
            return false;
        }

        const blendFactor = Math.min(ANIMATION.BALL.MAX_BLEND_FACTOR, remainingDistance * 0.5);
        out.set(
            currentPosition.x + bounceState.direction.x * step * (1 + blendFactor),
            currentPosition.y + bounceState.direction.y * step * (1 + blendFactor),
            currentPosition.z + bounceState.direction.z * step * (1 + blendFactor)
        );

        return true;
    }

    public calculateRollingRotation(
        currentPosition: Vector3,
        previousPosition: Vector3,
        radius: number,
        outAxis: Vector3
    ): number {
        const displacementX = currentPosition.x - previousPosition.x;
        const displacementZ = currentPosition.z - previousPosition.z;
        const distance = Math.sqrt(displacementX * displacementX + displacementZ * displacementZ);

        if (distance < ANIMATION.BALL.MIN_ROTATION_DISTANCE) {
            return 0;
        }

        outAxis.set(-displacementZ, 0, displacementX);
        outAxis.normalize();

        return -distance / radius;
    }

    public createBounceState(): BounceState {
        return {
            isActive: false,
            target: new Vector3(),
            direction: new Vector3(),
            totalDistance: 0,
        };
    }
}
