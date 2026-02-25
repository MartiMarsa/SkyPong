import { Scene, TransformNode, Vector3, ImportMeshAsync } from "@babylonjs/core";
import "@babylonjs/loaders";

export class CloudObject { // TODO insert in rendering order setup
  public rootMesh: TransformNode | null = null;
  constructor(scene: Scene, position: Vector3) {
    ImportMeshAsync("./environment/sign.glb", scene).then((result) => {
      this.rootMesh = result.meshes[0];
      if (this.rootMesh) {
        this.rootMesh.setAbsolutePosition(position);
      }
    });
  }
}
