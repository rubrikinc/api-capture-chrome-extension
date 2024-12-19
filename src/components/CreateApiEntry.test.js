import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApiEntry from "./CreateApiEntry";
import { copy } from "clipboard-js";

// Mocking Material UI components
jest.mock("@material-ui/core/ListItem", () => (props) => <div {...props} data-testid="ListItem" />);
jest.mock("@material-ui/core/Paper", () => (props) => <div {...props} data-testid="Paper" />);
jest.mock("@material-ui/core/IconButton", () => (props) => <button {...props} data-testid="IconButton" />);
jest.mock("@material-ui/core/List", () => (props) => <div {...props} data-testid="List" />);
jest.mock("@material-ui/icons/FileCopy", () => (props) => <div {...props} data-testid="FileCopyIcon" />);

jest.mock("clipboard-js", () => ({
  copy: jest.fn()
}));

const showRequestBodyMock = jest.fn();

describe("ApiEntry", () => {
  const defaultProps = {
    id: 1,
    status: 200,
    method: "GET",
    path: "/api/resource",
    responseBody: "{}",
    requestBody: "{}",
    responseTime: 123,
    showRequestBody: showRequestBodyMock,
    requestVariables: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with success styles when status is a successful HTTP code", () => {
    render(<ApiEntry {...defaultProps} />);

    const list = screen.getByTestId("List");
    expect(list).toHaveClass("list-border-success list-spacing");
  });

  test("renders with error styles when status is not a successful HTTP code", () => {
    render(<ApiEntry {...defaultProps} status={404} />);

    const list = screen.getByTestId("List");
    expect(list).toHaveClass("list-border-error list-spacing");
  });


  test('renders with success class when status is a success code', () => {
    render(<ApiEntry {...defaultProps} status={200} />);

    const list = screen.getByTestId("List");
    expect(list).toHaveClass("list-border-success list-spacing");
  });



  test("shows and hides copy button on mouse enter and leave", () => {
    render(<ApiEntry {...defaultProps} />);

    const paper = screen.getByTestId("Paper");
    fireEvent.mouseEnter(paper);

    expect(screen.getByTestId("IconButton")).toBeInTheDocument();

    fireEvent.mouseLeave(paper);
    expect(screen.queryByTestId("IconButton")).toBeNull();
  });

  test("copies text to clipboard when copy button is clicked", () => {
    render(<ApiEntry {...defaultProps} />);

    const paper = screen.getByTestId("Paper");
    fireEvent.mouseEnter(paper);

    const copyButton = screen.getByTestId("IconButton");
    fireEvent.click(copyButton);

    expect(copy).toHaveBeenCalledWith(`${defaultProps.method.toUpperCase()} ${defaultProps.path}`);
  });

  test("handles copy error gracefully when copy button is clicked", () => {
    copy.mockImplementation(() => { throw new Error("Copy failed"); });

    render(<ApiEntry {...defaultProps} />);

    const paper = screen.getByTestId("Paper");
    fireEvent.mouseEnter(paper);

    const copyButton = screen.getByTestId("IconButton");
    fireEvent.click(copyButton);

    expect(copy).toHaveBeenCalledWith(`${defaultProps.method.toUpperCase()} ${defaultProps.path}`);
    // Ensure no error is thrown due to the exception
  });

  test("calls showRequestBody with correct arguments on list item click", () => {
    render(<ApiEntry {...defaultProps} />);

    const listItem = screen.getByTestId("ListItem");
    fireEvent.click(listItem);

    expect(showRequestBodyMock).toHaveBeenCalledWith(
      defaultProps.id,
      defaultProps.responseBody,
      defaultProps.requestBody,
      defaultProps.requestVariables,
      defaultProps.method,
      defaultProps.path
    );
  });
});