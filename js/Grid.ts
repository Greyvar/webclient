import Tile from "./Tile";

export default class Grid {
  tileMap: Tile[][] = [];
  tileArray: Tile[] = [];

  constructor() {
    for (let row = 1; row < 16; row++) {
      this.tileMap[row] = []

      for (let col = 1; col < 16; col++) {
        let t = new Tile();
        t.row = row;
        t.col = col;

        this.tileMap[row][col] = t;

        let index = row * col;
        this.tileArray[index] = t;
      }
    }

    this.tileArray[0] = this.tileMap[1][1]
  }

  allTiles() {
    return this.tileArray;
  }
}
