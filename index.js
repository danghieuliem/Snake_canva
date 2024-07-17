const CONFIG_GAME = {
  blockSize: 20,
  height: 20,
  width: 30,
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
 * @param {{x: number, y: number}} param0
 */
const SnakeMap = (param) => {
  // ** game map
  // 'null' | 'food' | 'snake' | 'wall'[][]
  let gameMap = {};

  const init = () => {
    for (let x = 0; x < param.x; ++x) {
      for (let y = 0; y < param.y; ++y) {
        gameMap[JSON.stringify({ x, y })] = "null";
      }
    }
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

  const getGameMap = () => {
    return gameMap;
  };

  return { init, setMapKey, getMapXY, setMapXY, getMapKey, getGameMap };
};

/**
 *
 * @param {{ config, snake, getGame, updateGame, food }} param0
 * @returns
 */
const Control = ({ config, snake, getGame, updateGame, food }) => {
  const install = () => {
    document.onkeydown = (e) => {
      if (!snake.getCanUpdateDirection()) return;
      snake.setCanUpdateDirection(false);
      snake.setDirection(
        {
          ArrowUp: snake.getDirection() != "down" ? "up" : "'down'",
          ArrowRight: snake.getDirection() != "left" ? "right" : "left",
          ArrowDown: snake.getDirection() != "up" ? "down" : "up",
          ArrowLeft: snake.getDirection() != "right" ? "left" : "right",
        }[e.key] ?? snake.getDirection()
      );
    };

    document.getElementById("btn-top").onclick = () => {
      clearInterval(getGame());
      updateGame(null);
    };

    document.getElementById("btn-reset").onclick = () => {
      window.location.reload();
    };

    document.getElementById("btn-continue").onclick = () => {
      getGame() ??
        updateGame(
          setInterval(() => {
            snake.updateSnake();
            if (food.getIsFoodAte()) food.renderFood();
          }, config.speed)
        );
    };
  };

  const uninstall = () => {
    document.onkeydown = null;
    document.getElementById("btn-top").onclick = null;
    document.getElementById("btn-reset").onclick = null;
    document.getElementById("btn-continue").onclick = null;
    document.getElementById("input-height").onclick = null;
  };

  return { install, uninstall };
};

/**
 *
 * @param {{ config, food, utils, map, getGame }} param0
 * @returns
 */
const Snake = ({ config, food, utils, map, getGame }) => {
  // gender snake
  let canUpdateDirection = true;
  let direction = config.snake.direction;
  let gameSnake = [...config.snake.location];

  const init = () => {
    canUpdateDirection = true;
    direction = config.snake.direction;
    gameSnake = [...config.snake.location];
    gameSnake.forEach((e) => {
      map.setMapXY({ ...e }, "snake");
      utils.fillBlock(e);
    });
  };

  const getCanUpdateDirection = () => {
    return canUpdateDirection;
  };
  /**
   *
   * @param {boolean} val
   */
  const setCanUpdateDirection = (val) => {
    canUpdateDirection = val;
  };

  const getDirection = () => {
    return direction;
  };
  /**
   *
   * @param {"up" | "right" | "down" | "left"} val
   * @returns
   */
  const setDirection = (val) => {
    direction = val;
  };

  /**
   *
   * @param {
   *    direction: 'up' | 'right' | 'down' | 'left',
   *  } param
   */
  const updateSnake = () => {
    const tmpHead = { ...gameSnake[0] };
    switch (direction) {
      case "up":
        --gameSnake[0].y;
        if (gameSnake[0].y < 0) gameSnake[0].y = config.height - 1;
        break;
      case "right":
        ++gameSnake[0].x;
        if (gameSnake[0].x > config.width - 1) gameSnake[0].x = 0;
        break;
      case "down":
        ++gameSnake[0].y;
        if (gameSnake[0].y > config.height - 1) gameSnake[0].y = 0;
        break;
      case "left":
        --gameSnake[0].x;
        if (gameSnake[0].x < 0) gameSnake[0].x = config.width - 1;
        break;
    }
    if (map.getMapXY(gameSnake[0]) === "snake") {
      clearInterval(getGame());
      alert("gameOver!");
    } else if (map.getMapXY(gameSnake[0]) === "food") {
      food.setIsFoodAte(true);
      gameSnake = [
        gameSnake[0],
        tmpHead,
        ...gameSnake.slice(1, gameSnake.length),
      ];
    } else {
      utils.fillBlock({
        ...gameSnake[gameSnake.length - 1],
        color: config.backgroundColor,
      });

      map.setMapXY({ ...gameSnake[gameSnake.length - 1] }, "null");

      gameSnake = [
        gameSnake[0],
        tmpHead,
        ...gameSnake.slice(1, gameSnake.length - 1),
      ];
    }

    utils.fillBlock(gameSnake[0]);
    map.setMapXY(gameSnake[0], "snake");
    canUpdateDirection = true;
  };

  return {
    updateSnake,
    init,
    setCanUpdateDirection,
    getCanUpdateDirection,
    getDirection,
    setDirection,
  };
};

/**
 *
 * @param {{ map, config, utils }} param0
 * @returns
 */
const Food = ({ map, config, utils }) => {
  // food
  let isFoodAte = true;

  const getIsFoodAte = () => {
    return isFoodAte;
  };

  /**
   *
   * @param {boolean} val
   */
  const setIsFoodAte = (val) => {
    isFoodAte = val;
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const renderFood = async () => {
    const listKey = [];
    Object.keys(map.getGameMap()).forEach((key) => {
      if (map.getMapKey(key) === "null") listKey.push(key);
    });
    var a = listKey[randomIntFromInterval(0, listKey.length - 1)];
    const { x, y } = JSON.parse(a);
    map.setMapXY({ x, y }, "food");
    utils.fillBlock({ x, y, color: config.food.color });
    isFoodAte = false;
  };

  return { renderFood, getIsFoodAte, setIsFoodAte };
};

const Utils = ({ mainView, config }) => {
  /**
   *
   * @param {{
   *    x: number,
   *    y: number,
   *    color?: string
   *  }} param
   */
  const fillBlock = ({ x, y, color = config.snake.color }) => {
    const block = mainView.getContext("2d");
    block.fillStyle = color;
    block.fillRect(
      x * config.blockSize + config.snake.spacePart,
      y * config.blockSize + config.snake.spacePart,
      config.blockSize - config.snake.spacePart * 2,
      config.blockSize - config.snake.spacePart * 2
    );
  };

  return { fillBlock };
};

const Game = () => {
  let game = null;
  const mainView = document.getElementById("main-view");
  const config = { ...CONFIG_GAME };
  const map = SnakeMap({ x: config.width, y: config.height });
  const utils = Utils({ config, mainView });
  const food = Food({ map, config, utils });
  const snake = Snake({ map, config, utils, food, getGame: () => game });
  const control = Control({
    config,
    snake,
    food,
    getGame: () => game,
    updateGame: (val) => (game = val),
  });
  const init = () => {
    // **init game view

    mainView.width = config.width * config.blockSize;
    mainView.height = config.height * config.blockSize;

    const gameView = mainView.getContext("2d");
    gameView.fillStyle = config.backgroundColor;
    gameView.fillRect(
      0,
      0,
      config.width * config.blockSize,
      config.height * config.blockSize
    );
  };
  const start = () => {
    init();
    control.install();
    map.init();
    snake.init();
  };
  return { start };
};

Game().start();
