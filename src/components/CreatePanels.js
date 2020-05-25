import React from "react";
import "./CreatePanels.css";

import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import InfoIcon from "@material-ui/icons/Info";
import "@material-ui/core/colors";
const borderSize = "4px solid";
const borderSuccessColor = "#09C997";
const borderErrorColor = "#ED4C59";
const borderRadius = "0.286rem";

const ApiSuccess = withStyles({
  root: {
    borderRight: `${borderSize} ${borderSuccessColor}`,
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelSummary);

const ApiSuccessPanelDetails = withStyles({
  root: {
    borderRight: `${borderSize} ${borderSuccessColor}`,
    borderTop: "1px solid RGBA(105, 115, 134, 0.2);",
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelDetails);

const ApiError = withStyles({
  root: {
    borderRight: `${borderSize} ${borderErrorColor}`,
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelSummary);

const ApiErrorPanelDetails = withStyles({
  root: {
    borderRight: `${borderSize} ${borderErrorColor}`,
    borderTop: "1px solid RGBA(105, 115, 134, 0.2);",
  },
  content: {},
  expanded: {},
})(MuiExpansionPanelDetails);

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

export default function Panel({
  id,
  status,
  method,
  path,
  responseBody,
  requestBody,
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
    requestBody,
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
            <ApiSuccessPanelDetails>
              <section class="bodies-container">
                <div class="request-body-left">
                  <div class={"request-header"}>Request Body</div>
                  <div>
                    {requestBody !== null ? (
                      <SyntaxHighlighter language="json" style={githubGist}>
                        {JSON.stringify(requestBody, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <InfoIcon style={{ color: "#90E5FF" }}>
                        No request body available
                      </InfoIcon>
                    )}
                  </div>
                </div>
                <div class="response-body-right">
                  <div class={"request-header"}>Response Body</div>
                  <div>
                  <div>
                    {requestBody !== undefined ? (
                      <SyntaxHighlighter language="json" style={githubGist}>
                        {JSON.stringify(responseBody, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <InfoIcon style={{ color: "#90E5FF" }}>
                        No request body available
                      </InfoIcon>
                    )}
                 </div>
                </div>
              </section>
            </ApiSuccessPanelDetails>
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
            <ApiErrorPanelDetails>
              <section class="bodies-container">
                <div class="request-body-left">
                  <div style={{ textAlign: "center" }}>Request Body</div>
                </div>
                <div class="response-body-right">
                  <div style={{ textAlign: "center" }}>Response Body</div>
                  <div>
                    {responseBody ? (
                      <SyntaxHighlighter
                        language="json"
                        style={githubGist}
                      ></SyntaxHighlighter>
                    ) : (
                      "n/a"
                    )}
                  </div>
                </div>
              </section>
            </ApiErrorPanelDetails>
          </ExpansionPanel>
        </div>
      );
    }
  }

  return createApiPanel(
    id,
    status,
    method,
    path,
    responseBody,
    requestBody,
    responseTime
  );
}
