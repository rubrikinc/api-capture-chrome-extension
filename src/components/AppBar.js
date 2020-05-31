import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import "./AppBar.css";
import rubrikLogo from "../images/rubrikLogo.svg";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: "1%",
    paddingRight: "1%",
  },
  logo: {
    marginRight: theme.spacing(2),
  },
}));

export default function HeaderBar() {
  const classes = useStyles();

  return (
    <AppBar
      position="sticky"
      style={{
        backgroundColor: "#FFF",
      }}
    >
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          className={classes.logo}
          color="inherit"
          aria-label="menu"
          disabled
        >
          <img
            alt="Rubrik logo"
            src={rubrikLogo}
            width="30"
            class="divider-logo-padding"
          />
          <Divider orientation="vertical" flexItem />
        </IconButton>
        <Typography style={{ color: "#697386" }}>API Code Capture</Typography>
      </Toolbar>
    </AppBar>
  );
}
