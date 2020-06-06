import React from "react";
// Material UI
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import FileCopyIcon from "@material-ui/icons/FileCopy";
// Copy to Clipboard
import { copy } from "clipboard-js";

import "./CreateApiEntry.css";

export default function ApiEntry({
  id,
  status,
  method,
  path,
  responseBody,
  requestBody,
  responseTime,
  showRequestBody,
  requestVariables,
}) {
  const httpSuccessCodes = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

  const handleClick = (
    id,
    responseBody,
    requestBody,
    requestVariables,
    method,
    path
  ) => (event) =>
    showRequestBody(
      id,
      responseBody,
      requestBody,
      requestVariables,
      method,
      path
    );

  const [showCopyButton, setShowCopyBody] = React.useState(false);

  return (
    <Paper
      onMouseEnter={() => setShowCopyBody(true)}
      onMouseLeave={() => setShowCopyBody(false)}
    >
      <List
        component="nav"
        dense={true}
        class={
          httpSuccessCodes.includes(status)
            ? "list-border-success list-spacing"
            : "list-border-error list-spacing"
        }
      >
        <div className="list-container">
          {showCopyButton ? (
            <div className="copy-icon">
              <IconButton
                onClick={() => {
                  try {
                    copy(`${method.toUpperCase()} ${path}`);
                  } catch (error) {}
                }}
                style={{ backgroundColor: "transparent" }}
                size="small"
              >
                <FileCopyIcon fontSize="small" />
              </IconButton>
            </div>
          ) : null}

          <ListItem
            button
            onClick={handleClick(
              id,
              responseBody,
              requestBody,
              requestVariables,
              method,
              path
            )}
          >
            <div class="list-container list-spacing">
              <div className={`requestMethod ${method.toLowerCase()}`}>
                {method}
              </div>
              <div class="endpoint">{path}</div>
              <div class="responseTime">{Math.round(responseTime)}ms</div>
            </div>
          </ListItem>
        </div>
      </List>
    </Paper>
  );
}
