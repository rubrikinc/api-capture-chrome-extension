/* global chrome */
import React from "react";
import ReactDOM from "react-dom";
import DevToolsPanel from "./components/DevToolsPanel";

import { create } from "jss";
import { StylesProvider, jssPreset } from "@material-ui/core/styles";
import rtl from "jss-rtl";

let alreadyShown = false;

function createPanel() {
  chrome.devtools.panels.create(
    "Rubrik",
    "./icons/icon48.png",
    "./index.html",
    (panel) => {
      panel.onShown.addListener((panelWindow) => {
        if (!alreadyShown) {
          const jss = create({
            plugins: [...jssPreset().plugins, rtl()],
            insertionPoint: panelWindow.document.getElementById("root"),
          });

          ReactDOM.render(
            <StylesProvider jss={jss}>
              <DevToolsPanel
                networkRequest={chrome.devtools.network.onRequestFinished}
              />
            </StylesProvider>,
            panelWindow.document.getElementById("root")
          );
        }
        alreadyShown = true;
      });
    }
  );
}

createPanel();
