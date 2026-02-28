import { Vector3 } from "@babylonjs/core";
import { GUI_STYLES } from '../config';

export class DebugMonitor {
    private container: HTMLDivElement;
    private xDisplay: HTMLSpanElement;
    private yDisplay: HTMLSpanElement;
    private zDisplay: HTMLSpanElement;
    private camXDisplay: HTMLSpanElement;
    private camYDisplay: HTMLSpanElement;
    private camZDisplay: HTMLSpanElement;
    private enabledDisplay: HTMLSpanElement;
    private collisionDisplay: HTMLSpanElement;
    private speedDisplay: HTMLSpanElement;
    private updateCounter: number = 0;

    constructor() {
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.bottom = GUI_STYLES.UI_POSITIONING.DEBUG.BOTTOM;
        this.container.style.left = GUI_STYLES.UI_POSITIONING.DEBUG.LEFT;
        this.container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        this.container.style.color = "#00ff00";
        this.container.style.fontFamily = "monospace";
        this.container.style.fontSize = "12px";
        this.container.style.padding = "8px";
        this.container.style.borderRadius = "4px";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = "1000";
        this.container.style.minWidth = "150px";
        this.container.style.lineHeight = "1.5";

        this.xDisplay = document.createElement("span");
        this.xDisplay.textContent = "X: 0.00";
        this.container.appendChild(this.xDisplay);
        this.container.appendChild(document.createElement("br"));

        this.yDisplay = document.createElement("span");
        this.yDisplay.textContent = "Y: 0.00";
        this.container.appendChild(this.yDisplay);
        this.container.appendChild(document.createElement("br"));

        this.zDisplay = document.createElement("span");
        this.zDisplay.textContent = "Z: 0.00";
        this.container.appendChild(this.zDisplay);
        this.container.appendChild(document.createElement("br"));

        this.camXDisplay = document.createElement("span");
        this.camXDisplay.textContent = "Cam X: 0.00";
        this.container.appendChild(this.camXDisplay);
        this.container.appendChild(document.createElement("br"));

        this.camYDisplay = document.createElement("span");
        this.camYDisplay.textContent = "Cam Y: 0.00";
        this.container.appendChild(this.camYDisplay);
        this.container.appendChild(document.createElement("br"));

        this.camZDisplay = document.createElement("span");
        this.camZDisplay.textContent = "Cam Z: 0.00";
        this.container.appendChild(this.camZDisplay);
        this.container.appendChild(document.createElement("br"));

        this.enabledDisplay = document.createElement("span");
        this.enabledDisplay.textContent = "Enabled: false";
        this.container.appendChild(this.enabledDisplay);

        this.container.appendChild(document.createElement("br"));
        this.collisionDisplay = document.createElement("span");
        this.collisionDisplay.textContent = "Collision: false";
        this.container.appendChild(this.collisionDisplay);

        this.container.appendChild(document.createElement("br"));
        this.speedDisplay = document.createElement("span");
        this.speedDisplay.textContent = "Speed: 0.00";
        this.container.appendChild(this.speedDisplay);

        document.body.appendChild(this.container);
    }

    public update(
        position: Vector3,
        cameraPosition: Vector3,
        enabled: boolean,
        collisionDetected: boolean,
        speed: number,
    ): void {
        this.updateCounter++;
        if (this.updateCounter < GUI_STYLES.UI_POSITIONING.DEBUG.UPDATE_INTERVAL_FRAMES) return;
        this.updateCounter = 0;

        this.xDisplay.textContent = `X: ${position.x.toFixed(2)}`;
        this.yDisplay.textContent = `Y: ${position.y.toFixed(2)}`;
        this.zDisplay.textContent = `Z: ${position.z.toFixed(2)}`;
        this.camXDisplay.textContent = `Cam X: ${cameraPosition.x.toFixed(2)}`;
        this.camYDisplay.textContent = `Cam Y: ${cameraPosition.y.toFixed(2)}`;
        this.camZDisplay.textContent = `Cam Z: ${cameraPosition.z.toFixed(2)}`;
        this.enabledDisplay.textContent = `Enabled: ${enabled}`;
        this.collisionDisplay.textContent = `Collision: ${collisionDetected}`;
        this.speedDisplay.textContent = `Speed: ${speed.toFixed(2)}`;
    }

    public dispose(): void {
        this.container.remove();
    }
}
