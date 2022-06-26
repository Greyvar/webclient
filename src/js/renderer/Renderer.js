import { renderGrid } from './gridRenderer.js'
import TextureCache from './TextureCache.js'

const RendererStates = {
  UNKNOWN: 'Unknown',
  GUI: 'Gui',
  GRID: 'Grid'
}

export default class Renderer {
  constructor(gameState) {
    this.ctx = null
    this.rendererState = RendererStates.GRID
    this.frameTicker = null
    this.textureCache = new TextureCache(this.getGl())
    this.width = 100
    this.height = 100
    this.gameState = gameState
    this.text = "Disconnected"

    this.onCanvasResized(); // DOMContentLoaded

    window.onresize = () => {
      this.onCanvasResized()
    }
  }

  getGl() {
    if (this.ctx == null) {
      this.canvas = document.querySelector('#glCanvas')
      this.onCanvasResized()

      this.ctx = this.canvas.getContext('2d')
      this.ctx.imageSmoothingEnabled = false
      console.log('setup gl', this.ctx)
    }
    
    if (this.ctx == null) {
      throw 'Unable to init 2d'
    } else {
      console.info('got Gl')
    }
    
    return this.ctx
  }
  
  onCanvasResized() {
    console.log("resize", this.canvas)

    // Uset offset* values here, as .width and .height are set to whatever is in the initial css.
    this.width = this.canvas.offsetWidth
    this.height = this.canvas.offsetHeight

    let l = Math.min(this.width, this.height)
    console.log(this.width, this.height, l)

    this.canvas.width = l;
    this.canvas.height = l;

    this.drawScale = l / 256; // Greyvar uses a logical 256 x 256 resolution, and the renderers "upscale" as needed

    return this.drawScale
  }

  renderFrame() {
    if (this.ctx == null) {
      console.log('renderFrame does not have a GL context', this.ctx)
      this.stop()
      return
    }

    this.ctx.fillStyle = 'orange'
    this.ctx.fillRect(0, 0, this.width, this.height)

    switch (this.rendererState) {
    case RendererStates.GUI:
      this.ctx.fillStyle = 'green'
      this.ctx.fillRect(0, 0, this.width, this.height)
      break
    case RendererStates.GRID: 
      renderGrid(this, this.gameState)
      break
    default:
      break
    }
  }

  renderConnectionResponse(r) {
    this.text = "Server: " + r.serverVersion
  }
  
  start() {
    this.frameTicker = setInterval(() => { this.renderFrame() }, 100) 
  }

  stop() {
    clearInterval(this.frameTicker)
  }
}

