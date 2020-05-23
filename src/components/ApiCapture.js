import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import "./ApiCapture.css";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";

const borderSize = "6px solid";
const borderSuccessColor = "#09C997";
const borderErrorColor = "#CB323E";
const borderRadius = "0.286rem";

const ApiSuccess = withStyles({
  root: {
    borderRight: `${borderSize} ${borderSuccessColor}`,
    borderRadius: borderRadius,
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelSummary);

const ApiError = withStyles({
  root: {
    borderRight: `${borderSize} ${borderErrorColor}`,
    borderRadius: borderRadius,
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

export default function Panel() {
  // const classes = listUseStyles();
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <React.Fragment>
      <div className={classes.header}>
        <div className="header-container">
          <div className="requestMethodHeader">Method&emsp;</div>
          <div className="endpointHeader">&emsp;API Endpoint</div>

          <div className="responseTime">Response Time&emsp;</div>
        </div>
      </div>

      <div className={classes.root}>
        <ExpansionPanel
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
          className="panel-spacing"
        >
          <ApiSuccess
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className="panel-container">
              <div className="requestMethod get">GET</div>
              <div className="endpoint">
                /internal/vmware/vm/id/some-random-other-text
              </div>

              <div className="responseTime">39ms</div>
            </div>
          </ApiSuccess>
        </ExpansionPanel>

        <ExpansionPanel
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
          className="panel-spacing"
        >
          <ApiError
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className="panel-container">
              <div className="requestMethod get">GET</div>
              <div className="endpoint">/v1/cluster/me</div>

              <div className="responseTime">5ms</div>
            </div>
          </ApiError>
        </ExpansionPanel>

        <ExpansionPanel
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
          className="panel-spacing"
        >
          <ApiSuccess
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className="panel-container">
              <div className="requestMethod post">POST</div>
              <div className="endpoint">
                /v3/sla_domain/id/some-random-other-text
              </div>

              <div className="responseTime">39ms</div>
            </div>
          </ApiSuccess>
        </ExpansionPanel>

        <ExpansionPanel
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
          className="panel-spacing"
        >
          <ApiSuccess
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className="panel-container">
              <div className="requestMethod mutation">MUTATION</div>
              <div className="endpoint">cluster(id: "me")</div>

              <div className="responseTime">39ms</div>
            </div>
          </ApiSuccess>
        </ExpansionPanel>
      </div>
    </React.Fragment>
  );
}
