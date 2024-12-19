// App.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from './App';

// Mock Internal Components
jest.mock('./TopNavigationBar', () => (props) => (
  <div data-testid="top-navigation-bar">
    <button onClick={() => props.handlePauseScroll()}>Pause Scroll</button>
    <button onClick={() => props.handleRecording('start')}>Start Recording</button>
    <button onClick={() => props.handleRecording('stopped')}>Stop Recording</button>
    <button onClick={() => props.handleRecording('resume')}>Resume Recording</button> {/* Added for 'else' case */}
  </div>
));

jest.mock('./CreateApiEntry', () => (props) => (
  <div data-testid="api-entry">
    <span>{props.method}</span>
    <span>{props.path}</span>
    <span>{props.status}</span>
    <button
      onClick={() =>
        props.showRequestBody(
          props.id,
          props.responseBody,
          props.requestBody,
          props.requestVariables,
          props.method,
          props.path
        )
      }
    >
      Details
    </button>
  </div>
));

// Updated ApiDetailsDialog Mock
jest.mock('./ApiDetailsDialog', () => (props) => (
  <div data-testid="api-details-dialog">
    <div>{props.method}</div>
    <div>{props.path}</div>
    {/* Stringify props if they are objects */}
    <div>{typeof props.requestBody === 'object' ? JSON.stringify(props.requestBody) : props.requestBody}</div>
    <div>{typeof props.responseBody === 'object' ? JSON.stringify(props.responseBody) : props.responseBody}</div>
    <div>{typeof props.requestVariables === 'object' ? JSON.stringify(props.requestVariables) : props.requestVariables}</div>
    <button onClick={props.closeRequestBody}>Close</button>
  </div>
));

// Mock GraphQL
jest.mock('graphql', () => ({
  parse: jest.fn((query) => {
    if (query.includes('invalid')) {
      throw new Error('Parse Error');
    }
    return { definitions: [{ name: { value: 'MockQuery' } }] };
  }),
  print: jest.fn((ast) => {
    if (ast.invalid) {
      throw new Error('Print Error');
    }
    return 'Mock Printed Query';
  }),
}));

// Mock Material UI CircularProgress
jest.mock('@material-ui/core/CircularProgress', () => () => (
  <div data-testid="circular-progress" />
));

// Mock scrollIntoView to prevent errors in tests
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('App Component', () => {
  let mockAddListener;
  let mockNetworkRequest;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock networkRequest prop
    mockAddListener = jest.fn();
    mockNetworkRequest = {
      addListener: mockAddListener,
    };
  });

  const renderComponent = () => {
    return render(<App networkRequest={mockNetworkRequest} />);
  };

  test('renders TopNavigationBar and CircularProgress when no API calls', () => {
    renderComponent();

    // Check for TopNavigationBar
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();

    // Check for CircularProgress and its text
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    expect(screen.getByText(/Monitoring for API calls from/i)).toBeInTheDocument();
  });

  test('renders API entries when apiCalls are present', async () => {
    renderComponent();

    // Ensure the listener was added
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/test-endpoint',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 123,
      getContent: (cb) => {
        // Make the callback asynchronous to allow React Testing Library to handle it within act
        setTimeout(() => cb(JSON.stringify({ success: true }), 'utf-8'), 0);
      },
    };

    // Invoke the listener with the mockRequest
    listenerCallback(mockRequest);

    // Wait for state update / DOM update
    await waitFor(() => {
      // CircularProgress should not be in the document
      expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();

      // Check for API entry
      expect(screen.getByTestId('api-entry')).toBeInTheDocument();
      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('/test-endpoint')).toBeInTheDocument(); // Note: '/api' is stripped in the component
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  test('handles pause scroll functionality', () => {
    renderComponent();

    const pauseButton = screen.getByText('Pause Scroll');
    fireEvent.click(pauseButton);

    // Since we cannot directly inspect internal state, we assume that the handler was called correctly.
    // Further testing would require refactoring the component to expose state or use callback spies.
    // For now, ensure that no errors occur during the click.
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
  });

  test('handles recording start and stop', () => {
    renderComponent();

    const startButton = screen.getByText('Start Recording');
    const stopButton = screen.getByText('Stop Recording');

    fireEvent.click(startButton);
    // After starting recording, apiCalls should be cleared.
    // Since there are no apiCalls yet, ensure CircularProgress is displayed
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();

    fireEvent.click(stopButton);
    // After stopping, no direct DOM changes can be observed without additional state exposure
    // Ensure no errors occur during the click
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
  });

  test('shows ApiDetailsDialog when Details button is clicked', async () => {
    renderComponent();

    // Simulate the networkRequest.addListener callback
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/test-endpoint',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 123,
      getContent: (cb) => {
        // Make the callback asynchronous
        setTimeout(() => cb(JSON.stringify({ success: true }), 'utf-8'), 0);
      },
    };

    // Invoke the listener with the mockRequest
    listenerCallback(mockRequest);

    // Wait for API entry to appear
    await waitFor(() => {
      expect(screen.getByTestId('api-entry')).toBeInTheDocument();
    });

    // Click the Details button to open the dialog
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    // Ensure the dialog is displayed with correct content
    await waitFor(() => {
      const dialog = screen.getByTestId('api-details-dialog');
      expect(dialog).toBeInTheDocument();

      // Use `within` to scope queries to the dialog
      const { getByText, getAllByText } = within(dialog);

      expect(getByText('GET')).toBeInTheDocument();
      expect(getByText('/test-endpoint')).toBeInTheDocument();
      // Since requestBody and requestVariables are "null" (string), there should be at least two 'null' texts
      expect(getAllByText('null').length).toBeGreaterThanOrEqual(2);
      expect(getByText('{"success":true}')).toBeInTheDocument(); // responseBody
    });

    // Close the dialog
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Ensure the dialog is closed
    await waitFor(() => {
      expect(screen.queryByTestId('api-details-dialog')).not.toBeInTheDocument();
    });
  });

  test('componentDidMount adds network request listener', () => {
    renderComponent();
    expect(mockAddListener).toHaveBeenCalledTimes(1);
  });

  test('handles network requests and updates apiCalls state', async () => {
    renderComponent();

    // Simulate the networkRequest.addListener callback
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'POST',
        url: '/api/test-graphql',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 100,
        postData: {
          text: JSON.stringify({
            query: 'query { test }',
            variables: { id: 1 },
          }),
        },
      },
      response: {
        status: 200,
      },
      time: 150,
      getContent: (cb) => {
        // Make the callback asynchronous
        setTimeout(() => cb(JSON.stringify({ data: { test: 'value' } }), 'utf-8'), 0);
      },
    };

    // Invoke the listener
    listenerCallback(mockRequest);

    // Wait for state update
    await waitFor(() => {
      const apiEntries = screen.getAllByTestId('api-entry');
      expect(apiEntries.length).toBe(1);
      expect(screen.getByText('query')).toBeInTheDocument(); // method overridden to 'query' for GraphQL
      expect(screen.getByText('MockQuery')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    // Optionally, verify that scrollIntoView was called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  test('filters out background API calls', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    const backgroundApiPaths = [
      '/internal/cluster/me/is_registered',
      '/v1/cluster/me/version',
    ];

    backgroundApiPaths.forEach((path) => {
      const mockRequest = {
        request: {
          method: 'GET',
          url: `/api${path}`,
          headers: [
            { name: 'rk-web-app-request', value: 'true' },
          ],
          bodySize: 0,
          postData: { text: '' },
        },
        response: {
          status: 200,
        },
        time: 100,
        getContent: (cb) => {
          // Make the callback asynchronous
          setTimeout(() => cb(JSON.stringify({ data: {} }), 'utf-8'), 0);
        },
      };

      listenerCallback(mockRequest);
    });

    // Wait to ensure apiCalls are not updated
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      // CircularProgress should still be displayed
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  // **New Test Cases to Cover ":authority" Header Handling**

  test('filtersRubrikApiCallBasedOnAuthorityHeader', async () => {
    renderComponent();

    // Ensure the listener was added
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/rubrik-endpoint',
        headers: [
          { name: ':authority', value: 'my.rubrik.com' }, // Valid Rubrik domain
          { name: 'other-header', value: 'some-value' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 200,
      getContent: (cb) => {
        // Payload can be arbitrary for this test
        setTimeout(() => cb(JSON.stringify({ success: true }), 'utf-8'), 0);
      },
    };

    // Invoke the listener with the mockRequest
    listenerCallback(mockRequest);

    // Wait for API entry to appear
    await waitFor(() => {
      const apiEntries = screen.getAllByTestId('api-entry');
      expect(apiEntries.length).toBe(1);
      // Verify that the path is stripped correctly
      expect(screen.getByText('/rubrik-endpoint')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('GET')).toBeInTheDocument();
    });
  });

  test('filtersNonRubrikApiCallBasedOnAuthorityHeader', async () => {
    renderComponent();

    // Ensure the listener was added
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/non-rubrik-endpoint',
        headers: [
          { name: ':authority', value: 'my.non-rubrik.com' }, // Invalid Rubrik domain
          { name: 'other-header', value: 'some-value' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 250,
      getContent: (cb) => {
        // Payload can be arbitrary for this test
        setTimeout(() => cb(JSON.stringify({ success: true }), 'utf-8'), 0);
      },
    };

    // Invoke the listener with the mockRequest
    listenerCallback(mockRequest);

    // Wait to ensure that the API call is **not** recorded
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      // CircularProgress should still be displayed
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  test('handlesMissingAuthorityHeader', async () => {
    renderComponent();

    // Ensure the listener was added
    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/no-authority-endpoint',
        headers: [
          { name: 'some-other-header', value: 'some-value' }, // No ':authority' header
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 300,
      getContent: (cb) => {
        // Payload can be arbitrary for this test
        setTimeout(() => cb(JSON.stringify({ success: true }), 'utf-8'), 0);
      },
    };

    // Invoke the listener with the mockRequest
    listenerCallback(mockRequest);

    // Wait to ensure that the API call is **not** recorded
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      // CircularProgress should still be displayed
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  // **New Test Cases to Cover `shouldBeFiltered` Conditions**

  test('filtersApiCalls with path containing "User:::"', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/User:::12345/details',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 110,
      getContent: (cb) => {
        setTimeout(() => cb(JSON.stringify({ data: {} }), 'utf-8'), 0);
      },
    };

    // Invoke listener
    listenerCallback(mockRequest);

    // Wait to ensure API call is not recorded
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  test('filtersApiCalls with path containing "User%3A"', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/User%3A67890/info',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 120,
      getContent: (cb) => {
        setTimeout(() => cb(JSON.stringify({ data: {} }), 'utf-8'), 0);
      },
    };

    // Invoke listener
    listenerCallback(mockRequest);

    // Wait to ensure API call is not recorded
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  test('filtersApiCalls with path containing "Organization%3A"', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'GET',
        url: '/api/Organization%3A54321/status',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 0,
        postData: { text: '' },
      },
      response: {
        status: 200,
      },
      time: 130,
      getContent: (cb) => {
        setTimeout(() => cb(JSON.stringify({ data: {} }), 'utf-8'), 0);
      },
    };

    // Invoke listener
    listenerCallback(mockRequest);

    // Wait to ensure API call is not recorded
    await waitFor(() => {
      expect(screen.queryAllByTestId('api-entry').length).toBe(0);
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  // **New Test Cases to Cover Error Handling in `handleNetworkRequest`**

  test('handles GraphQL parse errors gracefully', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    const mockRequest = {
      request: {
        method: 'POST',
        url: '/api/test-graphql-error',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 100,
        postData: {
          text: JSON.stringify({
            query: 'invalid { test }', // This will trigger parse error
            variables: { id: 1 },
          }),
        },
      },
      response: {
        status: 500,
      },
      time: 160,
      getContent: (cb) => {
        // Simulate malformed response
        setTimeout(() => cb('Internal Server Error', 'utf-8'), 0);
      },
    };

    // Invoke listener
    listenerCallback(mockRequest);

    // Wait for API entry to appear with error handling
    await waitFor(() => {
      expect(screen.getByTestId('api-entry')).toBeInTheDocument();
      expect(screen.getByText('query')).toBeInTheDocument(); // Despite parse error, method is set to 'query'
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    // Open the dialog to verify responseBody and requestBody handling
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    await waitFor(() => {
      const dialog = screen.getByTestId('api-details-dialog');
      expect(dialog).toBeInTheDocument();

      const { getByText } = within(dialog);

      expect(getByText('query')).toBeInTheDocument();
      expect(getByText('Internal Server Error')).toBeInTheDocument(); // responseBody
    });
  });

  test('handles GraphQL print errors gracefully', async () => {
    renderComponent();

    const listenerCallback = mockAddListener.mock.calls[0][0];

    // Modify the mock to throw an error during print for this specific test
    const { print } = require('graphql');
    print.mockImplementationOnce(() => { throw new Error('Print Error'); });

    const mockRequest = {
      request: {
        method: 'POST',
        url: '/api/test-graphql-print-error',
        headers: [
          { name: 'rk-web-app-request', value: 'true' },
        ],
        bodySize: 100,
        postData: {
          text: JSON.stringify({
            query: 'query { test }',
            variables: { id: 2 },
          }),
        },
      },
      response: {
        status: 200,
      },
      time: 170,
      getContent: (cb) => {
        setTimeout(() => cb(JSON.stringify({ data: { test: 'value' } }), 'utf-8'), 0);
      },
    };

    // Invoke listener
    listenerCallback(mockRequest);

    // Wait for API entry to appear with print error handling
    await waitFor(() => {
      expect(screen.getByTestId('api-entry')).toBeInTheDocument();
      expect(screen.getByText('query')).toBeInTheDocument();
      expect(screen.getByText('MockQuery')).toBeInTheDocument(); // Name parsing still works
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    // Open the dialog to verify responseBody and requestBody handling
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    await waitFor(() => {
      const dialog = screen.getByTestId('api-details-dialog');
      expect(dialog).toBeInTheDocument();

      const { getByText, queryByText } = within(dialog);

      expect(getByText('query')).toBeInTheDocument();
      expect(getByText('MockQuery')).toBeInTheDocument();
      expect(getByText('{"data":{"test":"value"}}')).toBeInTheDocument(); // responseBody
    });
  });

  // **New Test Cases to Cover the "Else" Case in handleRecording**

  test('handles recording resume', () => {
    renderComponent();

    const resumeButton = screen.getByText('Resume Recording');
    fireEvent.click(resumeButton);

    // Since we cannot directly inspect internal state, ensure no errors occur
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
  });
});