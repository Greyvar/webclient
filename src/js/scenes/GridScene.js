import Phaser from '../phaser.min.js'

export default class GridScene extends Phaser.Scene {
  grid = null
  preloaded = false

  entities = {}

  setGrid(grid) {
    this.grid = grid
  }


  preload() {
    this.load.setBaseURL('http://mindstorm/greyvar-webclient/res/')
    this.load.image('construct.png', 'img/textures/tiles/construct.png')

    this.load.spritesheet('ss_playerBob.png', 'img/textures/entities/ss_playerBob.png', {
      frameWidth: 15,
      frameHeight: 15,
    })

    this.load.spritesheet('chest.png', 'img/textures/entities/chest.png', {
      frameWidth: 15,
      frameHeight: 15,
    })

    this.load.spritesheet('ss_flowers.png', 'img/textures/entities/ss_flowers.png', {
      frameWidth: 15,
      frameHeight: 15,
    })



    this.load.atlas('water', 'img/textures/fluids/water.png', 'atlas/water.json')

    this.layerGrid = this.add.layer()
    this.layerEntities = this.add.layer()

    this.preloadAllGridTextures(phaser)
    this.preloaded = true
  }

  create() {
    this.anims.create({
      key: 'water',
      frames: this.anims.generateFrameNames('water', { prefix: '', end: 2}), 
      repeat: -1,
      duration: 1500,
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    this.renderGrid()

    this.renderEntities()
  }

  update() {
    this.updateCursorKeys()
//    this.renderGrid()
    this.renderEntities()
  }

  updateCursorKeys() {
    if (this.cursors.left.isDown)   window.serverConnection.sendMoveRequest({x: -1, y: 0});
    if (this.cursors.right.isDown)  window.serverConnection.sendMoveRequest({x: 1, y: 0});
    if (this.cursors.up.isDown)     window.serverConnection.sendMoveRequest({x: 0, y: -1});
    if (this.cursors.down.isDown)   window.serverConnection.sendMoveRequest({x: 0, y: 1});
  }

  renderEntities() {
    for (const ent of Object.keys(this.entities)) {
      this.renderEntity(this.entities[ent])
    }
  }

  renderEntity(ent) {
    if (ent.img == null) {
      let img;

      if (ent.texture == "ss_playerBob.png") {
        img = this.physics.add.sprite(ent.x, ent.y, ent.texture)
        img.setCollideWorldBounds(true)
      } else {
        img = this.add.sprite(ent.x, ent.y, ent.texture)
      }

      this.createEntityAnimations(img, ent.texture)

      img.setOrigin(0)
      img.play('idle')

      ent.img = img

      this.layerEntities.add(ent.img)
    }

    //console.log(ent.img)
    //this.add.image(ent.x, ent.y, ent.texture)
  }

  createEntityAnimations(img, tex) {
    img.anims.create({
      key: 'idle',
      frameRate: 2,
      frames: this.anims.generateFrameNumbers(tex, {start: 0, end: 3}),
      repeat: -1
    });

    if (tex == "ss_playerBob.png") {
      img.anims.create({
        key: 'walkLeft',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(tex, {start: 4, end: 7}),
        repeat: 0,
      });

      img.anims.create({
        key: 'walkRight',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(tex, {start: 8, end: 11}),
        repeat: 0,
      });

      img.anims.create({
        key: 'walkUp',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(tex, {start: 12, end: 15}),
        repeat: 0,
      });

      img.anims.create({
        key: 'walkDown',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers(tex, {start: 16, end: 19}),
        repeat: 0,
      });
    }
  }

  renderGrid() {
    const tiles = this.grid.allTiles()

    for (const index in tiles) {
      this.renderTile(phaser, tiles[index])
    }
  }

  renderTile(phaser, tile) {
    const tileSize = 16

    const posX = (tileSize / 2) + (tile.col * tileSize)
    const posY = (tileSize / 2) + (tile.row * tileSize)

    if (tile.textureName == "water.png") {
      const water = this.add.sprite((tile.col*tileSize), (tile.row*tileSize), 'water').setOrigin(0).play('water')
      this.layerGrid.add(water)
      return
    }
    const tex = this.add.image(posX, posY, tile.textureName)
    this.layerGrid.add(tex)
    tex.angle = tile.textureRotation
    tex.flipX = tile.textureHorizontalFlip
    tex.flipY = tile.textureVerticalFlip
  }

  preloadAllGridTextures(phaser) {
    for (const tile of this.grid.allTiles()) {
      let r = this.load.image(tile.textureName, 'img/textures/tiles/' + tile.textureName)
    }
  }

  renderConnectionResponse(r) {
    this.text = "Server: " + r.serverVersion
  }

  onEntitySpawn(ent) {
    console.log("spawn", ent.texture, ent.entityId)
    ent.img = null
  
    this.entities[ent.entityId] = ent
  }

  onEntityPosition(entpos) {
    let ent = this.entities[entpos.entityId]

    if (ent == null) {
      console.log("cannot find ent to reposition", entpos.entityId)
      return
    }

    if (ent.img != null) {
      //ent.img.setVelocity(0)

      if (ent.img.x != entpos.x || ent.img.y != entpos.y) {
        if (entpos.x > ent.img.x) {
          ent.img.play("walkLeft")
        } else if (entpos.x < ent.img.x) {
          ent.img.play("walkRight")
        } else if (entpos.y > ent.img.y) {
          ent.img.play("walkDown")
        } else {
          ent.img.play("walkUp")
        }

        ent.img.playAfterRepeat("idle")

        ent.img.x = entpos.x
        ent.img.y = entpos.y

        //ent.img.setVelocityX(20)
        //ent.img.setVelocityY(20)
      }

    }
  }
}
