import { Grid } from "./components/Grid";
import { Solution } from "./components/Solution";
import { Dashboard } from "components/Dashboard";
import classes from "./App.module.css";

const App = () => {
  return (
    <div className={classes.game}>
      <Dashboard />
      <Grid />
      <br />
      <Solution />
    </div>
  );
};

export default App;
