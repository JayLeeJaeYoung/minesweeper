import { useSelector, useDispatch } from "react-redux";

import classes from "./Dashboard.module.css";
import { gameSlice } from "../store";
import { LeftArrowIcon, RightArrowIcon } from "./icons";

export const Dashboard = (props) => {
  const dispatch = useDispatch();
  const stepNum = useSelector((state) => state.stepNum);
  const mines = useSelector((state) => state.history[stepNum].mines);
  const totalSteps = useSelector((state) => state.history.length);

  const onRestartClick = (event) => {
    const initialRow = 8;
    const initialCol = 8;
    const initialMines = 15;
    dispatch(
      gameSlice.actions.initialize([initialRow, initialCol, initialMines])
    );
  };

  const onLeftClick = () => {
    if (stepNum === 0) return;
    dispatch(gameSlice.actions.changeStep(-1));
  };

  const onRightClick = () => {
    if (stepNum === totalSteps - 1) return;
    dispatch(gameSlice.actions.changeStep(1));
  };

  return (
    <header className={classes.dashboard}>
      <div className={classes["mines-container"]}>
        <h4>mines: </h4>
        <div className={classes.mines}>{mines}</div>
      </div>
      <button className={classes.restart} onClick={onRestartClick}>
        New Game!
      </button>
      <div className={classes["history-container"]}>
        <div
          className={`${classes.icon} ${
            stepNum === 0 && classes["icon-disable"]
          }`}
          onClick={onLeftClick}>
          <LeftArrowIcon />
        </div>
        <div>{stepNum}</div>
        <div
          className={`${classes.icon} ${
            stepNum === totalSteps - 1 && classes["icon-disable"]
          }`}
          onClick={onRightClick}>
          <RightArrowIcon />
        </div>
      </div>
    </header>
  );
};
