class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static from(v) {
    return new Vector(v.x, v.y);
  }

  static fromRotation(rotation) {
    return new Vector(Math.cos(rotation), Math.sin(rotation));
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.add(Vector.from(v).multiply(-1));
    return this;
  }

  multiply(a) {
    this.x *= a;
    this.y *= a;
    return this;
  }

  normalize() {
    this.x /= this.length;
    this.y /= this.length;
    return this;
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

const canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 800;

const MAP_SIZE = 5000;
const CELL_RADIUS = 16;
const FOOD_RADIUS = 3;

let cameraPosition = new Vector(0, 0);
let facing = 0;

const ctx = canvas.getContext("2d");

class SnakeCell {
  constructor(x, y, facing = 0) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.facing = facing;
  }

  move(dt) {
    this.position.add(Vector.from(this.velocity).multiply(dt / 1000));
    this.velocity.add(Vector.from(this.acceleration).multiply(dt / 1000));
  }

  setFacing(rad) {
    this.facing = rad;
    this.facing += Math.PI * 2;
    this.facing %= Math.PI * 2;
  }
}

class Food {
  constructor(x, y) {
    this.position = new Vector(x, y);
  }
}

class Snake {
  cells = [];
  velocity = CELL_RADIUS * 8;
  turnSpeed = 2 * Math.PI;
  dead = false;

  constructor(x, y) {
    this.headPosition = new Vector(x, y);
  }

  addCell(cell) {
    this.cells.push(cell);
  }

  getCells() {
    return this.cells;
  }

  getLastCell() {
    return this.cells[this.cells.length - 1];
  }

  move(dt) {
    this.cells.forEach((cell, idx) => {
      let { position } = cell;

      if (idx > 0) {
        const linkedCell = this.cells[idx - 1];
        const positionLink = Vector.from(linkedCell.position)
          .subtract(position)
          .multiply(CELL_RADIUS);
        const newFacing = Math.atan2(positionLink.y, positionLink.x);
        cell.facing = newFacing;
        cell.velocity = positionLink;
      } else {
        cell.velocity = Vector.fromRotation(cell.facing).multiply(
          this.velocity
        );
      }

      cell.move(dt);
    });
  }

  grow() {
    this.addCell(
      new SnakeCell(
        this.getLastCell().position.x,
        this.getLastCell().position.y
      )
    );
    this.velocity += 0.5;
  }

  setFacing(rad) {
    this.cells[0].setFacing(rad);
  }

  getFacing() {
    return this.cells[0].facing;
  }
}

let snakes = [new Snake()];
const foods = [];
snakes[0].addCell(new SnakeCell(0, 0, Math.PI));
for (let i = 0; i < 5; i++) {
  snakes[0].addCell(new SnakeCell(0, 0));
}

for (let i = 0; i < 20; i++) {
  const snake = new Snake();
  snake.addCell(
    new SnakeCell(
      (Math.random() * MAP_SIZE * 2 - MAP_SIZE) / 3,
      (Math.random() * MAP_SIZE * 2 - MAP_SIZE) / 3
    )
  );
  snake.setFacing(Math.random() * 2 * Math.PI);
  for (let i = 0; i < 5; i++) {
    snake.addCell(
      new SnakeCell(
        snake.getCells()[0].position.x,
        snake.getCells()[0].position.y
      )
    );
  }
  snakes.push(snake);
}

for (let i = 0; i < 5000; i++) {
  foods.push(
    new Food(
      Math.random() * MAP_SIZE * 2 - MAP_SIZE,
      Math.random() * MAP_SIZE * 2 - MAP_SIZE
    )
  );
}

facing = Math.PI;

let lastDraw = performance.now();

function draw() {
  const t = performance.now();
  const dt = t - lastDraw;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#eee";
  ctx.textBaseline = "top";
  ctx.fillText(`x: ${cameraPosition.x}   y: ${cameraPosition.y}`, 10, 10);
  ctx.restore();

  ctx.save();

  ctx.translate(
    canvas.width / 2 - cameraPosition.x,
    canvas.height / 2 - cameraPosition.y
  );

  foods.forEach((food) => {
    ctx.save();
    ctx.fillStyle = "#eee";
    ctx.beginPath();
    ctx.translate(food.position.x, food.position.y);
    ctx.arc(0, 0, FOOD_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });

  snakes.forEach((snake, idx) => {
    ctx.save();
    ctx.font = `${CELL_RADIUS}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    snake
      .getCells()
      .slice()
      .reverse()
      .forEach((cell) => {
        ctx.save();
        ctx.translate(cell.position.x, cell.position.y);
        ctx.rotate(cell.facing - Math.PI / 2);
        ctx.fillText("😀", 0, 0);
        ctx.restore();
      });

    ctx.restore();

    const eatenFoodIdx = [];
    foods.forEach((food, idx) => {
      if (
        Vector.from(food.position).add(
          Vector.from(snake.getCells()[0].position).multiply(-1)
        ).length < CELL_RADIUS
      ) {
        eatenFoodIdx.push(idx);
      }
    });
    eatenFoodIdx.reverse().forEach((idx) => {
      foods.splice(idx, 1);
      snake.grow();
    });

    const hit = snakes
      .filter((s) => s !== snake)
      .some((s) =>
        s
          .getCells()
          .some(
            (cell) =>
              Vector.from(snake.getCells()[0].position).subtract(cell.position)
                .length <= CELL_RADIUS
          )
      );

    if (hit) {
      snake.dead = true;
    }

    snake.move(dt);

    if (idx === 0) {
      cameraPosition = snake.getCells()[0].position;
    }
  });

  snakes.slice(1).forEach((snake) => {
    snake.setFacing(snake.getFacing() + (Math.random() * 2 - 1) * 0.25);
  });

  snakes
    .filter((s) => s.dead)
    .forEach((s) => {
      s.getCells().forEach((cell) => {
        foods.push(new Food(cell.position.x, cell.position.y));
      });
    });
  snakes = snakes.filter((s) => !s.dead);

  ctx.restore();

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();

  ctx.rotate(facing);
  ctx.fillRect(200, 0, 50, 5);

  ctx.restore();

  requestAnimationFrame(draw);

  lastDraw = t;
}

document.addEventListener("pointermove", (e) => {
  const { clientX, clientY } = e;

  const { x: canvasX, y: canvasY } = canvas.getBoundingClientRect();
  const facingX = clientX - (canvasX + canvas.height / 2);
  const facingY = clientY - (canvasY + canvas.height / 2);

  facing = Math.atan2(facingY, facingX);
  snakes[0]?.setFacing(facing);
});

draw();
