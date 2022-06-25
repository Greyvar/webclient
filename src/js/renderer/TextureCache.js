export default class TextureCache {
  constructor(ctx) {
    this.ctx = ctx;
    this.cache = [];
  }

  loadTexture(url) {
    var img = new Image;
    img.src = url;

    return img;
  }

  getTexture(key) {
    if (!(key in this.cache)) {
      this.cache[key] = this.loadTexture(key);
    }

    return this.cache[key];
  }

  getTile(key) {
    return this.getTexture("/webclient/res/img/textures/tiles/" + key)
  }
}
