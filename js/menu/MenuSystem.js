import { MENU_THEME } from './MenuTheme.js'

const DEFAULT_MENU_ID = 'main'

export default class MenuSystem {
  constructor (game) {
    this.game = game
    this.menus = new Map()
    this.stack = []
    this.sceneKey = 'menu'
    this.boundScene = null
    this.ui = null
  }

  static init (game) {
    if (window.menuSystem == null) {
      window.menuSystem = new MenuSystem(game)
    }
    return window.menuSystem
  }

  registerMenu (config) {
    if (config?.id == null) {
      throw new Error('MenuSystem.registerMenu requires an id')
    }

    this.menus.set(config.id, {
      id: config.id,
      title: config.title ?? config.id,
      subtitle: config.subtitle ?? '',
      items: config.items ?? []
    })

    return this
  }

  getMenu (menuId) {
    return this.menus.get(menuId)
  }

  currentMenuId () {
    return this.stack[this.stack.length - 1] ?? null
  }

  currentMenu () {
    const id = this.currentMenuId()
    return id == null ? null : this.getMenu(id)
  }

  isOpen () {
    return this.game.scene.isActive(this.sceneKey)
  }

  open (menuId = DEFAULT_MENU_ID) {
    if (!this.menus.has(menuId)) {
      console.warn('[MenuSystem] unknown menu:', menuId)
      return
    }

    this.stack = [menuId]
    this.ensureSceneRunning()
    this.render()
  }

  close () {
    this.stack = []
    this.clearUi()

    if (this.game.scene.isActive(this.sceneKey)) {
      this.game.scene.stop(this.sceneKey)
    }
  }

  toggle (menuId = DEFAULT_MENU_ID) {
    if (this.isOpen()) {
      this.close()
    } else {
      this.open(menuId)
    }
  }

  navigateTo (menuId) {
    if (!this.menus.has(menuId)) {
      console.warn('[MenuSystem] unknown menu:', menuId)
      return
    }

    this.stack.push(menuId)
    this.render()
  }

  navigateBack () {
    if (this.stack.length <= 1) {
      this.close()
      return
    }

    this.stack.pop()
    this.render()
  }

  ensureSceneRunning () {
    const mgr = this.game.scene
    if (!mgr.getScene(this.sceneKey)) {
      return
    }

    if (!mgr.isActive(this.sceneKey)) {
      mgr.run(this.sceneKey)
    }

    mgr.bringToTop(this.sceneKey)
    if (mgr.getScene('hud')) {
      mgr.bringToTop('hud')
    }
  }

  attachScene (scene) {
    this.boundScene = scene
    if (this.isOpen()) {
      this.render()
    }
  }

  detachScene () {
    this.clearUi()
    this.boundScene = null
  }

  clearUi () {
    if (this.ui?.root != null) {
      this.ui.root.destroy(true)
    }
    this.ui = null
  }

  resolveValue (value, ctx) {
    if (typeof value === 'function') {
      return value(ctx)
    }
    return value ?? true
  }

  render () {
    const scene = this.boundScene
    const menu = this.currentMenu()

    if (scene == null || menu == null) {
      return
    }

    this.clearUi()

    const root = scene.add.container(0, 0)
    root.setScrollFactor(0)
    root.setDepth(1000)

    const overlay = scene.add.rectangle(0, 0, 10, 10, MENU_THEME.bgOverlay, MENU_THEME.bgOverlayAlpha)
    overlay.setOrigin(0)
    overlay.setInteractive()
    overlay.on('pointerdown', () => this.close())

    const panelGfx = scene.add.graphics()
    const panelContainer = scene.add.container(0, 0)
    const title = scene.add.text(0, 0, menu.title, {
      fontFamily: MENU_THEME.fontFamily,
      fontSize: '28px',
      color: MENU_THEME.title,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0)

    const subtitle = menu.subtitle
      ? scene.add.text(0, 0, menu.subtitle, {
        fontFamily: MENU_THEME.fontFamily,
        fontSize: '13px',
        color: MENU_THEME.subtitle
      }).setOrigin(0.5, 0)
      : null

    const itemRows = []
    const ctx = {
      menuSystem: this,
      scene,
      game: this.game
    }

    if (this.stack.length > 1) {
      itemRows.push(this.makeItem(scene, {
        id: '__back',
        label: 'Back',
        action: () => this.navigateBack()
      }, ctx, itemRows.length))
    }

    for (const item of menu.items) {
      if (!this.resolveValue(item.visible ?? true, ctx)) {
        continue
      }

      itemRows.push(this.makeItem(scene, item, ctx, itemRows.length))
    }

    root.add([overlay, panelGfx, panelContainer, title])
    if (subtitle != null) {
      root.add(subtitle)
    }
    for (const row of itemRows) {
      root.add(row.container)
    }

    const layout = () => {
      const { width, height } = scene.scale
      const pad = 28
      const panelW = Math.min(360, width - 48)
      const rowH = 40
      const headerH = subtitle != null ? 88 : 64
      const panelH = pad * 2 + headerH + itemRows.length * rowH
      const panelX = (width - panelW) / 2
      const panelY = Math.max(24, (height - panelH) / 2)

      overlay.setPosition(0, 0)
      overlay.setSize(width, height)

      panelGfx.clear()
      panelGfx.fillStyle(MENU_THEME.panel, 1)
      panelGfx.fillRoundedRect(panelX, panelY, panelW, panelH, 8)
      panelGfx.lineStyle(2, MENU_THEME.panelBorderDark, 1)
      panelGfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 8)
      panelGfx.lineStyle(1, MENU_THEME.panelBorder, 0.9)
      panelGfx.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 6)

      title.setPosition(width / 2, panelY + pad + 4)
      if (subtitle != null) {
        subtitle.setPosition(width / 2, panelY + pad + 36)
      }

      let rowY = panelY + pad + headerH
      for (const row of itemRows) {
        row.container.setPosition(panelX + pad, rowY)
        row.hitArea.setSize(panelW - pad * 2, rowH - 4)
        row.label.setWordWrapWidth(panelW - pad * 2 - 16)
        rowY += rowH
      }
    }

    layout()
    scene.scale.off('resize', this.ui?.layoutHandler)
    this.ui = {
      root,
      layout,
      layoutHandler: layout
    }
    scene.scale.on('resize', layout)
  }

  makeItem (scene, item, ctx, index) {
    const container = scene.add.container(0, 0)
    const enabled = this.resolveValue(item.enabled ?? true, ctx)
    const labelColor = enabled ? MENU_THEME.item : MENU_THEME.itemDisabled

    const hitArea = scene.add.rectangle(0, 0, 10, 10, 0xffffff, 0.001)
    hitArea.setOrigin(0, 0)
    const label = scene.add.text(8, 18, item.label, {
      fontFamily: MENU_THEME.fontFamily,
      fontSize: '18px',
      color: labelColor
    }).setOrigin(0, 0.5)

    container.add([hitArea, label])

    if (enabled) {
      hitArea.setInteractive({ useHandCursor: true })
      hitArea.on('pointerover', () => label.setColor(MENU_THEME.itemHover))
      hitArea.on('pointerout', () => label.setColor(MENU_THEME.item))
      hitArea.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation()

        if (item.submenu != null) {
          this.navigateTo(item.submenu)
          return
        }

        if (typeof item.action === 'function') {
          item.action(ctx)
        }
      })
    }

    return { container, hitArea, label, index }
  }
}

export function registerDefaultMenus (menuSystem) {
  menuSystem.registerMenu({
    id: 'main',
    title: 'Menu',
    subtitle: 'Greyvar',
    items: [
      {
        id: 'continue',
        label: 'Continue',
        action: ({ menuSystem: ms }) => ms.close()
      },
      {
        id: 'fullscreen',
        label: 'Toggle fullscreen',
        action: () => {
          if (!window.phaser.scale.fullscreen.active) {
            window.phaser.scale.startFullscreen()
          } else {
            window.phaser.scale.stopFullscreen()
          }
        }
      },
      {
        id: 'reload',
        label: 'Reload game',
        action: () => window.location.reload()
      },
      {
        id: 'debug',
        label: 'Debug: dump movement state',
        action: () => window.dumpMovementDebug?.()
      }
    ]
  })
}
