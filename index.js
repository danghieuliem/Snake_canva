const mainView = document.getElementById("main-view");

const CONFIG_GAME = {
  blockSize: 10,
  height: 10,
  width: 10,
  backgroundColor: "gray",
  speed: 100,
  food: {
    color: "red",
  },
  snake: {
    spacePart: 2,
    //"up" | "right" | "down" | "left"
    direction: "right",
    length: 4,
    color: "yellow",
    location: [
      { x: 4, y: 2 }, // <- Head
      { x: 3, y: 2 },
      { x: 2, y: 2 }, // <- Tail
    ],
  },
};

/**
 *
 * @param {{
 *    x: number,
 *    y: number,
 *    color?: string
 *  }} param
 */
const fillBlock = ({ x, y, color = CONFIG_GAME.snake.color }) => {
  const block = mainView.getContext("2d");
  block.fillStyle = color;
  block.fillRect(
    x * CONFIG_GAME.blockSize + CONFIG_GAME.snake.spacePart,
    y * CONFIG_GAME.blockSize + CONFIG_GAME.snake.spacePart,
    CONFIG_GAME.blockSize - CONFIG_GAME.snake.spacePart * 2,
    CONFIG_GAME.blockSize - CONFIG_GAME.snake.spacePart * 2
  );
};

// **init game view
mainView.width = CONFIG_GAME.width * CONFIG_GAME.blockSize;
mainView.height = CONFIG_GAME.height * CONFIG_GAME.blockSize;

const gameView = mainView.getContext("2d");
gameView.fillStyle = CONFIG_GAME.backgroundColor;
gameView.fillRect(
  0,
  0,
  CONFIG_GAME.width * CONFIG_GAME.blockSize,
  CONFIG_GAME.height * CONFIG_GAME.blockSize
);

// ** game map
// 'null' | 'food' | 'snake' | 'wall'[][]
let gameMap = {};
for (let x = 0; x < CONFIG_GAME.width; ++x) {
  for (let y = 0; y < CONFIG_GAME.height; ++y) {
    gameMap[JSON.stringify({ x, y })] = "null";
  }
}

/**
 *
 * @param {{ x: number, y }} param0
 * @returns 'null' | 'food' | 'snake' | 'wall'
 */
const getMapXY = ({ x, y }) => {
  return gameMap[JSON.stringify({ x, y })];
};

/**
 *
 * @param {{ x: number, y }} param0
 * @param {'null' | 'food' | 'snake' | 'wall'} val
 * @returns
 */
const setMapXY = ({ x, y }, val) => {
  return (gameMap[JSON.stringify({ x, y })] = val);
};

/**
 *
 * @param {string} key
 * @returns 'null' | 'food' | 'snake' | 'wall'
 */
const getMapKey = (key) => {
  return gameMap[key];
};

/**
 *
 * @param {string } key
 * @param {'null' | 'food' | 'snake' | 'wall'} val
 * @returns
 */
const setMapKey = (key, val) => {
  return (gameMap[key] = val);
};

// gender snake
let canUpdateDirection = true;
let gameDirection = CONFIG_GAME.snake.direction;
let gameSnake = [...CONFIG_GAME.snake.location];

gameSnake.forEach((e) => {
  setMapXY({ ...e }, "snake");
  fillBlock(e);
});

// food
let isFoodAte = true;

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const renderFood = async () => {
  const listKey = [];
  Object.keys(gameMap).forEach((key) => {
    if (getMapKey(key) === "null") listKey.push(key);
  });
  var a = listKey[randomIntFromInterval(0, listKey.length - 1)];
  const { x, y } = JSON.parse(a);
  setMapXY({ x, y }, "food");
  fillBlock({ x, y, color: CONFIG_GAME.food.color });
  isFoodAte = false;
};

// **
let game = null;

/**
 *
 * @param {
 *    direction: 'up' | 'right' | 'down' | 'left',
 *  } param
 */
const updateSnake = () => {
  const tmpHead = { ...gameSnake[0] };
  switch (gameDirection) {
    case "up":
      --gameSnake[0].y;
      if (gameSnake[0].y < 0) gameSnake[0].y = CONFIG_GAME.height - 1;
      break;
    case "right":
      ++gameSnake[0].x;
      if (gameSnake[0].x > CONFIG_GAME.width - 1) gameSnake[0].x = 0;
      break;
    case "down":
      ++gameSnake[0].y;
      if (gameSnake[0].y > CONFIG_GAME.height - 1) gameSnake[0].y = 0;
      break;
    case "left":
      --gameSnake[0].x;
      if (gameSnake[0].x < 0) gameSnake[0].x = CONFIG_GAME.width - 1;
      break;
  }
  if (getMapXY(gameSnake[0]) === "snake") {
    clearInterval(game);
    alert("gameOver!");
  } else if (getMapXY(gameSnake[0]) === "food") {
    isFoodAte = true;
    gameSnake = [
      gameSnake[0],
      tmpHead,
      ...gameSnake.slice(1, gameSnake.length),
    ];
  } else {
    fillBlock({
      ...gameSnake[gameSnake.length - 1],
      color: CONFIG_GAME.backgroundColor,
    });

    setMapXY({ ...gameSnake[gameSnake.length - 1] }, "null");

    gameSnake = [
      gameSnake[0],
      tmpHead,
      ...gameSnake.slice(1, gameSnake.length - 1),
    ];
  }

  fillBlock(gameSnake[0]);
  setMapXY(gameSnake[0], "snake");
  canUpdateDirection = true;
};

document.getElementById("btn-top").onclick = () => {
  clearInterval(game);
};

document.getElementById("btn-continue").onclick = () => {
  game = setInterval(() => {
    updateSnake();
    if (isFoodAte) renderFood();
    // renderFood();
  }, CONFIG_GAME.speed);
};

document.onkeydown = (e) => {
  if (!canUpdateDirection) return;
  canUpdateDirection = false;
  gameDirection =
    {
      ArrowUp: gameDirection != "down" ? "up" : "'down'",
      ArrowRight: gameDirection != "left" ? "right" : "left",
      ArrowDown: gameDirection != "up" ? "down" : "up",
      ArrowLeft: gameDirection != "right" ? "left" : "right",
    }[e.key] ?? gameDirection;
};
