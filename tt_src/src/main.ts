// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, Assets, Graphics, HTMLText, Sprite } from "pixi.js";
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

(async () => {
  // Create a new application
  const app = new Application();
  // @ts-expect-error I don't know how this works, but it works
  globalThis.__PIXI_APP__ = app as Application;
  await app.init({ background: "#fff", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

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
    ),
  );
  for (let index = 0; index < 10; index++) {
    crates.push(new Obstacle("/assets/crateWood.png", app as Application));
    crates[index].setPosition(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    );
  }
  tanks[0].setPosition(app.screen.width / 2, app.screen.height / 2);
  tanks[1].setPosition(app.screen.width / 2, app.screen.height / 2);
  tanks[0].enemy = tanks[1];
  tanks[1].enemy = tanks[0];

  app.ticker.add((time) => {
    ui(app);
    console.log(Array.from(pressedKeys));
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
})();

function ui(app: Application) {
  // Remove previous healthbars
  app.stage
    .getChildrenByLabel("healthbar")
    .forEach((child) => app.stage.removeChild(child));

  // Draw healthbars for each tank
  tanks.forEach((tank, i) => {
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
  });
}
