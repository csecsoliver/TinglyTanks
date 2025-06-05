// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, Assets, AssetsBundle, Sprite, Texture } from "pixi.js";
import { Tank } from "./tank";
import { crates } from "./actors";
export class Bullet {
  position: { x: number; y: number };
  rotation: number;
  speed: number = 10;
  texture: string | Texture;
  sprite: Sprite;
  app: Application;
  enemy: Tank;
  live: boolean = true;
  constructor(
    texture: Texture,
    position: { x: number; y: number },
    rotation: number,
    app: Application,
    enemy: Tank,
  ) {
    this.app = app;
    this.enemy = enemy;
    this.texture = texture;
    this.position = position;
    this.rotation = rotation;
    this.texture = texture;
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(this.position.x, this.position.y);
    this.sprite.rotation = this.rotation;
    const angle = this.rotation + Math.PI / 2;
    this.position.x += Math.cos(angle) * 47;
    this.position.y += Math.sin(angle) * 47;
    // this.loadTextures();
    app.stage.addChild(this.sprite);
    this.sprite.zIndex = 1;
    app.stage.sortableChildren = true;
    this.sprite.texture = this.texture as Texture;
    console.log("Bullet created with texture:", this.texture);
    this.sprite.setSize(10);
  }
  async loadTextures() {
    this.texture = await Assets.load(this.texture);
  }

  tick(deltaTime: number) {
    const angle = this.rotation + Math.PI / 2;
    this.position.x += Math.cos(angle) * 10 * deltaTime;
    this.position.y += Math.sin(angle) * 10 * deltaTime;
    this.sprite.position.set(this.position.x, this.position.y);
    if (
      this.enemy.body
        .getBounds()
        .containsPoint(this.position.x, this.position.y) &&
      this.live
    ) {
      this.enemy.takeDamage(10);
      this.live = false;
      this.explode("/assets/explosion.png", {
        x: this.position.x,
        y: this.position.y,
      });
      this.app.stage.removeChild(this.sprite);
    }
    for (const element of crates) {
      if (
        element.body
          .getBounds()
          .containsPoint(this.position.x, this.position.y) &&
        this.live
      ) {
        this.live = false;
        this.explode("/assets/explosion.png", {
          x: this.position.x,
          y: this.position.y,
        });
        this.app.stage.removeChild(this.sprite);
      }
    }
  }
  async explode(texture: string | Texture, position: { x: number; y: number }) {
    const explosion = new Sprite();
    explosion.anchor.set(0.5, 0.5);
    explosion.position.set(position.x, position.y);
    explosion.texture = await Assets.load(texture);
    this.app.stage.addChild(explosion);
    explosion.zIndex = 2;
    explosion.setSize(80);
    while (explosion?.visible) {
      explosion.alpha -= 0.05;
      // wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (explosion.alpha <= 0) {
        explosion.visible = false;
        this.app.stage.removeChild(explosion);
      }
    }
  }
}
