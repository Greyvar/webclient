export function renderGrid(renderer, gameState) {
  for (var tile of gameState.grid.tileArray) { 
    const tex = renderer.textureCache.getTexture(tile.texture);

    renderer.ctx.drawImage(tex, tile.row * 32, tile.col * 32, 16, 16);
  }
}
