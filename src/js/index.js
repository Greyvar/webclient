import GameState from './GameState.js'
import ServerConnection from './ServerConnection.js'
import { GridScene } from './scenes/GridScene.js'
import Phaser from './phaser.min.js'

function init() {
  window.gameState = new GameState()

  window.phaser = new Phaser.Game({
    type: Phaser.AUTO,
    width: 256, 
    height: 256,
    background: 'orange',
    scene: window.gameState.initialScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      zoom: 10, // real zoom is scaled at runtime
    },
    physics: {
      default: 'arcade',
      arcade: {
        //debug: 'true'
      }
    }
  })

  window.serverConnection = new ServerConnection()
}

document.addEventListener('DOMContentLoaded', init)
