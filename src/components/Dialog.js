import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
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
export const FullScreenDialog = React.memo(
  ({ key, responseBody, requestBody, closeRequestBody }) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      closeRequestBody();
      setOpen(false);
    };

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    const renders = React.useRef(0);

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
                <Tab label="Response Body" />
                <Tab label="Request Body" />
              </Tabs>

              {/* <Button autoFocus color="inherit" onClick={handleClose}>
              Copy
            </Button> */}
            </Toolbar>
          </AppBar>
          <TabPanel value={value} index={0}>
            <SyntaxHighlighter language="json" style={githubGist}>
              {JSON.stringify(responseBody, null, 2)}
            </SyntaxHighlighter>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SyntaxHighlighter language="json" style={githubGist}>
              {JSON.stringify(requestBody, null, 2)}
            </SyntaxHighlighter>
          </TabPanel>
        </Dialog>
      </div>
    );
  }
);
