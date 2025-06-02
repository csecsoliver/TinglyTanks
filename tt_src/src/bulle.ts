// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, Assets, AssetsBundle, Sprite, Texture } from "pixi.js";
export class Bullet {
  position: { x: number; y: number };
  rotation: number;
  speed: number = 10;
  texture: string | Texture;
  sprite: Sprite;
  app: Application;
  constructor(
    texture: Texture,
    position: { x: number; y: number },
    rotation: number,
    app: Application,
  ) {
    this.app = app;
    this.texture = texture;
    this.position = position;
    this.rotation = rotation;
    this.texture = texture;
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(this.position.x, this.position.y);
    this.sprite.rotation = this.rotation;
    const angle = this.rotation + Math.PI / 2;
    this.position.x += Math.cos(angle) * 15;
    this.position.y += Math.sin(angle) * 15;
    // this.loadTextures();
    app.stage.addChild(this.sprite);
    this.sprite.zIndex = 1;
    app.stage.sortableChildren = true;
    this.sprite.texture = this.texture as Texture;
    console.log("Bullet created with texture:", this.texture);
  }
  async loadTextures() {
    this.texture = await Assets.load(this.texture);
  }

  tick(deltaTime: number) {
    const angle = this.rotation + Math.PI / 2;
    this.position.x += Math.cos(angle) * 10 * deltaTime;
    this.position.y += Math.sin(angle) * 10 * deltaTime;
    this.sprite.position.set(this.position.x, this.position.y);
  }
}
