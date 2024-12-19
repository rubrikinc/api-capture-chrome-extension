import React from "react";
// Internal Components
import TopNavigationBar from "./TopNavigationBar";
import ApiEntry from "./CreateApiEntry";
import ApiDetailsDialog from "./ApiDetailsDialog";
// GraphQL
import { parse, print } from "graphql";
// Material UI
import CircularProgress from "@material-ui/core/CircularProgress";

import "./App.css";
import "./CreateApiEntry.css";

// Known CDM API calls that the Rubrik UI uses for internal functionality checks
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

// Known Polaris API calls that the Rubrik UI uses for internal functionality checks
const polarisBackgroundApiCalls = [
  "FeatureFlagQuery",
  "CurrentUserRolesQuery",
  "CurrentUserPermissionsQuery",
  "UserInfoQuery",
];

// Create a combined list of known CDM and Polaris API calls
const combinedBackgroundApiCalls = [
  ...cdmBackgroundApiCalls,
  ...polarisBackgroundApiCalls,
];

export default class App extends React.Component {
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

  // Reference used for automatic scroll
  scrollToBottomRef = React.createRef();

  // Determine if the API is a background API and should be filtered from
  // the entries created
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
      //
      // Since the full path will vary depending on the customer, we have to use
      // more generic checks.
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
      // Remove "/api" from the provided path
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

      // Process the request body of of the API call
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
          // Convert the request data to a GraphQL AST document for easier
          // processing
          let ast = parse(JSON.parse(request.request.postData.text)["query"]);
          try {
            path = ast["definitions"][0]["name"]["value"];
          } catch (error) {}

          try {
            // pretty print the AST document
            requestBody = print(ast);
          } catch (error) {}

          // Store the GraphQL request variables
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

            let parsedContent;

            try {
              parsedContent = JSON.parse(content);
            } catch (error) {
              console.log("Failed to parse endpoint response: ", error.message);
              // Handle parsing error
              parsedContent = content;
            }

            this.setState({
              apiCalls: [
                ...this.state.apiCalls,
                {
                  id: this.state.apiCalls.length + 1,
                  status: request.response.status,
                  httpMethod: httpMethod,
                  path: path,
                  responseTime: request.time,
                  responseBody: parsedContent,
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

  // Used by the Pause Scroll button to set the enableScrollToBottom state
  handlePauseScroll = () => {
    this.state.enableScrollToBottom
      ? this.setState({ enableScrollToBottom: false })
      : this.setState({ enableScrollToBottom: true });
  };

  // Contains the code used to automatically scroll to the bottom of the
  // API entry list after each new entry is added
  scrollToBottom = () => {
    if (this.state.enableScrollToBottom) {
      this.scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // On mount, start monitoring and processing API calls
  componentDidMount() {
    this.props.networkRequest.addListener(this.handleNetworkRequest);
  }

  // Kick off the scroll process after each entry is added
  componentDidUpdate() {
    this.scrollToBottom();
  }

  // Open the dialog used to show the Request Body/Variables and Response call
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

  // Close the dialog used to show the Request Body/Variables and Response call
  handleCloseRequestBody() {
    this.setState({
      showRequestBody: false,
    });
  }

  // Handle the Recording button functionality
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

  render() {
    return (
      <>
        <div>
          <TopNavigationBar
            enableScrollToBottom={this.state.enableScrollToBottom}
            handlePauseScroll={this.handlePauseScroll}
            handleRecording={this.handleRecording}
          />
          {/* If not Rubrik API calls are detected show the circular progress animation */}
          {/* If Rubrik API calls have been detected show the top labels for each API entry */}

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
          {/* Open the dialog for the Request Body/Variables and Reponse Body */}
          {this.state.showRequestBody ? (
            <ApiDetailsDialog
              responseBody={this.state.apiDialogContent["responseBody"]}
              requestBody={this.state.apiDialogContent["requestBody"]}
              closeRequestBody={this.handleCloseRequestBody}
              requestVariables={this.state.apiDialogContent["requestVariables"]}
              method={this.state.apiDialogContent["method"]}
              path={this.state.apiDialogContent["path"]}
            />
          ) : null}
          {/* Create an entry for every Rubrik API call logged */}
          <div className="panel-padding">
            {this.state.apiCalls.map((apiCall) => {
              return (
                <ApiEntry
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
