import { Mesh, MeshBuilder, Scene, Vector3, Space } from "@babylonjs/core";
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT } from "../config/Materials";
import { GMCN, SYNC } from '@skypong/common/constants';
import { InterpolationEngine, BounceState } from "../physics/InterpolationEngine";
import { ANIMATION } from '../config';

interface SplitPathState {
    isActive: boolean;
    impactPoint: Vector3;
    hasReachedImpact: boolean;
    startTime: number; // When bounce animation started
}

// Simple velocity tracker for speed-based decisions
interface VelocityTracker {
    lastPosition: Vector3;
    velocity: Vector3;
    lastUpdateTime: number;
}

import { BaseBall } from "@skypong/common/entities/BaseBall";

export class ClientBall extends BaseBall {
    public mesh: Mesh;
    private previousPosition: Vector3 = new Vector3();
    private targetPosition: Vector3 = new Vector3();
    private tempPosition: Vector3 = new Vector3();
    private rotationAxis: Vector3 = new Vector3();
    private bounceState: BounceState;
    private splitPathState: SplitPathState;
    private interpolationEngine: InterpolationEngine;
    private scene: Scene;
    private velocityTracker: VelocityTracker;

    constructor(scene: Scene) {
        super(scene);
        this.scene = scene;
        this.mesh = MeshBuilder.CreateSphere(
            "ball",
            { diameter: GMCN.BALL.DIAMETER },
            scene,
        );
        this.mesh.position.y = GMCN.BALL.RADIUS;

        const ballMat = MaterialFactory.CreatePBRMaterial(
            scene,
            "marble",
            MAT.INFO.MARBLE,
        );
        this.mesh.material = ballMat;

        this.previousPosition.copyFrom(this.mesh.position);

        this.interpolationEngine = new InterpolationEngine();
        this.bounceState = this.interpolationEngine.createBounceState();

        this.splitPathState = {
            isActive: false,
            impactPoint: new Vector3(),
            hasReachedImpact: false,
            startTime: 0
        };

        this.velocityTracker = {
            lastPosition: this.mesh.position.clone(),
            velocity: Vector3.Zero(),
            lastUpdateTime: performance.now()
        };
    }

    /**
     * Trigger bounce animation at impact point
     * @param x - Impact X position
     * @param z - Impact Z position
     * @param serverCollisionTime - Server timestamp when collision occurred (for staleness check)
     */
    public triggerBounce(x: number, z: number, serverCollisionTime: number = 0): void {
        // Check if collision data is too stale (high latency scenario)
        const now = performance.now();
        const staleness = now - serverCollisionTime;
        if (serverCollisionTime > 0 && staleness > SYNC.COLLISION_EXPIRY_MS) {
            // Collision data is too old, skip bounce animation
            this.splitPathState.isActive = false;
            return;
        }

        // Calculate current ball speed
        const currentSpeed = this.velocityTracker.velocity.length();

        // Skip bounce animation entirely at high speeds - visual bounce causes more glitchiness than it helps
        if (currentSpeed > SYNC.HIGH_SPEED_THRESHOLD) {
            this.splitPathState.isActive = false;
            return;
        }

        // Check initial deviation - if ball is already far from impact point, skip backward animation
        const impactPoint = new Vector3(x, this.mesh.position.y, z);
        const initialDeviation = Vector3.Distance(this.mesh.position, impactPoint);
        if (initialDeviation > SYNC.SKIP_BOUNCE_THRESHOLD) {
            // Ball has already moved too far past the impact point, skip bounce
            this.splitPathState.isActive = false;
            return;
        }

        this.splitPathState.impactPoint.copyFrom(impactPoint);
        this.splitPathState.isActive = true;
        this.splitPathState.hasReachedImpact = false;
        this.splitPathState.startTime = now;

        this.interpolationEngine.startBounce(
            this.bounceState,
            x,
            this.mesh.position.y,
            z,
            this.mesh.position
        );
    }

    public update(
        targetPosition: Vector3,
        lerpFactor: number,
        enabled: boolean,
        deltaTime: number
    ): void {
        const justEnabled = enabled && !this.mesh.isEnabled();

        this.mesh.setEnabled(enabled);

        if (enabled) {
            this.targetPosition.copyFrom(targetPosition);

            // Check for large position jump (ball respawned at center)
            // If ball moved more than ANIMATION.BALL.LARGE_JUMP_THRESHOLD units suddenly, snap to new position
            const distanceToTarget = Vector3.Distance(this.mesh.position, this.targetPosition);
            const largeJump = distanceToTarget > ANIMATION.BALL.LARGE_JUMP_THRESHOLD;

            if (justEnabled || largeJump) {
                // Snap to new position immediately (respawn or just enabled)
                this.mesh.position.copyFrom(this.targetPosition);
                this.previousPosition.copyFrom(this.targetPosition);
                this.bounceState.isActive = false;
                this.splitPathState.isActive = false;
                // Reset velocity tracker
                this.velocityTracker.lastPosition.copyFrom(this.mesh.position);
                this.velocityTracker.velocity.setAll(0);
                this.velocityTracker.lastUpdateTime = performance.now();
            } else if (this.splitPathState.isActive) {
                this.updateSplitPath(lerpFactor, deltaTime);
            } else {
                this.interpolationEngine.interpolate(
                    this.mesh.position,
                    this.targetPosition,
                    lerpFactor,
                    this.tempPosition
                );
                this.mesh.position.copyFrom(this.tempPosition);
            }
        }

        this.updateRotation();
        this.previousPosition.copyFrom(this.mesh.position);

        // Update velocity tracker for speed-based decisions
        const now = performance.now();
        const timeDelta = now - this.velocityTracker.lastUpdateTime;
        if (timeDelta > 0) {
            this.mesh.position.subtractToRef(this.velocityTracker.lastPosition, this.velocityTracker.velocity);
            // Convert to units per second
            this.velocityTracker.velocity.scaleInPlace(1000 / timeDelta);
            this.velocityTracker.lastPosition.copyFrom(this.mesh.position);
            this.velocityTracker.lastUpdateTime = now;
        }
    }

    private updateSplitPath(lerpFactor: number, deltaTime: number): void {
        // Check for deviation from server position (interrupt bounce if too far)
        const deviation = Vector3.Distance(this.mesh.position, this.targetPosition);
        const bounceDuration = performance.now() - this.splitPathState.startTime;
        const shouldInterrupt = deviation > SYNC.MAX_DEVIATION || bounceDuration > SYNC.MAX_BOUNCE_DURATION_MS;

        if (shouldInterrupt) {
            // Immediately exit bounce mode and lerp to server position
            this.splitPathState.isActive = false;
            this.interpolationEngine.interpolate(
                this.mesh.position,
                this.targetPosition,
                lerpFactor * ANIMATION.BALL.LERP_FACTOR_MULTIPLIER, // Faster lerp when interrupting
                this.tempPosition
            );
            this.mesh.position.copyFrom(this.tempPosition);
            return;
        }

        if (!this.splitPathState.hasReachedImpact) {
            const stillBouncing = this.interpolationEngine.updateBounce(
                this.bounceState,
                this.mesh.position,
                deltaTime,
                this.tempPosition
            );

            this.mesh.position.copyFrom(this.tempPosition);

            if (!stillBouncing) {
                this.splitPathState.hasReachedImpact = true;
            }
        } else {
            this.interpolationEngine.interpolate(
                this.mesh.position,
                this.targetPosition,
                lerpFactor,
                this.tempPosition
            );
            this.mesh.position.copyFrom(this.tempPosition);

            const distanceToTarget = Vector3.Distance(this.mesh.position, this.targetPosition);
            if (distanceToTarget < ANIMATION.BALL.BOUNCE_EXIT_THRESHOLD) {
                this.splitPathState.isActive = false;
            }
        }
    }

    private updateRotation(): void {
        const angle = this.interpolationEngine.calculateRollingRotation(
            this.mesh.position,
            this.previousPosition,
            GMCN.BALL.RADIUS,
            this.rotationAxis
        );

        if (angle !== 0) {
            this.mesh.rotate(this.rotationAxis, angle, Space.WORLD);
        }
    }

    public setPosition(x: number, z: number): void {
        this.mesh.position.x = x;
        this.mesh.position.z = z;
        this.previousPosition.copyFrom(this.mesh.position);
    }

    public getPosition(): Vector3 {
        return this.mesh.position;
    }

    public isBouncing(): boolean {
        return this.bounceState.isActive || this.splitPathState.isActive;
    }
}
