const SimplexNoise = require('simplex-noise'),
simplex = new SimplexNoise(Math.random);

const game = (xNum, yNum) => {
  let board;
  let playersPos = new Map();
  let players = new Map();

  const arrString = (arr) => arr.join(',');

  const clear = () => {
    board = new Array(yNum).fill(null).map(() => new Array(xNum).fill(null));
  };

  const terrain = () => {
    for (let i = 0; i < yNum; i++){
      for (let j = 0; j < xNum; j++){
        let value, noise = simplex.noise2D(j, i);
        if (noise > 0.65) {value = 1;}
        else {value = 0;}
        board[i][j] = value;
      }
    }
  }

  const addPlayer = (id) => {
    let pos = players.get(id);
    if (!pos) {
      let valid = 0;
      while (!valid){
        pos = [Math.round(Math.random() * xNum), Math.round(Math.random() * yNum)];
        if (board[pos[1]][pos[0]] == 0 && !playersPos.get(arrString(pos))) {
          valid = 1;
        }
        playersPos.set(arrString(pos), id);
        players.set(id, pos);
      }
    }

    const validateMove = (x, y, range) => {
      return  board[y][x] == 0 && Math.abs(pos[0] - x) <= range && Math.abs(pos[1] - y) <= range;
    };

    const makeMove = ([x, y]) => {
      if (!validateMove(x, y, 1) && !playersPos.get(arrString([x,y]))) {return false;}
      players.set(id, [x,y]);
      playersPos.delete(arrString(pos));
      playersPos.set(arrString([x,y]), id)
      pos = [x, y]
      return true;
    };

    const makeAttack = ([x, y]) => {
      if (!validateMove(x, y, 2)) {return false;}
      if (playersPos.get(arrString([x, y]))) {
        return true;
        // implement hitting other players
      }
    };
    return { makeMove, makeAttack, pos };
  }

  const getBoard = () => board;

  clear();
  terrain();
  return { getBoard, addPlayer };
};

module.exports = game;
