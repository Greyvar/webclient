import Tile from './Tile.js'

export default class Grid {
  constructor() {
    this.tileMap = []

    for (let row = 0; row < 16; row++) {
      this.tileMap[row] = []

      for (let col = 0; col < 16; col++) {
        let t = new Tile()
        // deliberately swop coords
        t.row = col
        t.col = row

        if (col === 0 || col === 15 || row === 0 || row === 15) {
          t.textureName = 'water.png'
        } else {
          t.textureName = 'grass.png'
        }

        this.tileMap[row][col] = t
      }
    }
  }

  allTiles() {
    return this.tileMap.flat()
  }

  set(col, row, tile) {
    this.tileMap[row][col] = tile
  }
}
