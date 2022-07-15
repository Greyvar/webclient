import Phaser from '../phaser.min.js'

export default class SplashScene extends Phaser.Scene {
  create() {
    let style = {
      fill: "#fff",
      font: "bold 48px sans-serif",
    }

    let txt = this.add.text(0, 200, "Greyvar", style)
    txt.setShadow(3, 3, 'rgba(0, 0, 0, .5)', 2)
//    txt.setTextBounds(0, 100, 800, 100)
  }
}

