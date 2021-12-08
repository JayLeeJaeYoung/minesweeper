/**
 * rough algorithm borrowed from https://github.com/joepie91/node-random-number-csprng/blob/master/src/index.js
 *
 * @param {integer} max - maximum number, inclusive (must be strictly less than 2**32)
 * @param {integer} size - size of the array (must be at least 1)
 * @returns a random integer array in the range [0, max] using crypto.getRandomValues()
 */
const randomIntArray = (max, size) => {
  let array3 = new Uint32Array(size * 2); // double the size to make room for filtering
  // cutting off extra big numbers that contribute to bias so that each number
  // gets the same distribution after modulus operation
  const maxNumberAllowed = 2 ** 32 - (2 ** 32 % (max + 1)) - 1; // inclusive

  let array2 = [];
  while (array2.length < size) {
    crypto.getRandomValues(array3);
    array2 = array3.filter((x) => x <= maxNumberAllowed);
  }
  const array = array2.map((x) => x % (max + 1)).slice(0, size);
  return array;
};

/**
 * @param {integer} row - number of rows
 * @param {integer} col - number of columns
 * @param {integer} node - index number of the center node (note the grid is represented in 1D array)
 * @returns an array of indices representing the neighbor indices of the center node
 */
export const getNeighbors = (row, col, node) => {
  const adjacent = [-col - 1, -col, -col + 1, -1, 1, col - 1, col, col + 1];
  const nodeRowNum = Math.floor(node / col);
  const nodeColNum = node % col;
  const neighbors = [];
  for (const d of adjacent) {
    const neighbor = node + d;
    if (neighbor < 0 || neighbor >= row * col) continue;
    const neighborRowNum = Math.floor(neighbor / col);
    const neighborColNum = neighbor % col;
    if (
      Math.abs(nodeRowNum - neighborRowNum) > 1 ||
      Math.abs(nodeColNum - neighborColNum) > 1
    ) {
      continue;
    }
    neighbors.push(neighbor);
  }
  return neighbors;
};

/**
 *
 * @param {integer} row
 * @param {integer} col
 * @param {integer} mines - total number of mines
 * @returns a 1D grid where -1 represents mines and positive numbers are the # of mines in its neighbors
 */
export const randomMines = (row, col, mines) => {
  // create 1D array
  const n = row * col;
  const ones = new Array(mines).fill(-1);
  let minesArray = new Array(n - mines).fill(0);
  minesArray.push(...ones);

  // shuffle algorithm based on COS226 by Kevin Wayne at Princeton
  for (let i = 0; i < n; i++) {
    let r = i + randomIntArray(n - i - 1, 1)[0];
    const temp = minesArray[r];
    minesArray[r] = minesArray[i];
    minesArray[i] = temp;
  }

  // add number of mines nearby
  for (let i = 0; i < n; i++) {
    if (minesArray[i] === -1) continue;
    const neighbors = getNeighbors(row, col, i);
    let sum = 0;
    for (const neighbor of neighbors) {
      if (minesArray[neighbor] === -1) sum++;
    }
    minesArray[i] = sum;
  }

  return minesArray;
};
