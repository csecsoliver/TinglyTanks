import { Application, Assets, Sprite, Texture } from "pixi.js";
import { Bullet } from "./bulle";
import Victor from "victor";
import { Obstacle } from "./obstacle";

export class Tank {
  position: { x: number; y: number };
  rotation: number;
  health: number = 100;
  bodyTexture: Texture | string;
  barrelTexture: Texture | string;
  bulletTexture: Texture | string;
  body: Sprite;
  barrel: Sprite;
  speed: number = 0;
  slide: Victor = new Victor(0, 0);
  keybinds: {
    forward: string;
    backward: string;
    left: string;
    right: string;
    action: string;
  };
  color: string; // default color
  mode: boolean = true; // true = tank, false = turret
  stuff: { [key: string]: boolean | string } = {};
  app: Application;
  bullets: Bullet[] = [];
  fireCooldown: number = 0;
  enemy: Tank | null = null;
  constructor(
    bodyTexture: string,
    barrelTexture: string,
    app: Application,
    keybinds: {
      forward: string;
      backward: string;
      left: string;
      right: string;
      action: string;
    } = {
      forward: "",
      backward: "",
      left: "",
      right: "",
      action: "",
    },
    bulletTexture: string,
    rotation: number, // 135 degrees in radians
  ) {
    this.app = app;

    this.keybinds = keybinds;
    this.position = { x: 0, y: 0 };
    this.rotation = rotation;
    this.bodyTexture = bodyTexture;
    this.barrelTexture = barrelTexture;
    this.bulletTexture = bulletTexture;
    this.color = bodyTexture.split("k")[1].split(".")[0];
    this.body = new Sprite();
    this.barrel = new Sprite();
    this.body.anchor.set(0.5, 0.535);
    this.barrel.anchor.set(0.54, 0.175);
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
    this.body.setSize(0.2);
    this.barrel.setSize(0.2);
  }
  async loadTextures() {
    this.bodyTexture = await Assets.load(this.bodyTexture);
    this.barrelTexture = await Assets.load(this.barrelTexture);
    this.bulletTexture = await Assets.load(this.bulletTexture);
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
  tick(deltaTime: number, pressedKeys: Set<string>) {
    if (this.mode) {
      if (pressedKeys.has(this.keybinds.forward)) {
        this.speed += 0.08 * deltaTime;
      }
      if (pressedKeys.has(this.keybinds.backward)) {
        this.speed -= 0.08 * deltaTime;
      }
      if (pressedKeys.has(this.keybinds.left)) {
        this.changeRotation(-0.08 * deltaTime);
      } else if (pressedKeys.has(this.keybinds.right)) {
        this.changeRotation(0.08 * deltaTime);
      }
    } else {
      if (pressedKeys.has(this.keybinds.left)) {
        this.changeBarrelRotation(-0.035 * deltaTime);
      }
      if (pressedKeys.has(this.keybinds.right)) {
        this.changeBarrelRotation(0.035 * deltaTime);
      }
    }
    if (pressedKeys.has(this.keybinds.action)) {
      if (this.stuff.switch) {
        switch (this.mode) {
          case true:
            if (this.fireCooldown <= 0) {
              console.log("Mode switched to turret");
              this.body.alpha = 0.5;
              this.mode = false;
              this.stuff.switch = false;
            }
            break;
          case false:
            this.fireCooldown = 90;
            console.log("Mode switched to tank");
            this.body.alpha = 1;
            this.mode = true;
            this.stuff.switch = false;
            this.fire();
            break;
        }
      }
    } else {
      this.stuff.switch = true;
    }
    if (this.fireCooldown > 0) {
      this.fireCooldown -= deltaTime;
      console.log("Fire cooldown:", this.fireCooldown);
      this.barrel.alpha = 0.5;
    } else {
      this.barrel.alpha = 1;
    }
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

    this.go(true, this.speed * deltaTime);
    this.changePosition(this.slide.x * deltaTime, this.slide.y * deltaTime);
    this.slide.multiplyScalar(0.9 / deltaTime);
    this.speed *= 0.99 * deltaTime;
    for (const i of this.bullets) {
      i.tick(deltaTime);
    }
  }
  bounce(otherTank: Tank | Obstacle) {
    otherTank.slide.add(
      new Victor(
        (otherTank.position.x - this.position.x) * 0.05,
        (otherTank.position.y - this.position.y) * 0.05,
      ),
    );
    if (otherTank instanceof Tank) {
      otherTank.speed *= 0.1;
    }
  }
  takeDamage(damage: number) {
    this.health -= damage;
  }
  async fire() {
    for (let index = 0; index < 5; index++) {
      console.log("Firing bullet", index + 1);
      const bullet = new Bullet(
        this.bulletTexture as Texture,
        { x: this.position.x, y: this.position.y },
        this.barrel.rotation,
        this.app,
        this.enemy as Tank,
      );
      this.bullets.push(bullet);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
