import GameState from './GameState.js'
import ServerConnection from './ServerConnection.js'
import { GridScene } from './scenes/GridScene.js'
import SplashScene from './scenes/SplashScene.js'
import HudScene from './scenes/HudScene.js'
import MenuScene from './scenes/MenuScene.js'
import Phaser from './phaser.min.js'

function init() {
  window.gameState = new GameState()

  window.phaser = new Phaser.Game({
    type: Phaser.WEBGL,
    width: 320,
    height: 256,
    input: {
      gamepad: true,
    },
    background: 'orange',
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

  window.phaser.scene.add('hud', HudScene, false)
  window.phaser.scene.add('menu', MenuScene, false)
  window.phaser.scene.add('splash', SplashScene, true)

  window.serverConnection = new ServerConnection()
}

window.resizeGame = () => {
  const camGrid = window.gameState.gridScene.cameras.main;

//  console.log("iw", window.innerWidth, window.innerHeight)

  camGrid.setBounds(0, 0, window.innerWidth, window.innerHeight)
  camGrid.setSize(window.innerWidth, window.innerHeight)
  camGrid.setZoom(6)

  const camHud = window.phaser.scene.getScene('hud').cameras.main

//  camHud.setBounds(0, 0, window.innerWidth, window.innerHeight)
//  camHud.setSize(window.innerWidth, window.innerHeight)

  console.log('resized game')

//  window.phaser.scale.resize(window.innerWidth / ZOOM_LEVEL, window.innerHeight / ZOOM_LEVEL)
}

window.addEventListener('resize', window.resizeGame, false)
window.addEventListener('orientationchange', window.resizeGame)

document.addEventListener('DOMContentLoaded', init)
