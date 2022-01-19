// const settings
const BOARD_SIZE = 8;
const MOVE_INTERVAL = 500;
const DEFAULT_SNAKE_DIRECTION = "right";

const SNAKE_VELOCITY = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1]
};

// cell elements references
const $cells = document.querySelectorAll("#app .cell");

// the front of the array is the head of the snake, vice versa
// default starting snake
const snakeCells = [
  [1, 3],
  [1, 2],
  [1, 1]
];

// positions of all food
const foodCells = [];

// current direction
let snakeDirection = DEFAULT_SNAKE_DIRECTION;

// prevent u-turns using record of last direction
let lastSnakeDirection = DEFAULT_SNAKE_DIRECTION;

let isGameover = false;
// null if not started, saving the interval id of moving ticks
let moveInterval = null;

// helper functions

// from 2d coords to 1d coords
const toIdx = ([x, y]) => x * BOARD_SIZE + y;

// vector addition
const vecAdd = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];

// check if position is in bound
const inBound = ([x, y]) =>
  0 <= x && x < BOARD_SIZE && 0 <= y && y < BOARD_SIZE;

// check if position has snake cell
const hasCell = ([x, y]) =>
  $cells[toIdx([x, y])].classList.contains("snake-cell");

// check if position has food
const hasFood = ([x, y]) =>
  $cells[toIdx([x, y])].classList.contains("food-cell");

// render the board
function render() {
  // reset all cells
  $cells.forEach((cell) => {
    ["snake-cell", "snake-head-cell", "food-cell"].forEach((className) => {
      cell.classList.remove(className);
    });
  });

  // draw snake cells
  snakeCells.forEach((cell, idx) => {
    // snake head
    if (idx === 0) $cells[toIdx(cell)].classList.add("snake-head-cell");

    // snake body
    $cells[toIdx(cell)].classList.add("snake-cell");

    // if the snake is dead
    if (isGameover) $cells[toIdx(cell)].classList.add("snake-cell-dead");
  });

  // draw foods
  foodCells.forEach((food) => {
    $cells[toIdx(food)].classList.add("food-cell");
  });
}

// tidy game
function gameOver() {
  isGameover = true;
  clearInterval(moveInterval);
  render();
}

// moving ticks
function move() {
  // the position that the snake head should be in after movement
  const newHead = vecAdd(snakeCells[0], SNAKE_VELOCITY[snakeDirection]);

  // if crashed on walls or body
  if (!inBound(newHead) || hasCell(newHead)) {
    gameOver();
    return;
  }

  // append the new head to the snake
  snakeCells.unshift(newHead);

  if (!hasFood(newHead)) {
    // delete the last cell of the snake
    snakeCells.splice(snakeCells.length - 1);
  } else {
    // keep the last cell for extension, and remove the food
    foodCells.pop();

    // generate new food
    genFood();
  }

  // update last direction
  lastSnakeDirection = snakeDirection;

  render();
}

// randomly generate a food on the board
function genFood() {
  // all empty cells
  const cells = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (!hasCell([i, j]) && !hasFood([i, j])) cells.push([i, j]);
    }
  }

  // put the food in a random one
  foodCells.push(cells[Math.floor(Math.random() * cells.length)]);
}

// handle keyboard input
document.addEventListener("keydown", (ev) => {
  switch (ev.code) {
    case "ArrowUp":
      // no u-turn
      if (lastSnakeDirection !== "down") {
        snakeDirection = "up";
      }
      ev.preventDefault();
      break;

    case "ArrowDown":
      // no u-turn
      if (lastSnakeDirection !== "up") {
        snakeDirection = "down";
      }
      ev.preventDefault();
      break;

    case "ArrowLeft":
      // no u-turn
      if (lastSnakeDirection !== "right") {
        snakeDirection = "left";
      }
      ev.preventDefault();
      break;

    case "ArrowRight":
      // no u-turn
      if (lastSnakeDirection !== "left") {
        snakeDirection = "right";
      }
      ev.preventDefault();
      break;

    default:
      break;
  }

  // start game on first key down
  if (!moveInterval) start();
});

// start game
function start() {
  genFood();
  moveInterval = setInterval(move, MOVE_INTERVAL);
}

// init
function init() {
  // init render
  render();
}

init();
