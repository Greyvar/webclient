import Phaser from '../phaser.min.js'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super({ key: 'menu', active: true})
  }

  preload () {
    this.load.setBaseURL('https://' + window.location.host + '/res/')
    this.load.image('close', 'img/textures/hud/close.png')
    this.load.image('reload', 'img/textures/hud/reload.png')
  }

  create () {
    console.log("creating menu")
    const g = this.add.graphics()

    g.fillStyle(0x524e4b)
    g.fillRect(0, 0, 2000, 900)

    const btnClose = this.add.image(60, 60, 'close')
    btnClose.setInteractive()
    btnClose.on('pointerdown', this.onClose)

    const txt = this.add.text(200, 60, 'main menu')

    const txtControllers = this.add.text(20, 200, 'Controller count: ' + navigator.getGamepads().length)

    const btnReload = this.add.image(60, 300, 'reload')
    btnReload.setInteractive()
    btnReload.on('pointerdown', () => {
      window.location.reload()
    })
  }

  onClose() {
    window.phaser.scene.sendToBack('menu')
  }
}

