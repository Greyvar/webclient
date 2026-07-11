import Phaser from 'phaser'
import { initMovementInput } from '../MovementInput.js'

export default class HudScene extends Phaser.Scene {
  constructor () {
    super({ key: 'hud' })
  }

  preload () {
    this.load.setBaseURL('/res/')
    this.load.image('menu', 'img/textures/hud/menu.png')
  }

  create () {
    initMovementInput(this)

    const btnMenu = this.add.image(60, 60, 'menu')
    btnMenu.setScrollFactor(0)
    btnMenu.setDepth(100)
    btnMenu.setInteractive({ useHandCursor: true })
    btnMenu.on('pointerdown', this.mnuClicked)
  }

  mnuClicked () {
    window.menuSystem?.toggle('main')
  }
}
