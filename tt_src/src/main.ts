import { Application, Assets, Sprite } from "pixi.js";
// @ts-expect-error I don't know how this works, but it works
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Level } from "./level";
import { Tank } from "./tank";
import { Obstacle } from "./obstacle";

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

  const tank1 = new Tank(
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
  );
  const tank2 = new Tank(
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
  );
  const crates: Obstacle[] = [];
  for (let index = 0; index < 10; index++) {
    crates.push(new Obstacle("/assets/crateWood.png", app as Application));
    crates[index].setPosition(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    );
  }
  tank1.setPosition(app.screen.width / 2, app.screen.height / 2);
  tank2.setPosition(app.screen.width / 2, app.screen.height / 2);

  app.ticker.add((time) => {
    console.log(Array.from(pressedKeys));
    tank1.tick(time.deltaTime, pressedKeys);
    tank2.tick(time.deltaTime, pressedKeys);
    // collision detection
    if (
      Math.sqrt(
        (tank1.position.x - tank2.position.x) ** 2 +
          (tank1.position.y - tank2.position.y) ** 2,
      ) < 60
    ) {
      tank1.bounce(tank2);
      tank2.bounce(tank1);
    }
    for (const element of crates) {
      if (
        Math.sqrt(
          (tank1.position.x - element.position.x) ** 2 +
            (tank1.position.y - element.position.y) ** 2,
        ) < 45
      ) {
        tank1.bounce(element);
        element.bounce(tank1);
      }
      if (
        Math.sqrt(
          (tank2.position.x - element.position.x) ** 2 +
            (tank2.position.y - element.position.y) ** 2,
        ) < 45
      ) {
        tank2.bounce(element);
        element.bounce(tank2);
      }
    }

  });
})();
