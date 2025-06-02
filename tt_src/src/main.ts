import { Application, Assets, Sprite } from "pixi.js";
// @ts-expect-error I don't know how this works, but it works
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Level } from "./level";
import { Tank } from "./tank";

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
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const tank1 = new Tank(
    "/assets/tankBody_red.png",
    "/assets/tankRed_barrel1.png",
    app as Application,
    {
      forward: "ArrowUp",
      backward: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      action: "Space",
    },
  );
  tank1.setPosition(app.screen.width / 2, app.screen.height / 2);
  let direction1 = true;
  let mode1 = false;
  let mode2 = false;

  app.ticker.add((time) => {
    console.log(Array.from(pressedKeys));
    tank1.tick(time.deltaTime, pressedKeys);
    
  });
})();
