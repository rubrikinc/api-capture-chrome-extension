import React from "react";
import HeaderBar from "./AppBar";
import Panel from "./CreatePanels";
import FullScreenDialog from "./Dialog";
import { parse, print } from "graphql";

import CircularProgress from "@material-ui/core/CircularProgress";

import "./DevToolsPanel.css";
import "./CreatePanels.css";

// Known API calls that the Rubrik UI uses for internal functionality checks
const cdmBackgroundApiCalls = [
  "/internal/cluster/me/is_registered",
  "/internal/cluster/me/is_azure_cloud_only",
  "/internal/cluster/me/is_registered",
  "/internal/cluster/me/is_encrypted",
  "/internal/cluster/me/platforminfo",
  "/internal/cluster/me/ui_preference",
  "/internal/cluster/me/ntp_server",
  "/internal/cluster/me/name",
  "/internal/cluster/me/ipmi",
  "/internal/cluster/log",
  "/internal/node_management/is_bootstrapped",
  "/internal/log",
  "/internal/cluster/me/security_classification",
  "/internal/config/crystal",
  "/internal/authorization/effective/for_resource",
  "/internal/event?limit=15",
  "/internal/user/me/organization",
  "/internal/authorization/effective/for_resources",
  "/v1/cluster/me",
  "/v1/cluster/me/version",
  "/v1/blackout_window",
  "/v1/event/latest?limit=15",
  "/internal/authorization/effective/roles?principal",
  "/v1/saml/sso_status",
];

const polarisBackgroundApiCalls = [
  "FeatureFlagQuery",
  "CurrentUserRolesQuery",
  "CurrentUserPermissionsQuery",
  "UserInfoQuery",
];

const combinedBackgroundApiCalls = [
  ...cdmBackgroundApiCalls,
  ...polarisBackgroundApiCalls,
];

export default class DevToolsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiCalls: [],
      showRequestBody: false,
      apiDialogContent: {
        id: null,
        responseBody: null,
        requestBody: null,
        requestVariables: null,
        method: null,
        path: null,
      },
      enableScrollToBottom: true,
      recordingStopped: false,
    };
    this.handleShowRequestBody = this.handleShowRequestBody.bind(this);
    this.handleCloseRequestBody = this.handleCloseRequestBody.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  scrollToBottomRef = React.createRef();

  shouldBeFilterd = (path) => {
    let shouldBeFiltered = false;
    if (combinedBackgroundApiCalls.includes(path)) {
      shouldBeFiltered = true;
    }

    try {
      // Filter CDM:
      //  - /internal/user/{userID}
      //  - /internal/authorization/effective/roles?principal={userID}&resource_types=Global
      //  - /internal/organization/{orgID}

      if (
        path.includes("User:::") ||
        path.includes("User%3A") ||
        path.includes("Organization%3A")
      ) {
        shouldBeFiltered = true;
      }
    } catch (error) {}

    return shouldBeFiltered;
  };

  handleNetworkRequest = (request) => {
    if (this.state.recordingStopped === false) {
      let isRubrikApiCall = false;
      let httpMethod = request.request.method;
      let path;
      let requestBody;
      let requestVariables = null;
      for (const header of request.request.headers) {
        // Check to see if the site is CDM
        try {
          // toLowerCase in order to support pre CDM 5.2
          if (header["name"].toLowerCase() === "rk-web-app-request") {
            isRubrikApiCall = true;
          }
        } catch (error) {
          continue;
        }

        // Check to see if the site is Polaris
        try {
          if (header["name"] === ":authority") {
            if (
              header["value"].includes("my.rubrik.com") ||
              header["value"].includes("my.rubrik-lab.com")
            ) {
              isRubrikApiCall = true;
            }
          }
        } catch (error) {
          continue;
        }
      }

      path = request.request.url.split("/api")[1];

      // Additional Polaris specifc filter for items that get past the initial
      // header check
      if (
        request.request.url.includes("publicKeys.json") ||
        request.request.url.includes("manifest.json") ||
        !path
      ) {
        isRubrikApiCall = false;
      }

      // Add another layer of more generic checks for endpoints that have may
      // cluster specific variables included
      if (request.request.bodySize !== 0) {
        let requestBodyJSON = JSON.parse(request.request.postData.text);
        requestBody = JSON.stringify(requestBodyJSON, null, 2);
      } else {
        requestBody = "null";
      }

      try {
        if (path.includes("graphql")) {
          // override the default POST http method with either mutation or query
          if (request.request.bodySize !== 0) {
            request.request.postData.text.includes("mutation")
              ? (httpMethod = "mutation")
              : (httpMethod = "query");
          }

          let ast = parse(JSON.parse(request.request.postData.text)["query"]);
          try {
            path = ast["definitions"][0]["name"]["value"];
          } catch (error) {}

          try {
            requestBody = print(ast);
          } catch (error) {}

          try {
            requestVariables = JSON.parse(request.request.postData.text)[
              "variables"
            ];

            requestVariables = JSON.stringify(requestVariables, null, 2);
          } catch (error) {
            // always return a non-null value. this is used down the line for logic
            // processing
            requestVariables = JSON.stringify("{}", null, 2);
          }
        }
      } catch (error) {}

      // Before logging -- validate the API calls originated from Rubrik
      // and is not in the shouldBeFilterd list
      if (isRubrikApiCall && !this.shouldBeFilterd(path)) {
        try {
          request.getContent((content, encoding) => {
            this.setState({
              apiCalls: [
                ...this.state.apiCalls,
                {
                  id: this.state.apiCalls.length + 1,
                  status: request.response.status,
                  httpMethod: httpMethod,
                  path: path,
                  responseTime: request.time,
                  responseBody: JSON.parse(content),
                  requestBody: requestBody,
                  requestVariables: requestVariables,
                },
              ],
            });
          });
        } catch (error) {}
      }
    }
  };

  handlePauseScroll = () => {
    this.state.enableScrollToBottom
      ? this.setState({ enableScrollToBottom: false })
      : this.setState({ enableScrollToBottom: true });
  };

  scrollToBottom = () => {
    if (this.state.enableScrollToBottom) {
      this.scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  componentDidMount() {
    this.props.networkRequest.addListener(this.handleNetworkRequest);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleShowRequestBody(
    id,
    responseBody,
    requestBody,
    requestVariables,
    method,
    path
  ) {
    this.setState({
      apiDialogContent: {
        id: id,
        responseBody: responseBody,
        requestBody: requestBody,
        requestVariables: requestVariables,
        method: method,
        path: path,
      },
      showRequestBody: true,
    });
  }

  handleCloseRequestBody() {
    this.setState({
      showRequestBody: false,
    });
  }

  handleRecording = (action) => {
    if (action === "start") {
      this.setState({
        apiCalls: [],
      });
    } else if (action === "stopped") {
      this.setState({
        recordingStopped: true,
      });
    } else {
      this.setState({
        recordingStopped: false,
      });
    }
  };

  static propTypes = {
    networkRequest: React.PropTypes.object.isRequired,
  };

  render() {
    return (
      <>
        <div>
          <HeaderBar
            enableScrollToBottom={this.state.enableScrollToBottom}
            handlePauseScroll={this.handlePauseScroll}
            handleRecording={this.handleRecording}
          />
          {this.state.apiCalls.length === 0 ? (
            <>
              <div className="circular-progress">
                <CircularProgress size="70px" thickness="1" color="inherit" />
              </div>
              <div className="circular-progress circular-progress-text">
                Monitoring for API calls from<br></br> Rubrik CDM or Polaris
              </div>
            </>
          ) : (
            <div className="header-container panel-padding">
              <div className="requestMethodHeader">Method&emsp;</div>
              <div className="endpointHeader">&emsp;API Endpoint</div>

              <div className="responseTime">Response Time&emsp;</div>
            </div>
          )}

          {this.state.showRequestBody ? (
            <FullScreenDialog
              responseBody={this.state.apiDialogContent["responseBody"]}
              requestBody={this.state.apiDialogContent["requestBody"]}
              closeRequestBody={this.handleCloseRequestBody}
              requestVariables={this.state.apiDialogContent["requestVariables"]}
              method={this.state.apiDialogContent["method"]}
              path={this.state.apiDialogContent["path"]}
            />
          ) : null}

          <div className="panel-padding">
            {this.state.apiCalls.map((apiCall) => {
              return (
                <Panel
                  id={apiCall["id"]}
                  status={apiCall["status"]}
                  method={apiCall["httpMethod"]}
                  path={apiCall["path"]}
                  responseBody={apiCall["responseBody"]}
                  requestBody={apiCall["requestBody"]}
                  responseTime={apiCall["responseTime"]}
                  showRequestBody={this.handleShowRequestBody}
                  requestVariables={apiCall["requestVariables"]}
                />
              );
            })}
          </div>

          {/* Div used as the bottom placeholder to scroll to */}
          <div
            style={{ float: "left", clear: "both" }}
            ref={this.scrollToBottomRef}
          ></div>
        </div>
      </>
    );
  }
}
