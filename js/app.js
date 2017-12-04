let gBoard;
let gInterval;
let gState;

const IMG_FLAG = '<img src="img/flag.png" />';
const IMG_MINE = '<img src="img/bomb-25.png">';
const elMinesCount = document.querySelector('.count');

let gLevel = {
  borderSize: 4,
  minesCount: 2,
};

const gameLevel = {
  1: { borderSize: 4, minesCount: 2 },
  2: { borderSize: 6, minesCount: 5 },
  3: { borderSize: 8, minesCount: 15 },
};

function getState() {
  return {
    isGameOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
  };
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function cloneBoard(board) {
  return board.map((row, i) => row.map((col, j) => board[i][j]));
}

function setMines(board, minesCount) {
  let count = minesCount;
  const lBoard = cloneBoard(board);

  while (count > 0) {
    const cellI = getRandomIntInclusive(0, board.length - 1);
    const cellJ = getRandomIntInclusive(0, board.length - 1);

    if (!board[cellI][cellJ].isMine) {
      lBoard[cellI][cellJ].value = 'x';
      lBoard[cellI][cellJ].isMine = true;
      count -= 1;
    }
  }
  return lBoard;
}

function countNegs(board, cellI, cellJ) {
  let negsCount = 0;
  for (let i = cellI - 1; i <= cellI + 1; i += 1) {
    for (let j = cellJ - 1; j <= cellJ + 1; j += 1) {
      if (i === cellI && j === cellJ) continue;
      if (i < 0 || i >= board.length) continue;
      if (j < 0 || j >= board.length) continue;

      const cell = board[i][j];
      if (cell && cell.value === 'x') {
        negsCount += 1;
      }
    }
  }
  return negsCount;
}

function setNegs(board) {
  return board.map((row, i) => row.map((col, j) => {
    if (!board[i][j].isMine) {
      const cell = Object.assign({}, board[i][j]);
      cell.value = countNegs(board, i, j);
      return cell;
    }
    return board[i][j];
  }));
}

function buildBoard({ borderSize, minesCount }) {
  let board = [];

  for (let i = 0; i < borderSize; i += 1) {
    const row = [];
    for (let j = 0; j < borderSize; j += 1) {
      row.push({
        value: null, isClicked: false, isMine: false, isMarked: false,
      });
    }
    board.push(row);
  }
  board = setMines(board, minesCount);
  return setNegs(board);
}

function cellClicked(i, j) {
  if (gState.isGameOn) {
    expandShown(i, j);
  }
}

function makeElClass(i, j) {
  return `cell-${i}-${j}`;
}

function cellMarked(i, j) {
  const elClass = makeElClass(i, j);
  const count = (gLevel.borderSize ** 2) - gLevel.minesCount;

  if (gBoard[i][j].isClicked || !gState.isGameOn) return;

  const elCell = document.querySelector(`.${elClass}`);

  if (gBoard[i][j].isMarked) {
    elCell.innerHTML = '';
    gBoard[i][j].isMarked = false;
    gState.markedCount -= 1;
  } else {
    elCell.innerHTML = IMG_FLAG;
    gBoard[i][j].isMarked = true;
    gState.markedCount += 1;
  }

  if (gState.markedCount === gLevel.minesCount
      && gState.shownCount === count) {
    winGame();
  }
  elMinesCount.textContent = gLevel.minesCount - gState.markedCount;
}


function createElCell(i, j) {
  const td = document.createElement('td');
  const elClass = `cell-${i}-${j}`;
  td.className = elClass;
  td.addEventListener('click', () => cellClicked(i, j));
  td.addEventListener('contextmenu', () => cellMarked(i, j));
  return td;
}

function renderBoard(board, selectorTbl) {
  const elTable = document.querySelector(selectorTbl);
  elTable.innerHTML = '';

  board.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach((cell, j) => {
      const td = createElCell(i, j);
      tr.appendChild(td);
    });
    elTable.appendChild(tr);
  });
}

function setSizeOfGame(el) {
  gLevel = gameLevel[el.target.value];
  initGame();
}

function initGame() {
  const elTimer = document.querySelector('.text');
  const elminesCountCount = document.querySelector('.count');
  const elRes = document.querySelector('.resultPanel');
  const elBoardSize = document.querySelector('#boardSize');
  elBoardSize.addEventListener('change', event => setSizeOfGame(event));
  gBoard = buildBoard(gLevel);
  renderBoard(gBoard, 'table');
  gState = getState();
  gState.isGameOn = true;
  clearInterval(gInterval);

  elTimer.textContent = gState.secsPassed;
  elminesCountCount.textContent = gLevel.minesCount;
  elRes.textContent = '';
}

function winGame() {
  const elRes = document.querySelector('.resultPanel');
  gState.isGameOn = false;
  elRes.innerText = 'You win!!';
  clearInterval(gInterval);
}

function getColorForDigit(digit) {
  const colors = ['black', 'blue', 'green', 'white', 'orange', 'purple'];
  return colors[digit];
}

function loseGame(row, col) {
  const elRes = document.querySelector('.resultPanel');
  gState.isGameOn = false;
  clearInterval(gInterval);
  elRes.textContent = 'You lose!!';

  for (let i = 0; i < gBoard.length; i += 1) {
    for (let j = 0; j < gBoard.length; j += 1) {
      const elClass = makeElClass(i, j);
      const elCell = document.querySelector(`.${elClass}`);

      if (!gBoard[i][j].isMine) {
        continue;
      }

      if (i === row && j === col) {
        elCell.style.backgroundColor = 'red';
        elCell.innerHTML = IMG_MINE;
      } else if (!gBoard[i][j].isMine && gBoard[i][j].isMarked) {
        elCell.textContent = 'x';
      } else {
        elCell.innerHTML = IMG_MINE;
      }
    }
  }
}

function expandShown(i, j) {
  const elClass = makeElClass(i, j);
  const elCell = document.querySelector(`.${elClass}`);

  if (gBoard[i][j].isClicked || gBoard[i][j].isMarked) return;

  if (gBoard[i][j].isMine) {
    loseGame(i, j);
  } else {
    gState.shownCount += 1;
    if (gState.shownCount === 1) {
      gInterval = setInterval(() => {
        gState.secsPassed += 1;
        const elTimer = document.querySelector('.text');
        elTimer.innerText = gState.secsPassed;
      }, 1000);
    }
    elCell.style.backgroundColor = 'lightgrey';
    elCell.innerText = (gBoard[i][j].value !== 0) ? gBoard[i][j].value : '';
    elCell.style.color = getColorForDigit(gBoard[i][j].value);
    gBoard[i][j].isClicked = true;

    if (gBoard[i][j].value === 0) {
      for (let k = i - 1; k <= i + 1; k += 1) {
        for (let l = j - 1; l <= j + 1; l += 1) {
          if (k === i && l === j) continue;
          if (k < 0 || k >= gBoard.length) continue;
          if (l < 0 || l >= gBoard.length) continue;

          expandShown(k, l);
        }
      }
    }
    if (gState.shownCount === (gLevel.borderSize ** 2) - gLevel.minesCount
        && gState.markedCount === gLevel.minesCount) {
      winGame();
    }
  }
}

window.onload = () => initGame();

