import GameState from './GameState.js'
import ServerConnection from './ServerConnection.js'
import Renderer from './renderer/Renderer.js'

function init() {
  window.gameState = new GameState()
  
  window.renderer = new Renderer(window.gameState)
  window.renderer.start()

  window.serverConnection = new ServerConnection()
}

document.addEventListener('DOMContentLoaded', init)
