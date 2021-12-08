import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./Solution.module.css";
import { MineIcon } from "./icons";
import { gameSlice } from "../store";

const CellTest = (props) => {
  let content = props.value;
  if (props.value === -1) {
    content = <MineIcon />;
  }
  const isOpen = props.action % 2 === 0 ? "cell-open" : "cell-close";

  return (
    <button
      className={`${classes.cell} ${classes[isOpen]}`}
      style={{ flex: props.flex }}>
      <span className={classes.icon}>{content}</span>
    </button>
  );
};

const GridTest = () => {
  const row = useSelector((state) => state.row);
  const col = useSelector((state) => state.col);
  const flex_label = 100 / col + "%";

  const grid = useSelector((state) => state.grid);
  const stepNum = useSelector((state) => state.stepNum);
  const newStep = useSelector((state) => state.history[stepNum].status);

  const indices = [...Array(row * col).keys()];
  return (
    <div className={classes.grid}>
      {indices.map((i) => (
        <CellTest
          key={i}
          id={i}
          value={grid[i]}
          action={newStep[i]}
          flex={flex_label}
        />
      ))}
    </div>
  );
};

export const Solution = () => {
  const showSolution = useSelector((state) => state.showSolution);
  const dispatch = useDispatch();

  const onClickHandler = () => {
    dispatch(gameSlice.actions.toggleSol());
  };

  return (
    <Fragment>
      <button className={classes.solution} onClick={onClickHandler}>
        {showSolution ? "Hide Solution" : "Show Solution"}
      </button>
      {showSolution && <GridTest />}
    </Fragment>
  );
};
