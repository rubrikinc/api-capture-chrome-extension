import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import "./TopNavigationBar.css";
import rubrikLogo from "../images/rubrikLogo.svg";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    marginRight: theme.spacing(2),
  },
  buttonColor: {
    color: "rgb(105, 115, 134)",
  },
}));

export default function TopNavigationBar({
  enableScrollToBottom,
  handlePauseScroll,
  handleRecording,
}) {
  const classes = useStyles();

  const handlePauseScrollButton = () => {
    handlePauseScroll();
  };

  const [localRecordingState, setLocalRecordingState] = React.useState("Start");

  const handleRecordingButton = () => {
    if (localRecordingState === "Start") {
      handleRecording("start");
      setLocalRecordingState("Stop");
    } else if (localRecordingState === "Stop") {
      handleRecording("stopped");
      setLocalRecordingState("Reset");
    } else {
      handleRecording("reset");
      setLocalRecordingState("Start");
    }
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
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
          <Typography className={classes.title} style={{ color: "#697386" }}>
            API Code Capture
          </Typography>
          <div class="hide-buttons">
            <Button
              size="small"
              style={{ color: "rgb(105, 115, 134)", "margin-right": "30px" }}
              onClick={handleRecordingButton}
            >
              {`${localRecordingState} Recording`}
            </Button>

            <Button
              size="small"
              color="primary"
              style={{ color: "rgb(105, 115, 134)" }}
              onClick={handlePauseScrollButton}
            >
              {enableScrollToBottom === true ? "Pause Scroll" : "Resume Scroll"}
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
