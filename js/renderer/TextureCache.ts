export default class TextureCache {
  ctx = null;
  cache = []

  constructor(ctx) {
    this.ctx = ctx;
  }

  private loadTexture(url) {
    var img = new Image;
    img.src = url;
  }

  public getTexture(key) {
    if (!(key in this.cache)) {
      this.cache[key] = this.loadTexture(key);
    }

    return this.cache[key];
  }
}
