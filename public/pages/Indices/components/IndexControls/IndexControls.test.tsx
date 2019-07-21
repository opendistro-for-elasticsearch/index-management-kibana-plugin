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
// @ts-ignore
import userEvent from "@testing-library/user-event";
import IndexControls from "./IndexControls";

describe("<IndexControls /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(
      <IndexControls
        activePage={0}
        pageCount={1}
        search={"testing"}
        onSearchChange={() => {}}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls onSearchChange when typing", async () => {
    const onSearchChange = jest.fn();
    const { getByPlaceholderText } = render(
      <IndexControls
        activePage={0}
        pageCount={1}
        search={""}
        onSearchChange={onSearchChange}
        onPageClick={() => {}}
        onRefresh={async () => {}}
      />
    );

    userEvent.type(getByPlaceholderText("Search"), "four");

    expect(onSearchChange).toHaveBeenCalledTimes(4);
  });

  it("shows/hides pagination", async () => {
    const { queryByTestId, rerender } = render(
      <IndexControls activePage={0} pageCount={1} search={""} onSearchChange={() => {}} onPageClick={() => {}} onRefresh={async () => {}} />
    );

    expect(queryByTestId("indexControlsPagination")).toBeNull();

    rerender(
      <IndexControls activePage={0} pageCount={2} search={""} onSearchChange={() => {}} onPageClick={() => {}} onRefresh={async () => {}} />
    );

    expect(queryByTestId("indexControlsPagination")).not.toBeNull();
  });

  it("calls onPageClick when clicking pagination", async () => {
    const onPageClick = jest.fn();
    const { getByTestId } = render(
      <IndexControls
        activePage={0}
        pageCount={2}
        search={""}
        onSearchChange={() => {}}
        onPageClick={onPageClick}
        onRefresh={async () => {}}
      />
    );

    fireEvent.click(getByTestId("pagination-button-1"));

    expect(onPageClick).toHaveBeenCalledTimes(1);
  });

  it("calls onRefresh on an interval", async () => {
    const onRefresh = jest.fn();
    const { getByTestId } = render(
      <IndexControls activePage={0} pageCount={2} search={""} onSearchChange={() => {}} onPageClick={() => {}} onRefresh={onRefresh} />
    );

    fireEvent.click(getByTestId("superDatePickerToggleQuickMenuButton"));

    expect(getByTestId("superDatePickerToggleRefreshButton")).toBeDisabled();

    userEvent.type(getByTestId("superDatePickerRefreshIntervalInput"), "1");

    expect(getByTestId("superDatePickerToggleRefreshButton")).toBeEnabled();

    fireEvent.click(getByTestId("superDatePickerToggleRefreshButton"));

    await wait(() => expect(onRefresh).toHaveBeenCalledTimes(2));
  });
});
