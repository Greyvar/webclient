export default class Tile {
  constructor(netTile) {
    this.row = -1
    this.col = -1

    this.textureName = 'construct.png'
    this.textureHorizontalFlip = false
    this.textureVerticalFlip = false
    this.textureRotation = 0
  }

  fromNet(netTile) {
    this.row = netTile.row
    this.col = netTile.col

    this.textureName = netTile.tex
    this.textureHorizontalFlip = netTile.flipH
    this.textureVerticalFlip = netTile.flipV
    this.textureRotation = netTile.rot

  }
}
