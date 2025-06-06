import { Application, Assets, Sprite, Texture } from "pixi.js";
import { Bullet } from "./bulle";
import Victor from "victor";
import { Tank } from "./tank";
import { Obstacle } from "./obstacle";

export class Jumppad {
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
    this.rotation = 0;
    this.bodyTexture = bodyTexture;
    this.body = new Sprite();
    this.body.anchor.set(0.5);
    this.body.position.set(this.position.x, this.position.y);
    this.body.rotation = this.rotation;
    this.loadTextures();
    app.stage.addChild(this.body);
    this.body.zIndex = 0;
    app.stage.sortableChildren = true;
    this.body.setSize(0.7);
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
