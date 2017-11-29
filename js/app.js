let gBoard;
let gInterval;
let gState;

const gLevel = {
  SIZE: 4,
  MINES: 2,
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
  const lMin = Math.ceil(min);
  const lMax = Math.floor(max);
  return Math.floor(Math.random() * (lMax - lMin + 1)) + lMin;
}

function setMines(board) {
  let minesCount = gLevel.MINES;
  const lBoard = board;

  while (minesCount > 0) {
    const cellI = getRandomIntInclusive(0, gLevel.SIZE - 1);
    const cellJ = getRandomIntInclusive(0, gLevel.SIZE - 1);

    if (!board[cellI][cellJ].isMine) {
      lBoard[cellI][cellJ].value = 'x';
      lBoard[cellI][cellJ].isMine = true;
      minesCount -= 1;
    }
  }
  return board;
}

function countNegs(board, cellI, cellJ) {
  let negsCount = 0;
  for (let i = cellI - 1; i <= cellI + 1; i += 1) {
    for (let j = cellJ - 1; j <= cellJ + 1; j += 1) {
      if (i === cellI && j === cellJ) continue;
      if (i < 0 || i >= board.length) continue;
      if (j < 0 || j >= board.length) continue;

      const cell = board[i][j].value;
      if (cell && cell === 'x') {
        negsCount += 1;
      }
    }
  }
  return negsCount;
}

function setMinesNegsCount(board) {
  const lBoard = board;

  for (let i = 0; i < board.length; i += 1) {
    for (let j = 0; j < board.length; j += 1) {
      if (!lBoard[i][j].isMine) {
        lBoard[i][j].value = +countNegs(board, i, j);
      }
    }
  }
  return lBoard;
}

function buildBoard(boardSize) {
  let board = [];

  for (let i = 0; i < boardSize; i += 1) {
    const row = [];
    for (let j = 0; j < boardSize; j += 1) {
      row.push({
        value: null, isClicked: false, isMine: false, isMarked: false,
      });
    }
    board.push(row);
  }
  board = setMines(board);
  return setMinesNegsCount(board);
}

function renderBoard(board, selectorTbl) {
  let strHtml = '';
  board.forEach((row, i) => {
    strHtml += '<tr>';
    row.forEach((cell, j) => {
      const elClass = ` class="cell-${i}-${j}"`;
      strHtml += `<td ${elClass} onclick="cellClicked(this, ${i}, ${j})"; oncontextmenu="cellMarked(this, ${i}, ${j})">`;
      strHtml += '</td>';
    });
    strHtml += '</tr>';
  });
  const elTable = document.querySelector(selectorTbl);
  elTable.innerHTML = strHtml;
  return elTable;
}

function initGame() {
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard, 'table');
  gState = getState();
  gState.isGameOn = true;

  const elTimer = document.querySelector('.text');
  elTimer.innerText = gState.secsPassed;
  const elMinesCount = document.querySelector('.count');
  elMinesCount.innerText = gLevel.MINES;
  const elRes = document.querySelector('.resultPanel');
  elRes.innerText = '';
  clearInterval(gInterval);
}

function setSizeOfGame(el) {
  switch (+el.value) {
    case 1:
      gLevel.SIZE = 4;
      gLevel.MINES = 2;
      break;
    case 2:
      gLevel.SIZE = 6;
      gLevel.MINES = 5;
      break;
    case 3:
      gLevel.SIZE = 8;
      gLevel.MINES = 15;
      break;
    default:
      break;
  }
  initGame();
}

function makeElClass(i, j) {
  return `.cell-${i}-${j}`;
}

function winGame() {
  gState.isGameOn = false;
  const elRes = document.querySelector('.resultPanel');
  elRes.innerText = 'You win!!';
  clearInterval(gInterval);
}

function cellMarked(elCell, i, j) {
  if (gBoard[i][j].isClicked || !gState.isGameOn) return;

  const lCell = elCell;
  const imgFlag = '<img src="img/flag.png" />';
  // const elClass = makeElClass(i, j);

  if (gBoard[i][j].isMarked) {
    lCell.innerHTML = '';
    gBoard[i][j].isMarked = false;
    gState.markedCount -= 1;
  } else {
    lCell.innerHTML = imgFlag;
    gBoard[i][j].isMarked = true;
    gState.markedCount += 1;
  }

  if (gState.markedCount === gLevel.MINES
      && gState.shownCount === (Math.pow(gLevel.SIZE, 2) - gLevel.MINES)) {
    winGame();
  }

  const elMinesCount = document.querySelector('.count');
  elMinesCount.innerText = gLevel.MINES - gState.markedCount;
}

function getColorForDigit(digit) {
  const colors = ['black', 'blue', 'green', 'white', 'orange', 'purple'];
  return colors[digit];
}

function loseGame(row, col) {
  gState.isGameOn = false;
  clearInterval(gInterval);
  const elRes = document.querySelector('.resultPanel');
  elRes.innerText = 'You lose!!';

  const imgMine = '<img src="img/bomb-25.png">';
  // const imgFlag = '<img src="img/flag.png">';
  // const imgNoMine = '<img src="img/no-bomb-25.png">';

  for (let i = 0; i < gBoard.length; i += 1) {
    for (let j = 0; j < gBoard.length; j += 1) {
      const elClass = makeElClass(i, j);
      const elCell = document.querySelector(elClass);

      if (i === row && j === col) {
        elCell.style.backgroundColor = 'red';
        elCell.innerHTML = imgMine;
      } else if (!gBoard[i][j].isMine && gBoard[i][j].isMarked) {
        elCell.innerHTML = 'x';
      } else if (!gBoard[i][j].isMine) {
        continue;
      } else {
        elCell.innerHTML = imgMine;
      }
    }
  }
}

function expandShown(i, j) {
  const elClass = makeElClass(i, j);

  const elCell = document.querySelector(elClass);

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
    if (gState.shownCount === Math.pow(gLevel.SIZE, 2) - gLevel.MINES
        && gState.markedCount === gLevel.MINES) {
      winGame();
    }
  }
}

function cellClicked(elCell, i, j) {
  if (gState.isGameOn) {
    expandShown(i, j);
  }
}
