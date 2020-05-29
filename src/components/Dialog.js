import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function FullScreenDialog({
  responseBody,
  requestBody,
  closeRequestBody,
  requestVariables,
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    closeRequestBody();
    setOpen(false);
  };

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Dialog
        disablePortal
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar} style={{ background: "#1DA1DC" }}>
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="simple tabs example"
              indicatorColor="#000"
            >
              <Tab label="Request Body" />
              {requestVariables ? <Tab label="Request Variables" /> : null}
              <Tab label="Response Body" />
              {}
            </Tabs>
          </Toolbar>
        </AppBar>
        <TabPanel value={value} index={0}>
          <SyntaxHighlighter language="json" style={githubGist}>
            {requestBody}
          </SyntaxHighlighter>
        </TabPanel>
        {requestVariables ? (
          <TabPanel value={value} index={1}>
            <SyntaxHighlighter language="json" style={githubGist}>
              {requestVariables}
            </SyntaxHighlighter>
          </TabPanel>
        ) : null}
        <TabPanel value={value} index={requestVariables ? 2 : 1}>
          <SyntaxHighlighter language="json" style={githubGist}>
            {JSON.stringify(responseBody, null, 2)}
          </SyntaxHighlighter>
        </TabPanel>
      </Dialog>
    </div>
  );
}
