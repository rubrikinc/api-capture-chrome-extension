import React from "react";
import "./CreatePanels.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";

export default function Panel({
  id,
  status,
  method,
  path,
  responseBody,
  requestBody,
  responseTime,
  showRequestBody,
}) {
  const httpSuccessCodes = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

  const handleClick = (id, responseBody, requestBody) => (event) =>
    showRequestBody(id, responseBody, requestBody);

  return (
    <div class="list-padding">
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
            key={id}
            button
            onClick={handleClick(id, responseBody, requestBody)}
          >
            <div class="list-container list-spacing">
              <div className={`requestMethod ${method.toLowerCase()}`}>
                {method}
              </div>
              <div class="endpoint">{path}</div>
              <div class="responseTime">{Math.round(responseTime)}ms</div>
            </div>
          </ListItem>
        </List>
      </Paper>
    </div>
  );
}
