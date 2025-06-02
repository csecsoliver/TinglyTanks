// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, Assets, AssetsBundle, Sprite, Texture } from "pixi.js";
export class Tank {
  position: { x: number; y: number };
  rotation: number;

  bodyTexture: Texture | string;
  barrelTexture: Texture | string;
  body: Sprite;
  barrel: Sprite;
  speed: number = 0;
  constructor(bodyTexture: string, barrelTexture: string, app: Application) {
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.bodyTexture = bodyTexture;
    this.barrelTexture = barrelTexture;
    this.body = new Sprite();
    this.barrel = new Sprite();
    this.body.anchor.set(0.5);
    this.barrel.anchor.set(0.5, 0.15);
    this.body.position.set(this.position.x, this.position.y);
    this.barrel.position.set(this.position.x, this.position.y);
    this.body.rotation = this.rotation;
    this.barrel.rotation = this.rotation;
    this.loadTextures();
    app.stage.addChild(this.body);
    app.stage.addChild(this.barrel);
    this.body.zIndex = 0;
    this.barrel.zIndex = 1;
    app.stage.sortableChildren = true;
  }
  async loadTextures() {
    this.bodyTexture = await Assets.load(this.bodyTexture);
    this.barrelTexture = await Assets.load(this.barrelTexture);
    this.body.texture = this.bodyTexture as Texture;
    this.barrel.texture = this.barrelTexture as Texture;
  }
  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.body.position.set(x, y);
    this.barrel.position.set(x, y);
  }
  changePosition(x: number, y: number) {
    this.position.x += x;
    this.position.y += y;
    this.body.position.set(this.position.x, this.position.y);
    this.barrel.position.set(this.position.x, this.position.y);
  }
  setRotation(rotation: number) {
    this.rotation = rotation;
    this.body.rotation = rotation;
    this.barrel.rotation = rotation;
  }
  changeRotation(rotation: number) {
    this.rotation += rotation;
    this.body.rotation += rotation;
    this.barrel.rotation += rotation;
  }
  changeBarrelRotation(rotation: number) {
    this.barrel.rotation += rotation;
  }
  setBarrelRotation(rotation: number) {
    this.barrel.rotation = rotation;
  }
  go(direction: true | false, speed: number) {
    const angle = this.rotation + (direction ? Math.PI / 2 : -Math.PI / 2);
    this.position.x += Math.cos(angle) * speed;
    this.position.y += Math.sin(angle) * speed;
    this.body.position.set(this.position.x, this.position.y);
    this.barrel.position.set(this.position.x, this.position.y);
  }
  tick(deltaTime: number) {
    this.go(true, this.speed * deltaTime);
  }
}
