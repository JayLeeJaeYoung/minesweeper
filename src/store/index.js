import { createSlice, configureStore } from "@reduxjs/toolkit";
import { getNeighbors, randomMines } from "../helper/helper";

// violationCell: -1 if no violation
// status: // 0 for opened (clicked and determined), 1 for closed (i.e. not yet clicked), -1 for flagged, 2 for close pressed
export const gameSlice = createSlice({
  name: "game",
  initialState: {
    row: 0,
    col: 0,
    grid: [],
    history: [
      {
        status: new Array(1).fill(1),
        mines: 0,
        isOver: false,
        violationCell: -1,
      },
    ],
    stepNum: 0,
    showSolution: false,
  },
  reducers: {
    initialize(state, action) {
      const [row, col, mines] = action.payload;
      state.row = row;
      state.col = col;
      state.grid = randomMines(row, col, mines);
      // state.grid = [
      //   0, 1, -1, 2, 1, 2, -1, 1, 1, 2, 2, 3, -1, 3, 1, 1, 1, -1, 1, 2, -1, 2,
      //   1, 1, 2, 2, 3, 2, 2, 2, 2, -1, 1, -1, 3, -1, 2, 2, -1, 4, 1, 1, 3, -1,
      //   2, 2, -1, -1, 1, 1, 1, 1, 1, 1, 3, 3, -1, 1, 0, 0, 0, 0, 1, -1,
      // ];

      const n = row * col;
      const newStep = {
        status: new Array(n).fill(1),
        mines: mines,
        isOver: false,
        vioationCel: -1,
      };
      state.history = [];
      state.history.push(newStep);

      state.stepNum = 0;
      state.showSolution = false;
    },
    open(state, action) {
      const index = action.payload;
      // const newStatus = state.steps[state.stepNum].slice();
      const oldStep = state.history[state.stepNum];
      const newStep = {
        status: oldStep.status.slice(),
        mines: oldStep.mines,
        isOver: oldStep.isOver,
        violationCell: oldStep.violationCell,
      };

      const n = state.row * state.col;
      const row = state.row;
      const col = state.col;
      // return if flagged (-1)
      if (newStep.status[index] === -1) return;
      // if a closed cell, open
      else if (newStep.status[index] > 0) {
        newStep.status[index] = 0;

        // if mine, reveal all the mines and end the game
        if (state.grid[index] === -1) {
          newStep.violationCell = index;
          for (let i = 0; i < n; i++) {
            if (state.grid[i] === -1) newStep.status[i] = 0;
          }
          newStep.isOver = true;
        }
        // if zero, then BFS to open all zeros connected
        else if (state.grid[index] === 0) {
          const visited = new Set();
          const queue = [index];
          visited.add(index);
          while (queue.length !== 0) {
            const node = queue.pop();
            const neighbors = getNeighbors(row, col, node);
            for (const neighbor of neighbors) {
              if (visited.has(neighbor)) continue;
              if (state.grid[neighbor] === 0) queue.unshift(neighbor);
              visited.add(neighbor);
              newStep.status[neighbor] = 0; // open
            }
          }
        }
      }

      // if open, either do nothing or open cells based on flag matches
      else if (newStep.status[index] === 0) {
        // check if the number on the cell matches the flags
        let countFlags = 0;
        const neighbors = getNeighbors(row, col, index);
        for (const neighbor of neighbors) {
          if (newStep.status[neighbor] === -1) countFlags++;
        }
        if (state.grid[index] !== countFlags) return; // if number does not match, return

        // open all neighbors
        // same code as before ... probably good idea to refactor later
        let anyCellOpened = false;
        for (const neighbor of neighbors) {
          if (newStep.status[neighbor] < 1) continue;

          // open all neighbors
          newStep.status[neighbor] = 0;
          anyCellOpened = true;

          // if mine, reveal all the mines and end the game
          if (state.grid[neighbor] === -1) {
            newStep.violationCell = neighbor;
            for (let i = 0; i < n; i++) {
              if (state.grid[i] === -1) newStep.status[i] = 1;
            }
            newStep.isOver = true;
          }
          // if zero, then BFS to open all zeros connected
          else if (state.grid[index] === 0) {
            const visited = new Set();
            const queue = [index];
            visited.add(index);
            while (queue.length !== 0) {
              const node = queue.pop();
              const neighbors = getNeighbors(row, col, node);
              for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;
                if (state.grid[neighbor] === 0) queue.unshift(neighbor);
                visited.add(neighbor);
                newStep.status[neighbor] = 0; // open
              }
            }
          }
        }
        if (!anyCellOpened) return; // if no change has been made, return
      }
      if (newStep.mines === 0) {
        newStep.isOver = true;
        for (let i = 0; i < n; i++) {
          if (newStep.status[i] === 1) newStep.status[i] = 0;
        }
      }
      state.stepNum++;
      state.history.splice(state.stepNum, state.history.length, newStep);
    },

    flag(state, action) {
      const index = action.payload;

      const oldStep = state.history[state.stepNum];
      const newStep = {
        status: oldStep.status.slice(),
        mines: oldStep.mines,
        isOver: oldStep.isOver,
        violationCell: oldStep.violationCell,
      };
      if (newStep.status[index] === 0) return; // return if open (0)
      if (newStep.status[index] === 1) {
        // if close, change to flag
        newStep.status[index] = -1;
        newStep.mines--;
        // if (newStep.mines === 0) newStep.isOver = true;
      } else if (newStep.status[index] === -1) {
        // if flag, change to close
        newStep.status[index] = 1;
        newStep.mines++;
      }
      state.stepNum++;
      state.history.splice(state.stepNum, state.history.length, newStep);
    },

    pressDown(state, action) {
      const index = action.payload;
      const newStep = state.history[state.stepNum];

      if (newStep.status[index] === 1) {
        // if cell is closed
        newStep.status[index] = 2;
      } else if (newStep.status[index] === 0) {
        // if cell is open
        const neighbors = getNeighbors(state.row, state.col, index);
        for (const neighbor of neighbors) {
          if (newStep.status[neighbor] === 1) newStep.status[neighbor] = 2;
        }
      } else return;
    },

    pressUp(state, action) {
      const index = action.payload;
      const newStep = state.history[state.stepNum];

      if (newStep.status[index] === 2) {
        // if cell is closed-pressed
        newStep.status[index] = 1;
      } else if (newStep.status[index] === 0) {
        // if cell is open
        const neighbors = getNeighbors(state.row, state.col, index);
        for (const neighbor of neighbors) {
          if (newStep.status[neighbor] === 2) newStep.status[neighbor] = 1;
        }
      } else return;
    },

    toggleSol(state) {
      state.showSolution = !state.showSolution;
    },

    changeStep(state, action) {
      const changeAmount = action.payload;
      state.stepNum = state.stepNum + changeAmount;
    },
  },
});

export const store = configureStore({
  reducer: gameSlice.reducer,
});
