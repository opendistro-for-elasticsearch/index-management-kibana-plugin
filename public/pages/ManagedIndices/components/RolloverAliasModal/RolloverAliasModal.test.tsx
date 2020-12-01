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
import RolloverAliasModal from "./RolloverAliasModal";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";

describe("<RolloverAliasModal /> spec", () => {
  it("renders the component", () => {
    render(<RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />);
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={onClose} core={coreServicesMock} />
    );

    fireEvent.click(getByTestId("editRolloverAliasModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables add button when no alias", async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />
    );

    expect(getByTestId("editRolloverAliasModalAddButton")).toBeDisabled();

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    expect(getByTestId("editRolloverAliasModalAddButton")).not.toBeDisabled();
  });

  it("shows success toaster when successful", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({ ok: true, response: { acknowledged: true } });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Edited rollover alias on some_index");
  });

  it("shows error toaster when error is thrown", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows error toaster when error is returned", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows error toaster when call is not acknowledged", async () => {
    browserServicesMock.indexService.editRolloverAlias = jest.fn().mockResolvedValue({
      ok: true,
      response: { acknowledged: false },
    });
    const { getByTestId, getByPlaceholderText } = render(
      <RolloverAliasModal services={browserServicesMock} index="some_index" onClose={() => {}} core={coreServicesMock} />
    );

    await userEvent.type(getByPlaceholderText("Rollover alias"), "some_alias");

    fireEvent.click(getByTestId("editRolloverAliasModalAddButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Failed to edit rollover alias on some_index");
  });
});
