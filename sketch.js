let closedSet = [];
let openSet = [];
let path = [];
let grid;
let cols;
let rows;
let resolution = 16;
let ant;
let targetSpotted = false;
let targetSpot;
let diagonal = false;
let start = true;
let respawningFood = 3;

function Spot(x, y, value) {
  this.x = x;
  this.y = y;
  this.state = value;

  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.neighborsDiagonal = [];
  this.previous = undefined;
  this.wall = false;
  this.difficulty = 0;

  this.addNeighbors = function (grid) {
    let i = this.x / resolution;
    let j = this.y / resolution;

    if (i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
    if (i > 0 && j > 0) {
      this.neighbors.push(grid[i - 1][j - 1]);
      this.neighborsDiagonal.push(grid[i - 1][j - 1]);
    }
    if (i < cols - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]);
      this.neighborsDiagonal.push(grid[i + 1][j - 1]);
    }
    if (i > 0 && j < rows - 1) {
      this.neighbors.push(grid[i - 1][j + 1]);
      this.neighborsDiagonal.push(grid[i - 1][j + 1]);
    }
    if (i < cols - 1 && j < rows - 1) {
      this.neighbors.push(grid[i + 1][j + 1]);
      this.neighborsDiagonal.push(grid[i + 1][j + 1]);
    }
  };

  /*if (random(1) < 0.1) {
    //walls
    this.wall = true;
    this.state = 2;
  }*/

  if (random(1) < 0.3 && this.wall == false) {
    //obstacls
    this.difficulty = 2;
    this.state = 3;
  }

  this.show = function (resolution) {
    fill(0);
    if (this.state == 1) {
      fill(0, 255, 0);
    } else if (this.state == -1) {
      fill(80, 0, 0, 70);
    } else if (this.state == 2) {
      fill(0);
    } else if (this.state == 3) {
      fill(GRAY);
    } else if (this.state == 0) {
      fill(255);
    }
    stroke(0);
    rect(this.x, this.y, resolution - 1, resolution - 1);
  };
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function setup() {
  createCanvas(800, 800);

  cols = width / resolution;
  rows = height / resolution;

  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = 0;
      if (random() < 0.0025) {
        state = 1;
      }
      grid[i][j] = new Spot(i * resolution, j * resolution, state);
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  ant = new Ant(400, 400);
  openSet.push(grid[ant.x / resolution][ant.y / resolution]);
}

function draw() {
  background(255);

  let shortestDist = 5000;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(resolution);
      if (targetSpotted == false && grid[i][j].state == 1) {
        let d = dist(ant.x, ant.y, grid[i][j].x, grid[i][j].y);
        if (d < shortestDist) {
          shortestDist = d;
          targetSpot = grid[i][j];
        }
      }
    }
  }
  targetSpotted = true;
  grid[ant.x / resolution][ant.y / resolution].state = -1;

  if (start) {
    start = false;
    current = grid[ant.x / resolution][ant.y / resolution];
  }

  if (current == targetSpot) {
    for (let i = 0; i < path.length; i++) {
      ant.x = path[i].x;
      ant.y = path[i].y;
      ant.show(resolution);
      grid[ant.x / resolution][ant.y / resolution].state = -1;
      grid[ant.x / resolution][ant.y / resolution].difficulty = -1; //paths walked before are easier to use again
    }
    ant.x = targetSpot.x;
    ant.y = targetSpot.y;
    grid[targetSpot.x / resolution][targetSpot.y / resolution].state = -1;
    targetSpotted = false;
    for (let i = 0; i < floor(random(respawningFood)); i++) {
      grid[floor(random(cols))][floor(random(rows))].state = 1;
    }
    openSet = [];
    closedSet = [];
    path = [];
    current = grid[ant.x / resolution][ant.y / resolution];
    openSet.push(current);
    shortestDist = 5000;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].g = 0;
        grid[i][j].h = 0;
        grid[i][j].f = 0;
        grid[i][j].previous = undefined;
        if (targetSpotted == false && grid[i][j].state == 1) {
          let d = dist(ant.x, ant.y, grid[i][j].x, grid[i][j].y);
          if (d < shortestDist) {
            shortestDist = d;
            targetSpot = grid[i][j];
          }
        }
      }
    }
    targetSpotted = true;
  }

  if (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    current = openSet[lowestIndex];

    for (let i = 0; i < path.length; i++) {
      ant.x = path[i].x;
      ant.y = path[i].y;
      ant.show(resolution);
    }

    path = [];
    let temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    openSet.splice(lowestIndex, 1);
    closedSet.push(current);
    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG;
        if (current.neighborsDiagonal.includes(neighbor)) {
          tempG = current.g + 1.41 + current.difficulty;
        } else {
          tempG = current.g + 1 + current.difficulty;
        }

        let newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        if (newPath) {
          neighbor.h = heuristic(neighbor, targetSpot);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  }
}

function heuristic(a, b) {
  let d = dist(a.x / resolution, a.y / resolution, b.x / resolution, b.y / resolution);
  return d;
}
