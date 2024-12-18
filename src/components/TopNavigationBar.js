import React from "react";
import rubrikLogo from "../images/rubrikLogo.svg";
// Material UI
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";

import "./TopNavigationBar.css";

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
  appBar: {
    background: "#fff",
    borderBottom: "2px solid RGBA(105, 115, 134, 0.2)",
  },
  dividerLogoPadding: {
    paddingRight: "10px",
  },
  dividerTextPadding: {
    paddingLeft: "5px",
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
              className={classes.dividerLogoPadding}
            />
            <Divider orientation="vertical" flexitem="true" /> {/* Change `flexItem` to `flexitem` */}
            </IconButton>
          <Typography className={classes.title} style={{ color: "#697386" }}>
            API Code Capture
          </Typography>
          <div className="hide-buttons">
            <Button
              size="small"
              style={{ color: "rgb(105, 115, 134)", "marginRight": "30px" }}
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
