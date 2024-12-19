// ApiDetailsDialog.test.js

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ApiDetailsDialog, { Transition, TabPanel } from './ApiDetailsDialog';

const TabsMock = ({ value, onChange, children }) => (
  <div data-testid="tabs">
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, {
        onClick: () => onChange(null, index),
        selected: value === index,
        index,
      });
    })}
  </div>
);

const TabMock = ({ label, onClick, selected }) => (
  <button data-testid="tab" onClick={onClick} aria-selected={selected} type="button">
    {label}
  </button>
);

// Mock Material-UI components
jest.mock('@material-ui/core/Tabs', () => TabsMock);
jest.mock('@material-ui/core/Tab', () => TabMock);

jest.mock('@material-ui/core/Dialog', () => (props) => (
  <div data-testid="dialog">{props.children}</div>
));

jest.mock('@material-ui/core/AppBar', () => (props) => (
  <div data-testid="app-bar">{props.children}</div>
));

jest.mock('@material-ui/core/Toolbar', () => (props) => (
  <div data-testid="toolbar">{props.children}</div>
));

jest.mock('@material-ui/core/Slide', () => (props) => (
  <div data-testid="slide">{props.children}</div>
));

jest.mock('@material-ui/core/Box', () => (props) => (
  <div data-testid="box">{props.children}</div>
));

jest.mock('@material-ui/core/IconButton', () => (props) => (
  <button data-testid="icon-button" onClick={props.onClick}>
    {props.children}
  </button>
));

jest.mock('@material-ui/core/Typography', () => (props) => (
  <div data-testid="typography">{props.children}</div>
));

jest.mock('@material-ui/icons/Close', () => () => (
  <div data-testid="close-icon">CloseIcon</div>
));

// Mock Alert from @material-ui/lab
jest.mock('@material-ui/lab', () => ({
  Alert: (props) => (
    <div data-testid="alert" severity={props.severity}>
      {props.children}
    </div>
  ),
}));

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => {
  return ({ children }) => <div data-testid="syntax-highlighter">{children}</div>;
});

jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({
  githubGist: {},
}));

// Mock makeStyles
jest.mock('@material-ui/core/styles', () => ({
  makeStyles: () => () => ({}),
}));

// Mock CSS imports
jest.mock('./CreateApiEntry.css', () => {});

describe('ApiDetailsDialog Component', () => {
  const defaultProps = {
    responseBody: {
      message: "Success",
    },
    requestBody: '{"name": "Test"}',
    closeRequestBody: jest.fn(),
    requestVariables: '{"id": 123}',
    method: 'GET',
    path: '/api/test',
  };

  const renderComponent = (props = {}) => {
    return render(<ApiDetailsDialog {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    defaultProps.closeRequestBody.mockClear();
  });

  it('renders the dialog correctly', () => {
    renderComponent();
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('displays the close button and triggers close handler on click', () => {
    renderComponent();
    const closeButton = screen.getByTestId('icon-button');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(defaultProps.closeRequestBody).toHaveBeenCalled();
  });

  it('renders correct number of tabs when requestVariables are provided', () => {
    renderComponent();
    const tabs = screen.getAllByTestId('tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0]).toHaveTextContent('Request Body');
    expect(tabs[1]).toHaveTextContent('Request Variables');
    expect(tabs[2]).toHaveTextContent('Response Body');
  });

  it('renders correct number of tabs when requestVariables are not provided', () => {
    renderComponent({ requestVariables: null });
    const tabs = screen.getAllByTestId('tab');
    expect(tabs.length).toBe(2);
    expect(tabs[0]).toHaveTextContent('Request Body');
    expect(tabs[1]).toHaveTextContent('Response Body');
  });

  it('displays request body in the first tab by default', () => {
    renderComponent();
    const syntaxHighlighter = screen.getByTestId('syntax-highlighter');
    expect(syntaxHighlighter).toHaveTextContent(defaultProps.requestBody);
  });

  it('shows alert if request body is "null"', () => {
    renderComponent({ requestBody: 'null' });
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('The API call does not contain a Request Body.');
  });

  it('displays request variables in the second tab when clicked', () => {
    renderComponent();
    const tabs = screen.getAllByTestId('tab');
    const requestVariablesTab = tabs.find(tab => tab.textContent === 'Request Variables');
    expect(requestVariablesTab).toBeInTheDocument();
    fireEvent.click(requestVariablesTab);
  });

  it('shows alert if request variables are "{}"', () => {
    renderComponent({ requestVariables: '{}' });
    const tabs = screen.getAllByTestId('tab');
    const requestVariablesTab = tabs.find(tab => tab.textContent === 'Request Variables');
    expect(requestVariablesTab).toBeInTheDocument();
    fireEvent.click(requestVariablesTab);
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('The API call does not contain any Request Variables.');
  });

  it('displays response body in the last tab when clicked', () => {
    renderComponent();
    const tabs = screen.getAllByTestId('tab');
    const responseBodyTab = screen.getByText('Response Body');
    expect(responseBodyTab).toBeInTheDocument();
    fireEvent.click(responseBodyTab);
    const syntaxHighlighter = screen.getByTestId('syntax-highlighter');
    const expectedText = JSON.stringify(defaultProps.responseBody);

    expect(syntaxHighlighter.textContent.replace(/\s+/g, '')).toEqual(expectedText.replace(/\s+/g, ''));
  });

  it('renders the bottom AppBar with method and path', () => {
    renderComponent();
    const appBars = screen.getAllByTestId('app-bar');
    expect(appBars.length).toBe(2);
    const bottomAppBar = appBars[1];
    expect(bottomAppBar).toHaveTextContent(defaultProps.method.toUpperCase());
    expect(bottomAppBar).toHaveTextContent(defaultProps.path);
  });

  describe('handleChange function', () => {
    it('activates the correct tab when a tab is clicked', () => {
      renderComponent();
      const tabs = screen.getAllByTestId('tab');

      let syntaxHighlighter = screen.getByTestId('syntax-highlighter');
      expect(syntaxHighlighter).toHaveTextContent(defaultProps.requestBody);

      // Click on 'Request Variables' tab
      const requestVariablesTab = tabs.find(tab => tab.textContent === 'Request Variables');
      fireEvent.click(requestVariablesTab);
      syntaxHighlighter = screen.getByTestId('syntax-highlighter');
      expect(syntaxHighlighter).toHaveTextContent(defaultProps.requestVariables);

      // Click on 'Response Body' tab
      const responseBodyTab = tabs.find(tab => tab.textContent === 'Response Body');
      fireEvent.click(responseBodyTab);
      syntaxHighlighter = screen.getByTestId('syntax-highlighter');
      const expectedText = JSON.stringify(defaultProps.responseBody);
      
      expect(syntaxHighlighter.textContent.replace(/\s+/g, '')).toEqual(expectedText.replace(/\s+/g, ''));
    });

    it('does not render Request Variables tab when not provided', () => {
      renderComponent({ requestVariables: null });
      const tabs = screen.getAllByTestId('tab');
      expect(tabs.length).toBe(2);
      expect(tabs[0]).toHaveTextContent('Request Body');
      expect(tabs[1]).toHaveTextContent('Response Body');
    });
  });

  describe('Transition component', () => {
    it('renders children with Slide component', () => {
      const { getByTestId } = render(
        <Transition in>
          <div data-testid="transition-child">Child Element</div>
        </Transition>
      );

      const transitionElement = getByTestId('slide');
      expect(transitionElement).toBeInTheDocument();
      expect(transitionElement).toHaveTextContent('Child Element');
    });
  });

  describe('TabPanel component', () => {
    it('renders children when value matches index', () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <TabPanel value={0} index={0}>
          <div data-testid="tab-panel-child">Tab 0 Content</div>
        </TabPanel>
      );

      expect(getByTestId('tab-panel-child')).toBeInTheDocument();
      expect(getByTestId('tab-panel-child')).toHaveTextContent('Tab 0 Content');

      rerender(
        <TabPanel value={1} index={0}>
          <div data-testid="tab-panel-child">Tab 0 Content</div>
        </TabPanel>
      );

      expect(queryByTestId('tab-panel-child')).toBeNull();
    });

    it('does not render children when value does not match index', () => {
      const { queryByTestId } = render(
        <TabPanel value={1} index={0}>
          <div data-testid="tab-panel-child">Tab 0 Content</div>
        </TabPanel>
      );

      expect(queryByTestId('tab-panel-child')).toBeNull();
    });
  });
});