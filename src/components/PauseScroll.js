import React from "react";
import Fab from "@material-ui/core/Fab";
import "./PauseScroll.css";
import { makeStyles } from "@material-ui/core/styles";

import PauseIcon from "@material-ui/icons/Pause";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  extendedIcon: {
    marginRight: "2px",
  },
}));

export default function PauseScrollButton() {
  const classes = useStyles();

  return (
    <div class="fab">
      <Fab size="small" variant="extended">
        <PauseIcon className={classes.extendedIcon} />
        Scroll
      </Fab>
    </div>
  );
}
