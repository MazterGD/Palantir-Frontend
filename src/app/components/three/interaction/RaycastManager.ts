import * as THREE from "three";
import { CelestialBody } from "../types";

export class RaycastManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private interactiveObjects = new Map<THREE.Object3D, CelestialBody>();
  private hoveredObject: CelestialBody | null = null;
  
  constructor(
    private camera: THREE.Camera,
    private renderer: THREE.WebGLRenderer,
    private onHighlight: (object: CelestialBody | null, highlighted: boolean) => void
  ) {}

  registerObject(objects: (THREE.Object3D | undefined)[], body: CelestialBody) {
    objects.forEach(obj => {
      if (obj) {
        this.interactiveObjects.set(obj, body);
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            this.interactiveObjects.set(child, body);
          }
        });
      }
    });
  }

  handleMouseMove = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      Array.from(this.interactiveObjects.keys()),
      true
    );

    if (intersects.length > 0) {
      const object = this.findCelestialBody(intersects[0].object);
      if (object && object !== this.hoveredObject) {
        if (this.hoveredObject) {
          this.onHighlight(this.hoveredObject, false);
        }
        this.onHighlight(object, true);
        this.hoveredObject = object;
      }
      this.renderer.domElement.style.cursor = "pointer";
    } else {
      if (this.hoveredObject) {
        this.onHighlight(this.hoveredObject, false);
        this.hoveredObject = null;
      }
      this.renderer.domElement.style.cursor = "default";
    }
  };

  handleClick = (onClick: (body: CelestialBody) => void) => (event: MouseEvent) => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      Array.from(this.interactiveObjects.keys()),
      true
    );

    if (intersects.length > 0) {
      const object = this.findCelestialBody(intersects[0].object);
      if (object) onClick(object);
    }
  };

  private findCelestialBody(obj: THREE.Object3D): CelestialBody | null {
    let current: THREE.Object3D | null = obj;
    while (current) {
      const body = this.interactiveObjects.get(current);
      if (body) return body;
      current = current.parent;
    }
    return null;
  }

  dispose() {
    this.interactiveObjects.clear();
  }
}
