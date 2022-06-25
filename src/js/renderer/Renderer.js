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
      console.log('got Gl')
    }
    
    return this.ctx
  }
  
  onCanvasResized() {
    this.width = this.canvas.offsetWidth
    this.height = this.canvas.offsetHeight
    this.drawScale = this.canvas.offsetWidth / 356 // Greyvar uses a logical 256 x 256 resolution, and the renderers "upscale" as needed

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
  
  start() {
    this.frameTicker = setInterval(() => { this.renderFrame() }, 100) 
  }

  stop() {
    clearInterval(this.frameTicker)
  }
}

