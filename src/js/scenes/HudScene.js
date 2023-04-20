import Phaser from '../phaser.min.js'

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: "hud", active: true})
  }

  preload() {
    this.load.setBaseURL('https://' + window.location.host + '/res/')
    this.load.image('menu', 'img/textures/hud/menu.png')
    this.load.image('fullscreen', 'img/textures/hud/fullscreenToggle.png')
  }

  create() {
    const btnMenu = this.add.image(60, 60, 'menu')
//    btnMenu.setScrollFactor(0)
    btnMenu.setInteractive()
    btnMenu.on('pointerdown', this.mnuClicked)

    const btnFullscreen = this.add.image(160, 60, 'fullscreen')
    btnFullscreen.setInteractive()
    btnFullscreen.on('pointerdown', this.mnuFullscreenClicked)
    console.log("creating menu")

  }

  mnuClicked() {
    console.log("menu clicked")

    window.phaser.scene.bringToTop('menu')
  }

  mnuFullscreenClicked() {
    console.log('fullscreen toggle', window.phaser.scale.fullscreen)

    if (!window.phaser.scale.fullscreen.active) {
      window.phaser.scale.startFullscreen()
    } else {
      window.phaser.scale.stopFullscreen()
    }
  }
}

