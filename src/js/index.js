import GameState from './GameState.js'
import ServerConnection from './ServerConnection.js'
import { GridScene } from './scenes/GridScene.js'
import Phaser from './phaser.min.js'

function init() {
  window.gameState = new GameState()

  window.phaser = new Phaser.Game({
    type: Phaser.AUTO,
    width: 320, 
    height: 256,
    background: 'orange',
    scene: window.gameState.initialScene,
    render: { // These settings apparently need to be set for Android: https://github.com/photonstorm/phaser/issues/5659
      batchSize: 1024,
      maxTextures: 7,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      zoom: Phaser.Scale.MAX_ZOOM, // real zoom is scaled at runtime
    },
    autoRound: false,
    physics: {
      default: 'arcade',
      arcade: {
        //debug: 'true'
      }
    }
  })

  window.serverConnection = new ServerConnection()
}

window.resizeGame = () => {
  const c = window.gameState.gridScene.cameras.main;

//  console.log("iw", window.innerWidth, window.innerHeight)

  c.setBounds(0, 0, window.innerWidth, window.innerHeight)
  c.setSize(window.innerWidth, window.innerHeight)
  c.setZoom(6)
//  window.phaser.scale.resize(window.innerWidth / ZOOM_LEVEL, window.innerHeight / ZOOM_LEVEL)
}

window.addEventListener('resize', window.resizeGame, false)
window.addEventListener('orientationchange', window.resizeGame)

document.addEventListener('DOMContentLoaded', init)
