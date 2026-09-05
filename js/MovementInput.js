let keyboard = null
let cursors = null
let wasd = null
let initialized = false

const MOVE_INTERVAL_MS = 67

export function initMovementInput (scene) {
  if (initialized) {
    return
  }

  initialized = true
  keyboard = scene.input.keyboard
  keyboard.enabled = true
  keyboard.addCapture([
    'W', 'A', 'S', 'D',
    'UP', 'DOWN', 'LEFT', 'RIGHT'
  ])
  cursors = keyboard.createCursorKeys()
  wasd = keyboard.addKeys('W,A,S,D')
}

export function pollMovementInput () {
  if (keyboard == null || !window.serverConnection?.isOk) {
    return
  }

  if (!window.phaser?.scene?.isActive('grid')) {
    return
  }

  if (window.menuSystem?.isOpen()) {
    return
  }

  if (window.gameConsole?.isOpen()) {
    return
  }

  const directions = [
    { keys: [cursors.left, wasd.A], x: -1, y: 0 },
    { keys: [cursors.right, wasd.D], x: 1, y: 0 },
    { keys: [cursors.up, wasd.W], x: 0, y: -1 },
    { keys: [cursors.down, wasd.S], x: 0, y: 1 }
  ]

  for (const dir of directions) {
    for (const key of dir.keys) {
      if (key != null && keyboard.checkDown(key, MOVE_INTERVAL_MS)) {
        window.serverConnection.sendMoveRequest({ x: dir.x, y: dir.y })
        return
      }
    }
  }
}

export function isMovementKeyDown () {
  if (keyboard == null) {
    return false
  }

  return (
    cursors.left.isDown ||
    cursors.right.isDown ||
    cursors.up.isDown ||
    cursors.down.isDown ||
    wasd.A.isDown ||
    wasd.D.isDown ||
    wasd.W.isDown ||
    wasd.S.isDown
  )
}
