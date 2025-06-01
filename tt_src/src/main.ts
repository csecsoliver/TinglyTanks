import { Application, Assets, Sprite } from "pixi.js";
// @ts-expect-error I don't know how this works, but it works
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Level } from "./level";

(async () => {
  // Create a new application
  const app = new Application();
  // @ts-expect-error I don't know how this works, but it works
  globalThis.__PIXI_APP__ = app as Application;
  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });
  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load("/assets/tankBody_red.png");
  const texture2 = await Assets.load("/assets/tankRed_barrel1.png");

  // Create a bunny Sprite
  const tank = new Sprite(texture);
  const barrel = new Sprite(texture2);

  // Center the sprite's anchor point
  tank.anchor.set(0.5);
  barrel.anchor.set(0.5, 0);

  // Move the sprite to the center of the screen
  tank.position.set(app.screen.width / 2, app.screen.height / 2);
  barrel.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(tank);
  app.stage.addChild(barrel);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    tank.rotation += 0.01 * time.deltaTime;
    barrel.rotation += 0.01 * time.deltaTime;
  });
})();
