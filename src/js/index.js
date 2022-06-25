import GameState from './GameState.js'
import Renderer from './renderer/Renderer.js'

function init() {
  window.gameState = new GameState()
  
  window.renderer = new Renderer(window.gameState)
  window.renderer.start()
}

init()
