import Phaser from '../phaser.min.js'

export default class GridScene extends Phaser.Scene {
  grid = null
  preloaded = false

  entities = {}

  constructor(grid) {
    super(new Date().toString())
    this.grid = grid
  }


  preload() {
    this.load.setBaseURL('https://' + window.location.host + '/res/')
    this.load.image('construct.png', 'img/textures/tiles/construct.png')

    for (const entdef of window.gameState.entdefs.entries()) {
      this.preloadEntdefSprite(entdef[1])
    }

    this.load.atlas('water', 'img/textures/fluids/water.png', 'atlas/water.json')

    this.layerGrid = this.add.layer()
    this.layerEntities = this.add.layer()

    this.preloadAllGridTextures()
    this.preloaded = true
  }

  preloadEntdefSprite(entdef) {
    this.load.spritesheet(entdef.name, 'img/textures/entities/' + entdef.texture, {
      frameWidth: 15,
      frameHeight: 15,
    })
  }

  create() {
    this.anims.create({
      key: 'water',
      frames: this.anims.generateFrameNames('water', { prefix: '', end: 2}),
      repeat: -1,
      duration: 1500,
    })

    this.cursors = this.input.keyboard.createCursorKeys()
    this.pointer = this.input.activePointer;

    this.renderGrid()

    this.renderEntities()
  }

  mnuClicked() {
    console.log("mnu!")
  }

  update() {
    this.updateCursorKeys()
    this.updateGamepad()
//    this.updateInputPointer()
//    this.renderGrid()
//    this.renderEntities()

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

  updateCursorKeys() {
    if (this.cursors.left.isDown)   window.serverConnection.sendMoveRequest({x: -1, y: 0});
    if (this.cursors.right.isDown)  window.serverConnection.sendMoveRequest({x: 1, y: 0});
    if (this.cursors.up.isDown)     window.serverConnection.sendMoveRequest({x: 0, y: -1});
    if (this.cursors.down.isDown)   window.serverConnection.sendMoveRequest({x: 0, y: 1});
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
    if (ent.img == null) {
      let img

      if (ent.definition == 'player') {
        img = this.physics.add.sprite(ent.x, ent.y, ent.texture)
        img.setCollideWorldBounds(true)

        this.cameras.main.startFollow(img, false, 0.05, 0.05)
      } else {
        img = this.add.sprite(ent.x, ent.y, ent.texture)
      }

      this.createEntityAnimations(img, ent.definition)

      img.setOrigin(0)
      img.play(ent.initialState)

      ent.img = img

      this.layerEntities.add(ent.img)
    }

    //console.log(ent.img)
    //this.add.image(ent.x, ent.y, ent.texture)
  }

  createEntityAnimations(img, definition) {
    const entdef = window.gameState.entdefs.get(definition)

    for (const state of entdef.states) {
//      console.log('creating animation for ', definition, 'state:', state.name, 'with frames:', state.frames)

      img.anims.create({
        key: state.name,
        frameRate: 2,
        frames: this.anims.generateFrameNumbers(definition, {frames: state.frames}),
        repeat: -1
      })
    }

    if (definition == 'player') {
      img.anims.create({
        key: 'walkLeft',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(definition, {start: 4, end: 7}),
        repeat: 0,
      })

      img.anims.create({
        key: 'walkRight',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(definition, {start: 8, end: 11}),
        repeat: 0,
      })

      img.anims.create({
        key: 'walkUp',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(definition, {start: 12, end: 15}),
        repeat: 0,
      })

      img.anims.create({
        key: 'walkDown',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(definition, {start: 16, end: 19}),
        repeat: 0,
      })
    }
  }

  renderGrid() {
    const tiles = this.grid.allTiles()

    for (const index in tiles) {
      this.renderTile(tiles[index])
    }
  }

  renderTile(tile) {
    const tileSize = 16

    const posX = (tileSize / 2) + (tile.col * tileSize)
    const posY = (tileSize / 2) + (tile.row * tileSize)

    if (tile.textureName == 'water.png') {
      const water = this.add.sprite((tile.col*tileSize), (tile.row*tileSize), 'water').setOrigin(0).play('water')

      this.layerGrid.add(water)
      return
    }


    /*
    if (true) {
      //      this.add.text((tile.col * tileSize), (tile.row*tileSize), tile.textureName, {fontFamily: "sans-serif", fontSize: 8, color: "black"})

      //this.add.text(0, 0, 'Hello World', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    }
    */

    const tex = this.add.image(posX, posY, tile.textureName)
    this.layerGrid.add(tex)
    tex.angle = tile.textureRotation
    tex.flipX = tile.textureHorizontalFlip
    tex.flipY = tile.textureVerticalFlip
  }

  preloadAllGridTextures() {
    for (const tile of this.grid.allTiles()) {
      this.load.image(tile.textureName, 'img/textures/tiles/' + tile.textureName)
    }
  }

  renderConnectionResponse(r) {
    this.text = 'Server: ' + r.serverVersion
  }

  onEntitySpawn(ent) {
    console.log('ent spawn', ent.definition, ent.initialState, ent.entityId, ent.x, ent.y)
    ent.img = null

    this.entities[ent.entityId] = ent
  }

  onEntityPosition(entpos) {
    let ent = this.entities[entpos.entityId]

    if (ent == null) {
      console.log('cannot find ent to reposition', entpos.entityId)
      return
    }

    if (ent.img != null) {
      //ent.img.setVelocity(0)

      if (ent.img.x != entpos.x || ent.img.y != entpos.y) {
        if (entpos.x > ent.img.x) {
          ent.img.play('walkLeft')
        } else if (entpos.x < ent.img.x) {
          ent.img.play('walkRight')
        } else if (entpos.y > ent.img.y) {
          ent.img.play('walkDown')
        } else {
          ent.img.play('walkUp')
        }

        ent.img.playAfterRepeat('idle')

        ent.img.x = entpos.x
        ent.img.y = entpos.y

        //ent.img.setVelocityX(20)
        //ent.img.setVelocityY(20)
      }

    }
  }

  onEntityChange(ec) {
    console.log('entchange', ec)

    let ent = this.entities[ec.entityId]

    if (ent == null) {
      console.log('cannot find ent to change', ec.entityId)
      return
    }

    let newState = window.gameState.entdefs.get(ent.definition)
    //    console.log("newstate", ec.newState, newState)

    ent.img.play(ec.newState)
  }
}
