import GameState from "./GameState";
import Renderer from "./renderer/index";

function init() {
  const wnd = (<any>window);

  wnd.gameState = new GameState();
  
  wnd.renderer = new Renderer(wnd.gameState);
  wnd.renderer.start();
}

init();
