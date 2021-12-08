import { MineIcon, FlagIcon } from "./icons";
import { useSelector, useDispatch } from "react-redux";
import { gameSlice } from "../store";

import { useEffect } from "react";
import classes from "./Solution.module.css";

const Cell = (props) => {
  let content = "";
  if (props.action === -1) {
    content = <FlagIcon />;
  } else if (props.action === 0 && props.value === -1) {
    content = <MineIcon />;
  } else if (props.action === 0 && props.value !== 0) {
    content = props.value;
  }

  const dispatch = useDispatch();
  // open (0) or close-pressed (2) is considered "cell-open" for styling
  const isOpen = props.action % 2 === 0 ? "cell-open" : "cell-close";
  const isOver = useSelector((state) => state.history[state.stepNum].isOver);

  const onClickHandler = (event) => {
    if (isOver) return;
    dispatch(gameSlice.actions.open(props.id));
  };

  const onContextMenuHandler = (event) => {
    event.preventDefault();
    if (isOver) return;
    dispatch(gameSlice.actions.flag(props.id));
  };

  const onMouseDownHandler = (event) => {
    if (isOver) return;
    // fire only when left/middle click
    if (event.button <= 1) {
      dispatch(gameSlice.actions.pressDown(props.id));
    }
  };

  const onMouseUpHandler = (event) => {
    if (isOver) return;
    // fire only when left/middle click
    if (event.button <= 1) {
      dispatch(gameSlice.actions.pressUp(props.id));
    }
  };

  return (
    <button
      className={`${classes.cell} ${classes[isOpen]} ${
        props.violated && classes.violated
      }`}
      style={{ flex: props.flex }}
      onClick={onClickHandler}
      onContextMenu={onContextMenuHandler}
      onMouseDown={onMouseDownHandler}
      onMouseUp={onMouseUpHandler}>
      <span className={classes.icon}>{content}</span>
    </button>
  );
};

export const Grid = () => {
  const dispatch = useDispatch();

  // runs once at first render
  useEffect(() => {
    const initialRow = 8;
    const initialCol = 8;
    const initialMines = 15;
    dispatch(
      gameSlice.actions.initialize([initialRow, initialCol, initialMines])
    );
  }, [dispatch]);

  const row = useSelector((state) => state.row);
  const col = useSelector((state) => state.col);
  const flex_label = 100 / col + "%";

  const grid = useSelector((state) => state.grid);
  const stepNum = useSelector((state) => state.stepNum);
  const newStep = useSelector((state) => state.history[stepNum].status);

  const violationCell = useSelector(
    (state) => state.history[stepNum].violationCell
  );

  const indices = [...Array(row * col).keys()];
  return (
    <div className={classes.grid}>
      {indices.map((i) => (
        <Cell
          key={i}
          id={i}
          value={grid[i]}
          action={newStep[i]}
          flex={flex_label}
          violated={violationCell === i}
        />
      ))}
    </div>
  );
};
