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
import ConfirmationModal from "./ConfirmationModal";

describe("<ConfirmationModal /> spec", () => {
  it("renders the component", () => {
    render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={() => {}}
        onAction={() => {}}
      />
    );
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("calls onAction when action button clicked", () => {
    const onAction = jest.fn();
    const { getByTestId } = render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={() => {}}
        onAction={onAction}
      />
    );

    fireEvent.click(getByTestId("confirmationModalActionButton"));
    expect(onAction).toHaveBeenCalled();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ConfirmationModal
        title="some title"
        bodyMessage="some body message"
        actionMessage="some action message"
        onClose={onClose}
        onAction={() => {}}
      />
    );

    fireEvent.click(getByTestId("confirmationModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });
});
