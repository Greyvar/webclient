import Tile from './Tile.js'

export default class Grid {
  constructor(rowCount, colCount) {
    this.tileMap = []
    this.rowCount = rowCount
    this.colCount = colCount

    for (let row = 0; row < rowCount; row++) {
      this.tileMap[row] = []

      for (let col = 0; col < colCount; col++) {
        let t = new Tile()
        t.row = row
        t.col = col

        if (col === 0 || col === colCount - 1 || row === 0 || row === rowCount - 1) {
          t.textureName = 'water.png'
        } else {
          t.textureName = 'grass.png'
        }

        this.tileMap[row][col] = t
      }
    }

    console.log(this.tileMap)
  }

  allTiles() {
    return this.tileMap.flat()
  }

  set(row, col, tile) {
    if (this.tileMap[row] == undefined) {
      console.error(col, row)
      return
    }

    this.tileMap[row][col] = tile
  }
}
