import React from "react";
import HeaderBar from "./AppBar";
import Panel from "./CreatePanels";
import FullScreenDialog from "./Dialog";
import "./DevToolsPanel.css";
import "./CreatePanels.css";
import { parse, print } from "graphql";

// Known API calls that the Rubrik UI uses for internal functionality checks
const helperApiCalls = [
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
];

export default class DevToolsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiCalls: [],
      showRequestBody: false,
      apiDialogContent: { id: null, responseBody: null, requestBody: null },
    };
    this.handleShowRequestBody = this.handleShowRequestBody.bind(this);
    this.handleCloseRequestBody = this.handleCloseRequestBody.bind(this);
  }

  scrollToBottomRef = React.createRef();

  handleNetworkRequest = (request) => {
    let isRubrikApiCall = false;
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
          if (header["value"].includes("my.rubrik.com")) {
            isRubrikApiCall = true;
          }
        }
      } catch (error) {
        continue;
      }
    }

    let path = request.request.url.split("/api")[1];

    // Before logging -- validate the API calls originated from Rubrik
    // and is not in the helperApiCalls list
    if (isRubrikApiCall && !helperApiCalls.includes(path)) {
      let httpMethod = request.request.method;
      let requestBody;
      let isGraphQL = false;

      // Add another layer of more generic checks for endpoints that have may
      // cluster specific variables included

      if (!path.includes("User")) {
        if (request.request.bodySize !== 0) {
          let requestBodyJSON = JSON.parse(request.request.postData.text);
          requestBody = JSON.stringify(requestBodyJSON, null, 2);
        } else {
          requestBody = null;
        }

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
        }
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
              },
            ],
          });
        });
      }
    }
  };

  scrollToBottom = () => {
    this.scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    this.props.networkRequest.addListener(this.handleNetworkRequest);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleShowRequestBody(id, responseBody, requestBody) {
    this.setState({
      apiDialogContent: {
        id: id,
        responseBody: responseBody,
        requestBody: requestBody,
      },
      showRequestBody: true,
    });
  }

  handleCloseRequestBody() {
    this.setState({
      showRequestBody: false,
    });
  }

  static propTypes = {
    networkRequest: React.PropTypes.object.isRequired,
  };

  render() {
    return (
      <>
        <HeaderBar />
        {this.state.showRequestBody ? (
          <FullScreenDialog
            key={this.state.apiDialogContent["id"]}
            responseBody={this.state.apiDialogContent["responseBody"]}
            requestBody={this.state.apiDialogContent["requestBody"]}
            closeRequestBody={this.handleCloseRequestBody}
          />
        ) : null}

        <div class="panel-header-padding">
          <div className="header-container">
            <div className="requestMethodHeader">Method&emsp;</div>
            <div className="endpointHeader">&emsp;API Endpoint</div>

            <div className="responseTime">Response Time&emsp;</div>
          </div>
        </div>
        <div>
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
              />
            );
          })}
        </div>
        {/* Div used as the bottom placeholder to scroll to */}
        <div
          style={{ float: "left", clear: "both" }}
          ref={this.scrollToBottomRef}
        ></div>
      </>
    );
  }
}
