import { Application, Assets, Graphics, Sprite, TilingSprite } from "pixi.js";
// @ts-expect-error I don't know how this works, but it works
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Level } from "./level";
import { Tank } from "./tank";
import { Obstacle } from "./obstacle";
import { tanks, crates, jumppads } from "./actors";
import { Jumppad } from "./jumppad";

const keybinds = {
  p1: {
    forward: "ArrowUp",
    backward: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    action: "Space",
  },
  p2: {
    forward: "KeyW",
    backward: "KeyS",
    left: "KeyA",
    right: "KeyD",
    action: "Backquote",
  },
};
const music = new Audio();
const boost = new Audio("./assets/boost.mp3");
// Track currently pressed keys
const pressedKeys = new Set<string>();
window.addEventListener("keydown", (e) => {
  pressedKeys.add(e.code);
  e.preventDefault();
});
window.addEventListener("keyup", (e) => {
  pressedKeys.delete(e.code);
  e.preventDefault();
});
init();

async function findKeybinds() {
  const store = window.localStorage;
  let k: keyof typeof keybinds;
  for (k in keybinds) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = keybinds[k];
    let l: keyof typeof player;
    for (l in keybinds[k]) {
      if (store.getItem(k + l[0]) != null) {
        keybinds[k][l] = store.getItem(k + l[0])!;
      }
      document.getElementById(k + l[0])!.innerHTML = keybinds[k][l];
    }
  }
}
let target: HTMLElement;
function keybinding(e: MouseEvent) {
  target = e.target as HTMLElement;
  target.addEventListener("keydown", (e) => {
    const key = e.code;
    const player = target.id.slice(0, 2) as keyof typeof keybinds;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bindtype = keybinds[player];
    let bind: keyof typeof bindtype;
    for (bind in keybinds[player]) {
      if (bind[0] == target.id[2]) {
        keybinds[player][bind] = key;
        const store = window.localStorage;
        store.setItem(target.id, keybinds[player][bind]);
        document.getElementById(target.id)!.innerHTML = keybinds[player][bind];
      }
    }
  });
}

const buttons = document.getElementsByTagName("button");
for (const i of buttons) {
  i.onclick = keybinding;
}

document.addEventListener("click", () => {
  if (music.paused) {
    music.play();
  }
});
async function init() {
  await findKeybinds();
  music.src = "./assets/music.mp3";
  music.play();
  music.volume = 0.5;
  music.loop = true;
  console.log("sasdadfgaf");
  // @ts-expect-error This definitely works
  globalThis.__PIXI_APP__?.destroy();
  document.querySelector("canvas")?.remove();
  const app = new Application();
  // @ts-expect-error I don't know how this works, but it works
  globalThis.__PIXI_APP__ = app as Application;
  await app.init({ background: "#000", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);
  const tilingSprite = new TilingSprite({
    texture: await Assets.load("./assets/background.png"),
    width: app.screen.width,
    height: app.screen.height,
  });
  tilingSprite.anchor.set(0.5);
  tilingSprite.position.set(app.screen.width / 2, app.screen.height / 2);
  tilingSprite.tileScale.set(1);
  app.stage.addChild(tilingSprite);
  tanks.pop();
  tanks.pop();
  let k = crates.length;
  for (let index = 0; index < k; index++) {
    crates.pop();
  }
  k = jumppads.length;
  for (let index = 0; index < k; index++) {
    jumppads.pop();
  }

  tanks.push(
    new Tank(
      "./assets/tankred.png",
      "./assets/barrel.png",
      app as Application,
      keybinds.p1,
      "./assets/bulletRed1.png",
      -0.25 * Math.PI,
    ),
  );
  tanks.push(
    new Tank(
      "./assets/tankblue.png",
      "./assets/barrel.png",
      app as Application,
      keybinds.p2,
      "./assets/bulletBlue1.png",
      0.75 * Math.PI,
    ),
  );
  for (let index = 0; index < 20; index++) {
    crates.push(new Obstacle("./assets/crate.png", app as Application));
    crates[index].setPosition(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    );
  }
  for (let index = 0; index < 7; index++) {
    jumppads.push(new Jumppad("./assets/boostpad.png", app as Application));
    jumppads[index].setPosition(
      Math.random() * (app.screen.width - 200) + 100,
      Math.random() * (app.screen.height - 200) + 100,
    );
  }
  tanks[0].setPosition(64, 64);
  tanks[1].setPosition(app.screen.width - 64, app.screen.height - 64);
  tanks[0].enemy = tanks[1];
  tanks[1].enemy = tanks[0];

  app.ticker.add((time) => {
    time.maxFPS = 60;
    time.minFPS = 60;
    ui(app);
    tanks[0].tick(time.deltaTime, pressedKeys);
    tanks[1].tick(time.deltaTime, pressedKeys);
    // collision detection
    if (
      Math.sqrt(
        (tanks[0].position.x - tanks[1].position.x) ** 2 +
          (tanks[0].position.y - tanks[1].position.y) ** 2,
      ) < 52 &&
      tanks[0].altitude <= 0 &&
      tanks[1].altitude <= 0
    ) {
      tanks[0].bounce(tanks[1]);
      tanks[1].bounce(tanks[0]);
    }
    for (const element of crates) {
      if (
        Math.sqrt(
          (tanks[0].position.x - element.position.x) ** 2 +
            (tanks[0].position.y - element.position.y) ** 2,
        ) < 50 &&
        tanks[0].altitude <= 0
      ) {
        tanks[0].bounce(element);
        element.bounce(tanks[0]);
      }
      if (
        Math.sqrt(
          (tanks[1].position.x - element.position.x) ** 2 +
            (tanks[1].position.y - element.position.y) ** 2,
        ) < 50 &&
        tanks[1].altitude <= 0
      ) {
        tanks[1].bounce(element);
        element.bounce(tanks[1]);
      }
      element.tick(time.deltaTime);
    }
    for (const element of jumppads) {
      if (
        Math.sqrt(
          (tanks[0].position.x - element.position.x) ** 2 +
            (tanks[0].position.y - element.position.y) ** 2,
        ) < 50 &&
        tanks[0].altitude <= 0
      ) {
        tanks[0].stuff.jump = true;
        boost.currentTime = 0;
        boost.play();
      }
      if (
        Math.sqrt(
          (tanks[1].position.x - element.position.x) ** 2 +
            (tanks[1].position.y - element.position.y) ** 2,
        ) < 50 &&
        tanks[1].altitude <= 0
      ) {
        tanks[1].stuff.jump = true;
        boost.currentTime = 0;
        boost.play();
      }
    }
  });
}

async function ui(app: Application) {
  app.stage
    .getChildrenByLabel("healthbar")
    .forEach((child) => app.stage.removeChild(child));
  app.stage
    .getChildrenByLabel("altitudebar")
    .forEach((child) => app.stage.removeChild(child));

  for (const tank of tanks) {
    const healthBarWidth = 60;
    const healthBarHeight = 8;
    const healthPercent = Math.max(0, Math.min(1, tank.health / 100));
    const HealthBar = new Graphics();
    HealthBar.label = `healthbar`;
    HealthBar.rect(
      -healthBarWidth / 2,
      -tank.body.height / 2 - 20,
      healthBarWidth,
      healthBarHeight,
    );
    HealthBar.fill(0xcccccc);
    HealthBar.rect(
      -healthBarWidth / 2,
      -tank.body.height / 2 - 20,
      healthBarWidth * healthPercent,
      healthBarHeight,
    );
    HealthBar.fill(0xff4444);
    HealthBar.x = tank.position.x;
    HealthBar.y = tank.position.y;
    app.stage.addChild(HealthBar);

    const altitudeBarWidth = 60;
    const altitudeBarHeight = 8;
    const altitudePercent = Math.max(0, Math.min(1, tank.altitude / 20));
    const altitudeBar = new Graphics();
    altitudeBar.label = `altitudebar`;
    altitudeBar.rect(
      -altitudeBarWidth / 2,
      -tank.body.height / 2 - 30,
      altitudeBarWidth,
      altitudeBarHeight,
    );
    altitudeBar.fill(0xcccccc);
    altitudeBar.rect(
      -altitudeBarWidth / 2,
      -tank.body.height / 2 - 30,
      altitudeBarWidth * altitudePercent,
      altitudeBarHeight,
    );
    altitudeBar.fill(0x006600);
    altitudeBar.x = tank.position.x;
    altitudeBar.y = tank.position.y;
    app.stage.addChild(altitudeBar);

    if (tank.health <= 0) {
      // Only create overlay if it doesn't already exist
      if (!document.querySelector(".game-over")) {
        const explosion = new Sprite(
          await Assets.load("./assets/explosion.png"),
        );
        explosion.anchor.set(0.5);
        explosion.position.set(tank.position.x, tank.position.y);
        explosion.zIndex = 2;
        app.stage.addChild(explosion);
        const element = document.createElement("div");
        element.className = "game-over";
        element.innerHTML = `<h1>Game Over</h1><p>${tank.color == "blue" ? "RED" : "BLUE"} tank is the winner!</p><button id="reset">Restart Game</button>`;

        element.style.position = "absolute";
        element.style.top = "50%";
        element.style.left = "50%";
        element.style.transform = "translate(-50%, -50%)";
        element.style.zIndex = "1000";
        element.style.background = "black";
        element.style.padding = "20px";
        element.style.borderRadius = "5px";
        document.getElementById("pixi-container")!.appendChild(element);
        console.log("peeps are ded");
        document.getElementById("reset")!.onclick = (e) => {
          console.log("adsdghaléeihfsdfsdf" + e);
          // Remove overlay before restarting
          element.remove();
          init();
        };
        app.ticker.addOnce(() => {
          app.ticker.stop();
        });
      }
    }
  }
}
