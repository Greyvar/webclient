import Phaser from '../phaser.min.js'

export default class SplashScene extends Phaser.Scene {
  create() {
    let g = this.add.graphics()

    g.fillStyle(0x524e4b)
    g.fillRect(0, 0, 2000, 900)

    let textStyle = {
      fill: "#fff",
      font: "bold 92px sans-serif",
    }

    let txt = this.add.text(0, 200, "Greyvar", textStyle)
    txt.setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)
//    txt.setTextBounds(0, 100, 800, 100) 
   
    textStyle.font = "bold 48px sans-serif"

    let txtServer = this.add.text(20, 400, "Server: ?", textStyle)
    let txtResources = this.add.text(20, 450, "Resources: ?", textStyle)
  }

  update() {
    if (window.serverConnection.isOk) {
      txtServer.setText("Server: OK!")
    } else {
      return
    }

    if (window.gameState.hackHasLoadedLogo) {
      txtResources.setText("Resources: OK!")
    } else {
      return
    }

    window.phaser.scene.bringToTop('menu')
  }
}

