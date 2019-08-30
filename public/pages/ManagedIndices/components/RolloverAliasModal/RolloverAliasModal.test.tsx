/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, wait } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toastNotifications } from "ui/notify";
import RolloverAliasModal from "./RolloverAliasModal";
import { browserServicesMock } from "../../../../../test/mocks";

describe("<RolloverAliasModal /> spec", () => {
  it("renders the component", () => {
    render(<RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<RolloverAliasModal services={browserServicesMock} index="some_index" onClose={onClose} />);

    fireEvent.click(getByTestId("addRolloverAliasModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables add button when no alias", async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
    );

    expect(getByTestId("addRolloverAliasModalAddButton")).toBeDisabled();

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    expect(getByTestId("addRolloverAliasModalAddButton")).not.toBeDisabled();
  });

  it("shows success toaster when successful", async () => {
    browserServicesMock.indexService.addRolloverAlias = jest.fn().mockResolvedValue({ ok: true, response: { acknowledged: true } });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("addRolloverAliasModalAddButton"));

    await wait();

    expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addSuccess).toHaveBeenCalledWith("Added rollover alias to some_index");
  });

  it("shows error toaster when error is thrown", async () => {
    browserServicesMock.indexService.addRolloverAlias = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("addRolloverAliasModalAddButton"));

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows error toaster when error is returned", async () => {
    browserServicesMock.indexService.addRolloverAlias = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("addRolloverAliasModalAddButton"));

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows error toaster when call is not acknowledged", async () => {
    browserServicesMock.indexService.addRolloverAlias = jest.fn().mockResolvedValue({
      ok: true,
      response: { acknowledged: false },
    });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("addRolloverAliasModalAddButton"));

    await wait();

    expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
    expect(toastNotifications.addDanger).toHaveBeenCalledWith("Failed to add rollover alias to some_index");
  });
});
