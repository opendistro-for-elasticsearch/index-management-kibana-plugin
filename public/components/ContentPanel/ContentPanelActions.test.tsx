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
import { render, fireEvent } from "@testing-library/react";
import ContentPanelActions from "./ContentPanelActions";

describe("<ContentPanelActions /> spec", () => {
  it("renders the component", () => {
    const actions = [{ text: "ContentPanelActions" }];
    const { container } = render(<ContentPanelActions actions={actions} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders a button to click", () => {
    const spy = jest.fn();
    const actions = [{ text: "ContentPanelActions", buttonProps: { onClick: spy } }];
    const { getByTestId } = render(<ContentPanelActions actions={actions} />);
    fireEvent.click(getByTestId("ContentPanelActionsButton"));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("passes rest of props to button", () => {
    const spy = jest.fn();
    const actions = [{ text: "ContentPanelActions", buttonProps: { onClick: spy, disabled: true } }];
    const { getByTestId } = render(<ContentPanelActions actions={actions} />);
    fireEvent.click(getByTestId("ContentPanelActionsButton"));
    expect(spy).toHaveBeenCalledTimes(0);
    expect(getByTestId("ContentPanelActionsButton")).toBeDisabled();
  });
});
