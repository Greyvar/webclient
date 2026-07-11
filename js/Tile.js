export default class Tile {
  constructor(netTile) {
    this.row = -1
    this.col = -1

    this.textureName = 'construct.png'
    this.textureHorizontalFlip = false
    this.textureVerticalFlip = false
    this.textureRotation = 0
    this.atlasKey = null
    this.frameIndex = null
  }

  fromNet (netTile) {
    this.row = netTile.row ?? 0
    this.col = netTile.col ?? 0

    this.textureName = netTile.tex
    this.textureHorizontalFlip = netTile.flipH ?? false
    this.textureVerticalFlip = netTile.flipV ?? false
    this.textureRotation = netTile.rot ?? 0
    this.atlasKey = netTile.atlasKey ?? null
    this.frameIndex = netTile.frameIndex ?? null
  }
}
