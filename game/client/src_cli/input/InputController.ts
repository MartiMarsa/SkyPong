import { Scene, KeyboardEventTypes, Observer, KeyboardInfo } from "@babylonjs/core";

export class InputController {
    public inputMap: { [key: string]: boolean } = {};
    private _keyboardObserver: Observer<KeyboardInfo> | null = null;

    constructor(scene: Scene) {
        this.inputMap = {};

        this._keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[key] = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[key] = false;
                    break;
            }
        });
    }

    public dispose(): void {
        this.inputMap = {};
        this._keyboardObserver = null;
    }
}
