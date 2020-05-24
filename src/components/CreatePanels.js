import React from "react";
import "./CreatePanels.css";

import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";

const borderSize = "4px solid";
const borderSuccessColor = "#09C997";
const borderErrorColor = "#ED4C59";
const borderRadius = "0.286rem";

const ApiSuccess = withStyles({
  root: {
    borderRight: `${borderSize} ${borderSuccessColor}`,
    borderRadius: `${borderRadius}`,
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelSummary);

const ApiError = withStyles({
  root: {
    borderRight: `${borderSize} ${borderErrorColor}`,
    borderRadius: `${borderRadius}`,
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelSummary);

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  header: {
    paddingTop: "1%",
    paddingBottom: "1%",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
}));

function createPanels() {}

export default function Panel({
  id,
  status,
  method,
  path,
  responseBody,
  responseTime,
}) {
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const httpSuccessCodes = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

  function createApiPanel(
    id,
    status,
    method,
    endpoint,
    responseBody,
    responseTime
  ) {
    if (httpSuccessCodes.includes(status)) {
      return (
        <div id={id} className={classes.root}>
          <ExpansionPanel
            expanded={expanded === `panel${id}`}
            onChange={handleChange(`panel${id}`)}
            className="panel-spacing"
            defaultExpanded
          >
            <ApiSuccess expandIcon={<ExpandMoreIcon />}>
              <div className="panel-container">
                <div className={`requestMethod ${method.toLowerCase()}`}>
                  {method}
                </div>
                <div className="endpoint">{endpoint}</div>
                <div className="responseTime">{Math.round(responseTime)}ms</div>
              </div>
            </ApiSuccess>
            <ExpansionPanelDetails>
              <Typography color="textSecondary">{responseBody}</Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      );
    } else {
      return (
        <div id={id} className={classes.root}>
          <ExpansionPanel
            expanded={expanded === `panel${id}`}
            onChange={handleChange(`panel${id}`)}
            className="panel-spacing"
            defaultExpanded
          >
            <ApiError expandIcon={<ExpandMoreIcon />}>
              <div className="panel-container">
                <div className={`requestMethod ${method.toLowerCase()}`}>
                  {method}
                </div>
                <div className="endpoint">{endpoint}</div>
                <div className="responseTime">{Math.round(responseTime)}ms</div>
              </div>
            </ApiError>
          </ExpansionPanel>
        </div>
      );
    }
  }

  return createApiPanel(id, status, method, path, responseBody, responseTime);
}
