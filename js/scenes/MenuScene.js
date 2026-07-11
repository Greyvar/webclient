import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super({ key: 'menu' })
  }

  create () {
    window.menuSystem?.attachScene(this)

    this.input.keyboard?.on('keydown-ESC', this.onEscape, this)
    this.events.once('shutdown', this.onShutdown, this)
  }

  onEscape () {
    window.menuSystem?.close()
  }

  onShutdown () {
    this.input.keyboard?.off('keydown-ESC', this.onEscape, this)
    window.menuSystem?.detachScene()
  }
}
