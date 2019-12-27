export default class Tile {
  row = 0;
  col = 0;

  textureName = "res/img/textures/tiles/grass.png";
  textureHorizontalFlip = false;
  textureVerticalFlip = false;
  textureRotation = 0;

  constructor() {
    console.log("new tile");
  }
}
