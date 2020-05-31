import React from "react";
import Chip from "@material-ui/core/Chip";
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
  return (
    <div class="fab">
      <Chip
        color="primary"
        size="small"
        icon={<PauseIcon />}
        label="Scroll"
        onClick={(e) => {
          console.log(e);
        }}
      />
    </div>
  );
}
