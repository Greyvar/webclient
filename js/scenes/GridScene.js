import Phaser from 'phaser'
import { initMovementInput, pollMovementInput, isMovementKeyDown } from '../MovementInput.js'
import { TILE_SIZE, ENTITY_SIZE, isCollisionDebugEnabled, refreshCollisionDebugOverlay, tileCollisionRectsWorld, isLegacyTileBlocked } from '../collisionDebug.js'

const MOVE_DURATION_MS = 67
const SCROLL_TRANSITION_MS = 380

export default class GridScene extends Phaser.Scene {
  grid = null
  preloaded = false

  entities = {}

  isScrollTransitioning = false
  pendingTransitionSpawns = []

  constructor (grid) {
    super({ key: 'grid' })
    this.grid = grid
  }


  preload() {
    this.load.setBaseURL('/res/')
    this.load.image('construct.png', 'img/textures/tiles/construct.png')

    for (const entdef of window.gameState.entdefs.entries()) {
      this.preloadEntdefSprite(entdef[1])
    }

    this.load.atlas('water', 'img/textures/fluids/water.png', 'atlas/water.json')

    this.layerGrid = this.add.layer()
    this.layerEntities = this.add.layer()

    this.preloadTilesets()
    this.preloadAllGridTextures()
    this.preloaded = true
  }

  preloadEntdefSprite(entdef) {
    const frameSize = entdef.name === 'player' ? 16 : 15
    this.load.spritesheet(entdef.name, 'img/textures/entities/' + entdef.texture, {
      frameWidth: frameSize,
      frameHeight: frameSize,
    })
  }

  create() {
    console.log('[Greyvar] GridScene.create()', {
      tileCount: this.grid?.allTiles?.()?.length,
      entdefCount: window.gameState.entdefs.size
    })

    this.anims.create({
      key: 'water',
      frames: this.anims.generateFrameNames('water', { prefix: '', end: 2}),
      repeat: -1,
      duration: 1500,
    })

    this.pointer = this.input.activePointer

    this.renderGrid()
    this.renderEntities()
    this.configureCamera()
    this.entitiesReady = true

    initMovementInput(this)
    this.input.keyboard.enabled = true

    if (isCollisionDebugEnabled()) {
      refreshCollisionDebugOverlay()
    }
  }

  canRenderEntity () {
    return !this.load.isLoading()
  }

  spriteKeyForEntity (ent) {
    return ent.definition
  }

  initialStateForEntity (ent) {
    if (ent.initialState) {
      return ent.initialState
    }

    const entdef = window.gameState.entdefs.get(ent.definition)
    return entdef?.initialState ?? 'idle'
  }

  configureCamera () {
    const tileSize = 16
    const worldW = this.grid.colCount * tileSize
    const worldH = this.grid.rowCount * tileSize
    const cam = this.cameras.main

    cam.setBounds(0, 0, worldW, worldH)
    cam.setSize(this.scale.width, this.scale.height)
    cam.setZoom(6)
    cam.roundPixels = true
  }

  mnuClicked() {
    console.log("mnu!")
  }

  update() {
    if (this.isScrollTransitioning) {
      return
    }

    pollMovementInput()
    this.updateLocalPlayerIdleAnimation()
    this.updateGamepad()

    for (const id of Object.keys(this.entities)) {
      if (this.entities[id].img == null) {
        this.renderEntity(this.entities[id])
      }
    }

    if (isCollisionDebugEnabled() && this.collisionDebugPlayerOutline != null) {
      const localId = window.gameState?.localPlayerEntityId
      const ent = localId != null ? this.entities[localId] : null
      if (ent?.img != null) {
        this.collisionDebugPlayerOutline.setPosition(ent.img.x, ent.img.y)
      }
    }
  }

  updateInputPointer(){
    let p = this.input.activePointer

    if (p.isDown) {
      if (!this.scale.fullscreen.active) {
//        this.scale.startFullscreen()
      }

      window.serverConnection.sendMoveRequest({x: 0, y: 1});
    }
  }

  updateGamepad() {
    if (this.input.gamepad.total === 0) {
      return
    }

    var pad = this.input.gamepad.getPad(0)

    if (pad.axes.length) {
      var x = pad.axes[6].getValue()
      var y = pad.axes[7].getValue()

      console.log(x, y)

      window.serverConnection.sendMoveRequest({x: x, y: y})
    }
  }

  renderEntities() {
    for (const ent of Object.keys(this.entities)) {
      this.renderEntity(this.entities[ent])
    }
  }

  renderEntity(ent) {
    if (ent.img != null) {
      return
    }

    if (!this.canRenderEntity()) {
      return
    }

    const spriteKey = this.spriteKeyForEntity(ent)
    if (!spriteKey || !this.textures.exists(spriteKey)) {
      return
    }

    const entdef = window.gameState.entdefs.get(ent.definition)
    if (entdef == null) {
      return
    }

    const img = this.add.sprite(ent.x ?? 0, ent.y ?? 0, spriteKey)

    this.createEntityAnimations(img, ent.definition)

    img.setOrigin(0)
    img.play(this.initialStateForEntity(ent))

    ent.img = img

    this.layerEntities.add(ent.img)
    this.ensureCameraFollow(ent)
  }

  ensureCameraFollow (ent) {
    if (ent.definition !== 'player' || ent.img == null) {
      return
    }

    const localId = window.gameState.localPlayerEntityId
    if (localId == null || ent.entityId !== localId) {
      return
    }

    const cam = this.cameras.main
    if (cam._follow === ent.img) {
      return
    }

    cam.startFollow(ent.img, true, 0.15, 0.15)
    this.playerFollowTarget = ent.img
  }

  createEntityAnimations(img, definition) {
    const entdef = window.gameState.entdefs.get(definition)
    if (entdef == null) {
      return
    }

    for (const state of entdef.states) {
      if (state?.name == null || !Array.isArray(state.frames) || state.frames.length === 0) {
        continue
      }

      const isWalk = String(state.name).startsWith('walk')
      img.anims.create({
        key: state.name,
        frameRate: isWalk ? 8 : 2,
        frames: this.anims.generateFrameNumbers(definition, { frames: state.frames }),
        repeat: isWalk ? 0 : -1
      })
    }
  }

  renderGrid() {
    if (this.grid.layers?.length > 0) {
      for (const layerDef of this.grid.layers) {
        const phaserLayer = this.add.layer()
        this.layerGrid.add(phaserLayer)
        this.renderTiles(layerDef.tiles, { offsetX: 0, offsetY: 0, layer: phaserLayer })
      }
      return
    }

    this.renderGridIntoLayer(this.grid, 0, 0, this.layerGrid)
  }

  renderGridIntoLayer (grid, offsetX, offsetY, layer) {
    this.renderTiles(grid.allTiles(), { offsetX, offsetY, layer })
  }

  renderTiles (tiles, opts = {}) {
    for (const tile of tiles) {
      this.renderTile(tile, opts)
    }
  }

  renderTile(tile, opts = {}) {
    const tileSize = 16
    const offsetX = opts.offsetX ?? 0
    const offsetY = opts.offsetY ?? 0
    const layer = opts.layer ?? this.layerGrid

    const posX = offsetX + (tileSize / 2) + (tile.col * tileSize)
    const posY = offsetY + (tileSize / 2) + (tile.row * tileSize)

    if (tile.textureName == 'water.png') {
      const water = this.add.sprite(
        offsetX + (tile.col * tileSize),
        offsetY + (tile.row * tileSize),
        'water'
      ).setOrigin(0).play('water')

      layer.add(water)
      return
    }

    if (tile.atlasKey && tile.frameIndex != null && tile.frameIndex >= 0) {
      const img = this.add.image(posX, posY, tile.atlasKey, tile.frameIndex)
      layer.add(img)
      img.angle = tile.textureRotation
      img.flipX = tile.textureHorizontalFlip
      img.flipY = tile.textureVerticalFlip
      return
    }

    const tex = this.add.image(posX, posY, tile.textureName)
    layer.add(tex)
    tex.angle = tile.textureRotation
    tex.flipX = tile.textureHorizontalFlip
    tex.flipY = tile.textureVerticalFlip
  }

  preloadTilesets() {
    this.queueGridTextureLoads(this.grid)
  }

  preloadAllGridTextures() {
    this.queueGridTextureLoads(this.grid)
  }

  queueGridTextureLoads (grid) {
    for (const tileset of grid.tilesets ?? []) {
      if (!tileset.key || !tileset.image || this.textures.exists(tileset.key)) {
        continue
      }

      this.load.spritesheet(tileset.key, tileset.image, {
        frameWidth: tileset.tileWidth ?? 16,
        frameHeight: tileset.tileHeight ?? 16
      })
    }

    for (const tile of grid.allLayerTiles?.() ?? grid.allTiles()) {
      if (tile.atlasKey) {
        continue
      }

      if (tile.textureName?.includes('#')) {
        continue
      }

      if (this.textures.exists(tile.textureName)) {
        continue
      }

      this.load.image(tile.textureName, 'img/textures/tiles/' + tile.textureName)
    }
  }

  beginScrollTransition (newGrid, transition) {
    const deltaX = transition?.scrollDeltaX ?? 0
    const deltaY = transition?.scrollDeltaY ?? 0

    if (!transition || (deltaX === 0 && deltaY === 0)) {
      return false
    }

    if (this.isScrollTransitioning) {
      return false
    }

    this.isScrollTransitioning = true
    this.pendingTransitionSpawns = []
    this.activeTransition = {
      newGrid,
      deltaX,
      deltaY
    }

    this.queueGridTextureLoads(newGrid)

    if (this.load.isLoading()) {
      this.load.once('complete', () => this.runScrollTransition())
      this.load.start()
      return true
    }

    this.runScrollTransition()
    return true
  }

  runScrollTransition () {
    const { newGrid, deltaX, deltaY } = this.activeTransition
    const tileSize = 16
    const currentW = this.grid.colCount * tileSize
    const currentH = this.grid.rowCount * tileSize
    const newW = newGrid.colCount * tileSize
    const newH = newGrid.rowCount * tileSize
    const cam = this.cameras.main

    cam.stopFollow()

    const minX = Math.min(0, deltaX)
    const minY = Math.min(0, deltaY)
    const maxX = Math.max(currentW, deltaX + newW)
    const maxY = Math.max(currentH, deltaY + newH)
    cam.setBounds(minX, minY, maxX - minX, maxY - minY)

    this.incomingLayer = this.add.layer()
    if (newGrid.layers?.length > 0) {
      for (const layerDef of newGrid.layers) {
        this.renderTiles(layerDef.tiles, { offsetX: deltaX, offsetY: deltaY, layer: this.incomingLayer })
      }
    } else {
      this.renderGridIntoLayer(newGrid, deltaX, deltaY, this.incomingLayer)
    }

    const startScrollX = cam.scrollX
    const startScrollY = cam.scrollY

    this.tweens.add({
      targets: cam,
      scrollX: startScrollX + deltaX,
      scrollY: startScrollY + deltaY,
      duration: SCROLL_TRANSITION_MS,
      ease: 'Cubic.easeInOut',
      onComplete: () => this.finishScrollTransition()
    })
  }

  finishScrollTransition () {
    const { newGrid, deltaX, deltaY } = this.activeTransition

    if (this.incomingLayer != null) {
      this.incomingLayer.destroy(true)
      this.incomingLayer = null
    }

    this.layerGrid.removeAll(true)

    for (const ent of Object.values(this.entities)) {
      if (ent.img != null) {
        ent.img.x -= deltaX
        ent.img.y -= deltaY
      }
    }

    this.grid = newGrid
    window.gameState.grid = newGrid
    this.renderGrid()
    this.configureCamera()

    this.isScrollTransitioning = false
    this.activeTransition = null

    for (const ent of this.pendingTransitionSpawns) {
      this.onEntitySpawn(ent)
    }
    this.pendingTransitionSpawns = []

    const localId = window.gameState.localPlayerEntityId
    const localEnt = localId != null ? this.entities[localId] : null
    if (localEnt?.img != null) {
      this.ensureCameraFollow(localEnt)
    }

    if (isCollisionDebugEnabled()) {
      refreshCollisionDebugOverlay()
    }
  }

  queueTransitionSpawn (ent) {
    this.pendingTransitionSpawns.push(ent)
  }

  handleTransitionEntityPosition (entpos) {
    if (!this.isScrollTransitioning || this.activeTransition == null) {
      return false
    }

    const localId = window.gameState.localPlayerEntityId
    if (localId == null || entpos.entityId !== localId) {
      return false
    }

    const ent = this.entities[localId]
    if (ent?.img == null) {
      return false
    }

    const { deltaX, deltaY } = this.activeTransition
    ent.x = entpos.x
    ent.y = entpos.y

    if (ent.moveTween != null) {
      ent.moveTween.stop()
      ent.moveTween = null
    }

    ent.moveTween = this.tweens.add({
      targets: ent.img,
      x: entpos.x + deltaX,
      y: entpos.y + deltaY,
      duration: SCROLL_TRANSITION_MS,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        ent.moveTween = null
      }
    })

    return true
  }

  renderConnectionResponse(r) {
    this.text = 'Server: ' + r.serverVersion
  }

  onEntitySpawn (ent) {
    this.entities[ent.entityId] = ent
    this.renderEntity(ent)
  }

  onEntityDespawn (entityId) {
    const ent = this.entities[entityId]
    if (ent?.img != null) {
      ent.img.destroy()
    }

    delete this.entities[entityId]
  }

  playWalkAnimation (img, fromX, fromY, toX, toY) {
    if (toX > fromX) {
      img.play('walkRight')
    } else if (toX < fromX) {
      img.play('walkLeft')
    } else if (toY > fromY) {
      img.play('walkDown')
    } else if (toY < fromY) {
      img.play('walkUp')
    }
  }

  updateLocalPlayerIdleAnimation () {
    if (isMovementKeyDown()) {
      return
    }

    const localId = window.gameState?.localPlayerEntityId
    if (localId == null) {
      return
    }

    const ent = this.entities[localId]
    const img = ent?.img
    if (img == null || ent.definition !== 'player') {
      return
    }

    const animKey = img.anims?.currentAnim?.key
    if (animKey != null && animKey !== 'idle') {
      img.play('idle')
    }
  }

  moveEntityTo (ent, x, y) {
    const img = ent.img
    if (img == null) {
      return
    }

    if (img.x === x && img.y === y) {
      return
    }

    const fromX = img.x
    const fromY = img.y

    if (ent.definition === 'player') {
      this.playWalkAnimation(img, fromX, fromY, x, y)
    }

    if (ent.moveTween != null) {
      ent.moveTween.stop()
      ent.moveTween = null
    }

    ent.moveTween = this.tweens.add({
      targets: img,
      x,
      y,
      duration: MOVE_DURATION_MS,
      ease: 'Linear',
      onComplete: () => {
        ent.moveTween = null
      }
    })
  }

  onEntityPosition (entpos) {
    const ent = this.entities[entpos.entityId]

    if (ent == null) {
      return
    }

    ent.x = entpos.x
    ent.y = entpos.y

    if (ent.img == null) {
      this.renderEntity(ent)
    }

    if (ent.img == null) {
      return
    }

    this.ensureCameraFollow(ent)
    this.moveEntityTo(ent, entpos.x, entpos.y)

    const localId = window.gameState?.localPlayerEntityId
    if (isCollisionDebugEnabled() && localId != null && entpos.entityId === localId) {
      this.updateCollisionDebugPlayerOutline(entpos.x, entpos.y)
    }
  }

  onEntityChange(ec) {
    console.log('entchange', ec)

    let ent = this.entities[ec.entityId]

    if (ent == null) {
      console.log('cannot find ent to change', ec.entityId)
      return
    }

    if (ent.img?.anims?.exists(ec.newState)) {
      ent.img.play(ec.newState)
    }
  }

  showCollisionDebugOverlay () {
    this.hideCollisionDebugOverlay()
    this.layerCollisionDebug = this.add.layer()
    this.layerCollisionDebug.setDepth(20)

    for (let row = 0; row < this.grid.rowCount; row++) {
      for (let col = 0; col < this.grid.colCount; col++) {
        const tile = this.grid.topTileAt(row, col)
        if (tile == null) {
          continue
        }

        if (tile.collision?.length > 0) {
          for (const rect of tileCollisionRectsWorld(tile)) {
            const box = this.add.rectangle(
              rect.x,
              rect.y,
              rect.w,
              rect.h,
              0xff3333,
              0.55
            ).setOrigin(0)
            this.layerCollisionDebug.add(box)
          }
          continue
        }

        if (tile.collisionFromTsx) {
          continue
        }

        const blocked = isLegacyTileBlocked(tile)
        const cell = this.add.rectangle(
          col * TILE_SIZE,
          row * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          blocked ? 0xff3333 : 0x33ff66,
          blocked ? 0.35 : 0.18
        ).setOrigin(0)
        this.layerCollisionDebug.add(cell)
      }
    }

    const localId = window.gameState?.localPlayerEntityId
    const localEnt = localId != null ? this.entities[localId] : null
    if (localEnt?.img != null) {
      this.collisionDebugPlayerOutline = this.add.rectangle(
        localEnt.img.x,
        localEnt.img.y,
        ENTITY_SIZE,
        ENTITY_SIZE
      ).setOrigin(0).setStrokeStyle(1, 0x3399ff, 1).setFillStyle(0x3399ff, 0.12)
      this.layerCollisionDebug.add(this.collisionDebugPlayerOutline)
    }

    if (this.layerEntities) {
      this.layerEntities.setDepth(30)
    }
  }

  hideCollisionDebugOverlay () {
    if (this.layerCollisionDebug != null) {
      this.layerCollisionDebug.destroy(true)
      this.layerCollisionDebug = null
    }
    this.collisionDebugPlayerOutline = null
  }

  updateCollisionDebugPlayerOutline (x, y) {
    if (this.collisionDebugPlayerOutline != null) {
      this.collisionDebugPlayerOutline.setPosition(x, y)
    }
  }
}
