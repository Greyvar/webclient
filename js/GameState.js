import GridScene from './scenes/GridScene.js'
import SplashScene from './scenes/SplashScene.js'

export default class GameState {
  entdefs = new Map()
  hackHasLoadedInitialGrid = false
  gridScene = null
  grid = null

  hackHasLoadedLogo = false

  constructor() {}

  addMessage(m) {}

  onNewGrid(g) {
    let gs = new GridScene(g)

    let k = new Date().toString()
    window.phaser.scene.add(k, gs, true)
    window.phaser.scene.bringToTop('hud')

    this.grid = g
    this.gridScene = gs

    window.resizeGame()
  }

  onPlayerJoined(plj) {
    console.log('player joined:', plj.username)
  }

  onEntitySpawn(ent) {
    this.gridScene.onEntitySpawn(ent)
  }

  onEntityPosition(entpos) {
    this.gridScene.onEntityPosition(entpos)

  }

  onEntdef(entdef) {
    this.entdefs.set(entdef.name, entdef)
  }
}
