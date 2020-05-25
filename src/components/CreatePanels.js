import React from "react";
import "./CreatePanels.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";

import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Panel({
  id,
  status,
  method,
  path,
  responseBody,
  requestBody,
  responseTime,
}) {
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
    console.log(endpoint);
    return (
      <div id={id} class="list-padding">
        <Paper>
          <List
            component="nav"
            dense={true}
            class={
              httpSuccessCodes.includes(status)
                ? "list-border-success list-spacing"
                : "list-border-error list-spacing"
            }
          >
            <ListItem
              id={id}
              button
              onClick={(e) => {
                console.log(e.currentTarget.id);
              }}
            >
              <div class="list-container list-spacing">
                <div className={`requestMethod ${method.toLowerCase()}`}>
                  {method}
                </div>
                <div class="endpoint">{endpoint}</div>
                <div class="responseTime">{Math.round(responseTime)}ms</div>
              </div>
            </ListItem>
          </List>
        </Paper>
      </div>
    );
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
