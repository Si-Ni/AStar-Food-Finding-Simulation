function Ant(x, y) {
  this.x = x;
  this.y = y;

  this.move = function (deltaX, deltaY) {
    this.x += deltaX;
    this.y += deltaY;
  };

  this.show = function (resolution) {
    fill(255, 0, 0);
    stroke(0);
    rect(this.x, this.y, resolution - 1, resolution - 1);
  };
}
