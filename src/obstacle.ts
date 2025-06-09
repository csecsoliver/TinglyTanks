import { Application, Assets, Sprite, Texture } from "pixi.js";
import { Bullet } from "./bulle";
import Victor from "victor";
import { Tank } from "./tank";

export class Obstacle {
  position: { x: number; y: number };
  rotation: number;

  bodyTexture: Texture | string;
  body: Sprite;
  speed: number = 0;
  slide: Victor = new Victor(0, 0);
  stuff: { [key: string]: boolean | string } = {};
  app: Application;
  bullets: Bullet[] = [];
  fireCooldown: number = 0;
  constructor(bodyTexture: string, app: Application) {
    this.app = app;
    this.position = { x: 0, y: 0 };
    this.rotation = Math.random() * Math.PI * 2;
    this.bodyTexture = bodyTexture;
    this.body = new Sprite();
    this.body.anchor.set(0.5);
    this.body.position.set(this.position.x, this.position.y);
    this.body.rotation = this.rotation;
    this.loadTextures();
    app.stage.addChild(this.body);
    this.body.zIndex = 0;
    app.stage.sortableChildren = true;
    this.body.setSize(0.7, 0.7);
  }
  async loadTextures() {
    this.bodyTexture = await Assets.load(this.bodyTexture);
    this.body.texture = this.bodyTexture as Texture;
  }
  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.body.position.set(x, y);
  }
  changePosition(x: number, y: number) {
    this.position.x += x;
    this.position.y += y;
    this.body.position.set(this.position.x, this.position.y);
  }
  setRotation(rotation: number) {
    this.rotation = rotation;
    this.body.rotation = rotation;
  }
  changeRotation(rotation: number) {
    this.rotation += rotation;
    this.body.rotation += rotation;
  }
  go(direction: true | false, speed: number) {
    const angle = this.rotation + (direction ? Math.PI / 2 : -Math.PI / 2);
    this.position.x += Math.cos(angle) * speed;
    this.position.y += Math.sin(angle) * speed;
    this.body.position.set(this.position.x, this.position.y);
  }
  tick(deltaTime: number) {
    if (this.position.x < 0) {
      this.changePosition(1, 0);
      this.speed = -this.speed * 0.3;
    }
    if (this.position.x > this.app.screen.width) {
      this.changePosition(-1, 0);
      this.speed = -this.speed * 0.3;
    }
    if (this.position.y < 0) {
      this.changePosition(0, 1);
      this.speed = -this.speed * 0.3;
    }
    if (this.position.y > this.app.screen.height) {
      this.changePosition(0, -1);
      this.speed = -this.speed * 0.3;
    }
    this.changePosition(this.slide.x * deltaTime, this.slide.y * deltaTime);
    this.slide.multiplyScalar(0.9 * deltaTime);
  }
  bounce(otherTank: Tank | Obstacle) {
    otherTank.slide.add(
      new Victor(
        (otherTank.position.x - this.position.x) * 0.003,
        (otherTank.position.y - this.position.y) * 0.003,
      ),
    );
    otherTank.speed = 0;
  }
}
