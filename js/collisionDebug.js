const DEFAULT_BLOCKING_TEXTURES = [
  'water.png',
  'barrier.png',
  'fence.png'
]

let blockingTextures = new Set(DEFAULT_BLOCKING_TEXTURES)
let blockingTexturesLoaded = false
let blockingTexturesLoading = null

const TILE_SIZE = 16

export async function ensureBlockingTextures () {
  if (blockingTexturesLoaded) {
    return blockingTextures
  }

  if (blockingTexturesLoading != null) {
    return blockingTexturesLoading
  }

  blockingTexturesLoading = fetch('/api/debug/blocking-tiles')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }
      return res.json()
    })
    .then((data) => {
      const textures = data?.textures
      if (Array.isArray(textures) && textures.length > 0) {
        blockingTextures = new Set(textures)
      }
      blockingTexturesLoaded = true
      return blockingTextures
    })
    .catch(() => {
      blockingTextures = new Set(DEFAULT_BLOCKING_TEXTURES)
      blockingTexturesLoaded = true
      return blockingTextures
    })
    .finally(() => {
      blockingTexturesLoading = null
    })

  return blockingTexturesLoading
}

export function isTileBlocked (tile) {
  if (tile == null) {
    return true
  }

  return blockingTextures.has(tile.textureName)
}

export function isCollisionDebugEnabled () {
  return window.gameState?.collisionDebugEnabled === true
}

export async function refreshCollisionDebugOverlay () {
  const scene = window.gameState?.gridScene
  if (scene == null) {
    return
  }

  if (!isCollisionDebugEnabled()) {
    scene.hideCollisionDebugOverlay()
    return
  }

  await ensureBlockingTextures()
  scene.showCollisionDebugOverlay(isTileBlocked)
}

export async function toggleCollisionDebug () {
  if (window.gameState?.gridScene == null) {
    return 'grid not loaded'
  }

  window.gameState.collisionDebugEnabled = !isCollisionDebugEnabled()
  await refreshCollisionDebugOverlay()

  if (!isCollisionDebugEnabled()) {
    return 'collision debug overlay disabled'
  }

  const blockedCount = window.gameState.gridScene?.countCollisionTiles?.(isTileBlocked) ?? '?'
  const passableCount = window.gameState.gridScene?.countPassableTiles?.(isTileBlocked) ?? '?'
  return [
    'collision debug overlay enabled',
    `blocked tiles: ${blockedCount}`,
    `passable tiles: ${passableCount}`,
    'green = passable, red = blocked'
  ]
}

export { TILE_SIZE }
