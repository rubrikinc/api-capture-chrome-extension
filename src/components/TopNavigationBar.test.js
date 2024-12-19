import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopNavigationBar from './TopNavigationBar';

// Mocking Material UI components
jest.mock('@material-ui/core/AppBar', () => (props) => <div {...props} data-testid="AppBar" />);
jest.mock('@material-ui/core/Toolbar', () => (props) => <div {...props} data-testid="Toolbar" />);
jest.mock('@material-ui/core/Typography', () => (props) => <div {...props} data-testid="Typography" />);
jest.mock('@material-ui/core/IconButton', () => (props) => <button {...props} data-testid="IconButton" />);
jest.mock('@material-ui/core/Divider', () => (props) => <div {...props} data-testid="Divider" />);
jest.mock('@material-ui/core/Button', () => (props) => <button {...props} data-testid="Button" />);

// Props mock functions
const handlePauseScrollMock = jest.fn();
const handleRecordingMock = jest.fn();

describe('TopNavigationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <TopNavigationBar
        enableScrollToBottom={true}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );
    
    expect(screen.getByTestId('AppBar')).toBeInTheDocument();
    expect(screen.getByTestId('Toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('IconButton')).toBeInTheDocument();
    expect(screen.getByAltText('Rubrik logo')).toBeInTheDocument();
    expect(screen.getByTestId('Typography')).toHaveTextContent('API Code Capture');
    expect(screen.getAllByTestId('Button')).toHaveLength(2);
  });

  test('renders correct button texts', () => {
    render(
      <TopNavigationBar
        enableScrollToBottom={true}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );

    expect(screen.getByText('Start Recording')).toBeInTheDocument();
    expect(screen.getByText('Pause Scroll')).toBeInTheDocument();
  });

  test('calls handleRecording on recording button click', () => {
    render(
      <TopNavigationBar
        enableScrollToBottom={true}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );

    const recordingButton = screen.getByText('Start Recording');
    fireEvent.click(recordingButton);

    expect(handleRecordingMock).toHaveBeenCalledWith('start');
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Stop Recording'));
    expect(handleRecordingMock).toHaveBeenCalledWith('stopped');
    expect(screen.getByText('Reset Recording')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset Recording'));
    expect(handleRecordingMock).toHaveBeenCalledWith('reset');
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  test('calls handlePauseScroll on pause/resume button click', () => {
    render(
      <TopNavigationBar
        enableScrollToBottom={true}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );

    const pauseScrollButton = screen.getByText('Pause Scroll');
    fireEvent.click(pauseScrollButton);

    expect(handlePauseScrollMock).toHaveBeenCalled();
  });

  test('toggle button text based on enableScrollToBottom prop', () => {
    const { rerender } = render(
      <TopNavigationBar
        enableScrollToBottom={true}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );

    expect(screen.getByText('Pause Scroll')).toBeInTheDocument();

    rerender(
      <TopNavigationBar
        enableScrollToBottom={false}
        handlePauseScroll={handlePauseScrollMock}
        handleRecording={handleRecordingMock}
      />
    );

    expect(screen.getByText('Resume Scroll')).toBeInTheDocument();
  });
});