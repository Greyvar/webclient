import { renderGrid } from "./grid";
import TextureCache from "./TextureCache"

enum RendererState {
  UNKNOWN,
  GUI,
  GRID
}

export default class Renderer {
  ctx = null;
  rendererState = RendererState.UNKNOWN;
  frameTicker = null;
  textureCache = null;
  width = 100;
  height = 100;
  gameState = null;

  constructor(gameState) {
    this.gameState = gameState;
    this.textureCache = new TextureCache(this.getGl());
  }

  getGl() {
    if (this.ctx == null) {
      const canvas = document.querySelector("#glCanvas") as HTMLCanvasElement;
      this.width = canvas.width;
      this.height = canvas.height;

      this.ctx = canvas.getContext("2d");
      console.log("setup gl", this.ctx);
    }
    
    if (this.ctx == null) {
      throw "Unable to init 2d"
    } else {
      console.log("got Gl")
    }
    
    return this.ctx;
  }

  renderFrame() {
    if (this.ctx == null) {
      console.log("renderFrame does not have a GL context", this.ctx);
      this.stop();
      return;
    }

    switch (this.rendererState) {
      case RendererState.GUI:
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 0, this.width, this.height);
        break;
      case RendererState.GRID: 
        renderGrid(this, this.gameState);
        break;
      default:
        this.ctx.fillStyle = "orange";
        this.ctx.fillRect(0, 0, this.width, this.height);
        break;
    }
  }
  
  start() {
    this.frameTicker = setInterval(() => { this.renderFrame() }, 100); 
  }

  stop() {
      clearInterval(this.frameTicker);
  }
}

