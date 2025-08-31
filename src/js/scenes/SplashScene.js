import Phaser from '../phaser.min.js'

export default class SplashScene extends Phaser.Scene {
  create () {
    const g = this.add.graphics()

    g.fillStyle(0x524e4b)
    g.fillRect(0, 0, 2000, 900)

    const textStyle = {
      color: '#fff',
      font: 'bold 48px sans-serif',
      align: 'right'
    }

    let txt = this.add.text(20, 20, "Greyvar", textStyle)
    txt.setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)
    textStyle.font = "bold 24px sans-serif"

    // Align only works with multi line text
    this.add.text(20, 400, "Server:\nResources:\n", textStyle).setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)

    this.txtServer = this.add.text(200, 400, "[server]", textStyle)
    this.txtServer.setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)

    this.txtResources = this.add.text(200, 428, '[resources]', textStyle)
    this.txtResources.setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)
  }

  update () {
    if (window.serverConnection.isOk) {
      this.txtServer.setText('OK!')
      this.txtServer.setColor("#0f0")
    } else {
      this.txtServer.setText('Disconnected')
      this.txtServer.setColor('#f00')
      return
    }

    if (window.gameState.hackHasLoadedLogo) {
      this.txtResources.setText('Loading')
    } else {
      this.txtResources.setText('Failed!')
      this.txtResources.setColor('#f00')
      return
    }

    window.phaser.scene.bringToTop('menu')
  }
}

