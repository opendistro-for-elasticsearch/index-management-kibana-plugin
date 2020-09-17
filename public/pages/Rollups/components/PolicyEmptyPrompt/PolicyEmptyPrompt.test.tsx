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
import { render, fireEvent } from "@testing-library/react";
import PolicyEmptyPrompt, { TEXT } from "./PolicyEmptyPrompt";

describe("<PolicyEmptyPrompt /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<PolicyEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no indices by default", async () => {
    const { getByText, queryByTestId } = render(<PolicyEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    getByText(TEXT.NO_POLICIES);
    expect(queryByTestId("policyEmptyPromptRestFilters")).toBeNull();
  });

  it("shows LOADING", async () => {
    const { getByText, queryByTestId } = render(<PolicyEmptyPrompt filterIsApplied={true} loading={true} resetFilters={() => {}} />);

    getByText(TEXT.LOADING);
    expect(queryByTestId("policyEmptyPromptRestFilters")).toBeNull();
  });

  it("shows reset filters", async () => {
    const resetFilters = jest.fn();
    const { getByText, getByTestId } = render(<PolicyEmptyPrompt filterIsApplied={true} loading={false} resetFilters={resetFilters} />);

    getByText(TEXT.RESET_FILTERS);
    fireEvent.click(getByTestId("policyEmptyPromptRestFilters"));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});
