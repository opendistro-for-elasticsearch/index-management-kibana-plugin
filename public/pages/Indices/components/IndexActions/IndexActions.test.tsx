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
import IndexActions from "./IndexActions";

describe("<IndexActions /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexActions isAddDisabled={false} onClickAdd={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("disables add button", async () => {
    const { getByTestId } = render(<IndexActions isAddDisabled={true} onClickAdd={() => {}} />);

    expect(getByTestId("indexActionsAddPolicy")).toBeDisabled();
  });

  it("calls add button", async () => {
    const onClickAdd = jest.fn();
    const { getByTestId } = render(<IndexActions isAddDisabled={false} onClickAdd={onClickAdd} />);

    expect(getByTestId("indexActionsAddPolicy")).toBeEnabled();
    fireEvent.click(getByTestId("indexActionsAddPolicy"));
    expect(onClickAdd).toHaveBeenCalled();
  });
});
