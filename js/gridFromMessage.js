import Grid from './Grid.js'
import Tile from './Tile.js'

export function buildGridFromMessage (netGrid) {
  if (netGrid == null) {
    return null
  }

  const tiles = netGrid.tiles ?? []
  let rowCount = netGrid.rowCount ?? 0
  let colCount = netGrid.colCount ?? 0

  for (const netTile of tiles) {
    rowCount = Math.max(rowCount, (netTile.row ?? 0) + 1)
    colCount = Math.max(colCount, (netTile.col ?? 0) + 1)
  }

  if (!rowCount || !colCount) {
    return null
  }

  const newGrid = new Grid(rowCount, colCount)
  newGrid.gridId = netGrid.gridId ?? netGrid.title ?? null
  newGrid.worldId = netGrid.worldId ?? null
  newGrid.tilesets = (netGrid.tilesets ?? []).map((tileset) => ({
    key: tileset.key,
    image: tileset.image,
    tileWidth: tileset.tileWidth ?? 16,
    tileHeight: tileset.tileHeight ?? 16,
    columns: tileset.columns ?? 0
  }))
  newGrid.transition = netGrid.transition ?? null

  for (const netTile of tiles) {
    const tile = new Tile()
    tile.fromNet(netTile)
    newGrid.set(tile.row, tile.col, tile)
  }

  return newGrid
}
