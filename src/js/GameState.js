import Grid from './Grid.js'
import GridScene from './scenes/GridScene.js'
import SplashScene from './scenes/SplashScene.js'

export default class GameState {
  currentScene = null;
  entdefs = {}

  constructor() {
    this.grid = new Grid()
    this.gridScene = null

    this.currentScene = new SplashScene();
  }

  addMessage(m) {
  }

  onNewGrid(g) {
    let gs = new GridScene()
    gs.setGrid(g)

    window.phaser.scene.add('grid', gs, true)

    this.gridScene = gs
  }

  onPlayerJoined(plj) {
    console.log("player joined:", plj.username)
  }

  onEntitySpawn(ent) {
    this.gridScene.onEntitySpawn(ent)
  }

  onEntityPosition(entpos) {
    this.gridScene.onEntityPosition(entpos)
  }

  onEntdef(entdef) {
    this.entdefs[entdef.name] = entdef
  }
}
