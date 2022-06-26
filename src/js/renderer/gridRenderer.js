export function renderGrid(renderer, gameState) {
  const tiles = window.gameState.grid.allTiles()

  for (let index in tiles) {
    renderTile(renderer, tiles[index])
  }

  renderer.ctx.fillStyle = 'red'
  renderer.ctx.font = (renderer.drawScale * 24) + 'px overpass'
  renderer.ctx.fillText(renderer.text, 10, 150)
}

function renderTile(renderer, tile) {
  const tex = renderer.textureCache.getTile(tile.textureName)

  const tileSize = 16 * renderer.drawScale

  if (tex == null) {
    renderer.ctx.fillRect(tile.row * tileSize, tile.col * tileSize, tileSize, tileSize)
  } else {
    renderer.ctx.drawImage(tex, tile.row * tileSize, tile.col * tileSize, tileSize, tileSize)
  }
}
