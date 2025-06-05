import { Application, Assets, Graphics, Sprite, TilingSprite } from "pixi.js";
// @ts-expect-error I don't know how this works, but it works
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Level } from "./level";
import { Tank } from "./tank";
import { Obstacle } from "./obstacle";
import { tanks, crates } from "./actors";

// Track currently pressed keys
const pressedKeys = new Set<string>();
window.addEventListener("keydown", (e) => {
  pressedKeys.add(e.code);
});
window.addEventListener("keyup", (e) => {
  pressedKeys.delete(e.code);
});
init();
async function init() {
  // Create a new application

  // @ts-expect-error I don't know how this works, but maybe it works
  globalThis.__PIXI_APP__?.destroy();
  const app = new Application();
  // @ts-expect-error I don't know how this works, but it works
  globalThis.__PIXI_APP__ = app as Application;
  await app.init({ background: "#fff", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);
  const tilingSprite = new TilingSprite({
    texture: await Assets.load("/assets/background.png"),
    width: app.screen.width,
    height: app.screen.height,
  });
  tilingSprite.anchor.set(0.5);
  tilingSprite.position.set(app.screen.width / 2, app.screen.height / 2);
  tilingSprite.tileScale.set(1);
  app.stage.addChild(tilingSprite);
  tanks.length = 0;
  crates.length = 0;
  tanks.push(
    new Tank(
      "/assets/tankred.png",
      "/assets/barrel.png",
      app as Application,
      {
        forward: "ArrowUp",
        backward: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        action: "Space",
      },
      "/assets/bulletRed1.png",
      -0.25 * Math.PI,
    ),
  );
  tanks.push(
    new Tank(
      "/assets/tankblue.png",
      "/assets/barrel.png",
      app as Application,
      {
        forward: "KeyW",
        backward: "KeyS",
        left: "KeyA",
        right: "KeyD",
        action: "Backquote",
      },
      "/assets/bulletBlue1.png",
      0.75 * Math.PI,
    ),
  );
  for (let index = 0; index < 10; index++) {
    crates.push(new Obstacle("/assets/crate.png", app as Application));
    crates[index].setPosition(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    );
  }
  tanks[0].setPosition(64, 64);
  tanks[1].setPosition(app.screen.width - 64, app.screen.height - 64);
  tanks[0].enemy = tanks[1];
  tanks[1].enemy = tanks[0];

  app.ticker.add((time) => {
    ui(app);
    tanks[0].tick(time.deltaTime, pressedKeys);
    tanks[1].tick(time.deltaTime, pressedKeys);
    // collision detection
    if (
      Math.sqrt(
        (tanks[0].position.x - tanks[1].position.x) ** 2 +
          (tanks[0].position.y - tanks[1].position.y) ** 2,
      ) < 52
    ) {
      tanks[0].bounce(tanks[1]);
      tanks[1].bounce(tanks[0]);
    }
    for (const element of crates) {
      if (
        Math.sqrt(
          (tanks[0].position.x - element.position.x) ** 2 +
            (tanks[0].position.y - element.position.y) ** 2,
        ) < 50
      ) {
        tanks[0].bounce(element);
        element.bounce(tanks[0]);
      }
      if (
        Math.sqrt(
          (tanks[1].position.x - element.position.x) ** 2 +
            (tanks[1].position.y - element.position.y) ** 2,
        ) < 50
      ) {
        tanks[1].bounce(element);
        element.bounce(tanks[1]);
      }
    }
  });
}

async function ui(app: Application) {
  // Remove previous healthbars
  app.stage
    .getChildrenByLabel("healthbar")
    .forEach((child) => app.stage.removeChild(child));

  // Draw healthbars for each tank
  for (const tank of tanks) {
    const barWidth = 60;
    const barHeight = 8;
    const healthPercent = Math.max(0, Math.min(1, tank.health / 100));
    const bar = new Graphics();
    bar.label = `healthbar`;
    // Background
    bar.rect(-barWidth / 2, -tank.body.height / 2 - 20, barWidth, barHeight);
    bar.fill(0xcccccc);
    // Health
    bar.rect(
      -barWidth / 2,
      -tank.body.height / 2 - 20,
      barWidth * healthPercent,
      barHeight,
    );
    bar.fill(0xff4444);
    // Position above tank
    bar.x = tank.position.x;
    bar.y = tank.position.y;
    app.stage.addChild(bar);
    if (tank.health <= 0) {
      const explosion = new Sprite(await Assets.load("/assets/explosion.png"));
      explosion.anchor.set(0.5);
      explosion.position.set(tank.position.x, tank.position.y);
      explosion.zIndex = 2;
      app.stage.addChild(explosion);
      const element = document.createElement("div");
      element.className = "game-over";
      element.innerHTML = `<h1>Game Over</h1><p>${tank.color} tank has been destroyed!</p><button onclick="location.reload()">Restart Game</button>`;
      element.style.position = "absolute";
      element.style.top = "50%";
      element.style.left = "50%";
      element.style.transform = "translate(-50%, -50%)";
      element.style.zIndex = "1000";
      document.getElementById("pixi-container")!.appendChild(element);
      app.ticker.addOnce(() => {
        app.ticker.stop();
      });
    }
  }
}
