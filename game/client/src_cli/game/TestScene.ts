import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    MeshBuilder,
    RenderTargetTexture,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { EngineSetup } from "../rendering/EngineSetup";
import { SceneLights } from "../rendering/SceneLights";
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT } from "../config/Materials";
import { CAMERA, ANIMATION } from '../config';
import { GameUIManager } from '../ui/GameUIManager';
import { TouchControls } from '../ui/TouchControls';

export class TestScene {
    private engine: Engine;
    private scene: Scene;
    private _engineSetup: EngineSetup;
    private _resizeHandler: (() => void) | null = null;
    private _uiManager: GameUIManager | null = null;
    private _touchControls: TouchControls | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this._engineSetup = new EngineSetup(canvas);
        this.engine = this._engineSetup.engine;
        this.scene = this._engineSetup.scene;
        this.init();
    }

    public dispose(): void {
        if (this._resizeHandler) {
            window.removeEventListener("resize", this._resizeHandler);
            this._resizeHandler = null;
        }
        this._touchControls?.hideControls();
        this._uiManager?.dispose();
        this._engineSetup.dispose();
        this.engine.dispose();
    }

    async init() {
        SceneLights.Create(this.scene);

        if (this.scene.activeCamera) {
            this.scene.activeCamera.detachControl();
            this.scene.activeCamera.dispose();
        }

        const camera = new ArcRotateCamera(
            "debugCamera",
            CAMERA.TEST_SCENE.ALPHA,
            CAMERA.TEST_SCENE.BETA,
            CAMERA.TEST_SCENE.RADIUS,
            Vector3.Zero(),
            this.scene
        );
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        camera.minZ = CAMERA.TEST_SCENE.MIN_Z;
        camera.wheelPrecision = CAMERA.TEST_SCENE.WHEEL_PRECISION;

        // Create UI Manager
        this._uiManager = new GameUIManager(this.scene, () => {
            console.log('[TestScene] Back to menu clicked');
        }, undefined);
        this._uiManager.showGameHUD('Player 1', 'Player 2');
        this._uiManager.hud.updateScores(5, 3, '10');

        // Create Touch Controls
        this._touchControls = new TouchControls(this._uiManager.texture);
        this._touchControls.showControls();

        const ball = MeshBuilder.CreateBox(
            "testBall",
            { size: 1 },
            this.scene
        );

        ball.position = new Vector3(0, -0.5, 0);

        const ballMat = MaterialFactory.CreatePBRMaterial(
            this.scene,
            "clearglass",
            MAT.INFO.CLEARGLASS
        );

        const ground = MeshBuilder.CreateGround(
            "ground",
            { width: 5, height: 5 },
            this.scene
        );

        const groundMat = MaterialFactory.CreatePBRMaterial(
            this.scene,
            "woodfloor",
            MAT.INFO.WOODFLOOR
        )

        ground.position.y = -1;
        ground.material = groundMat;
        ground.renderingGroupId = 0;

        ball.material = ballMat;
        ball.renderingGroupId = 1;

        if (ballMat.subSurface.refractionTexture) {
            const refractionTexture = ballMat.subSurface.refractionTexture as RenderTargetTexture;
            const skybox = this.scene.getMeshByName("hdrSkyBox");
            refractionTexture.renderList = skybox ? [ground, skybox] : [ground];
        }

        this.engine.runRenderLoop(() => {
            this.scene.render();
            ball.rotation.y += ANIMATION.TEST_SCENE.ROTATION_SPEED.Y;
            ball.rotation.x += ANIMATION.TEST_SCENE.ROTATION_SPEED.X;
        });

        this._resizeHandler = () => {
            this.engine.resize();
        };
        window.addEventListener("resize", this._resizeHandler);
    }
}
