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
import { EuiButton, EuiOverlayMask, EuiModal } from "@elastic/eui";
import { render, fireEvent } from "@testing-library/react";
import ModalRoot from "./ModalRoot";
import { ModalConsumer, ModalProvider } from "./Modal";
import { ServicesConsumer, ServicesContext } from "../../services/Services";
import { browserServicesMock } from "../../../test/mocks";

describe("<ModalRoot /> spec", () => {
  it("renders nothing when not used", () => {
    const { container } = render(
      <ServicesContext.Provider value={browserServicesMock}>
        <ModalProvider>
          <ServicesConsumer>{services => services && <ModalRoot services={services} />}</ServicesConsumer>
        </ModalProvider>
      </ServicesContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders a modal that can close and open", () => {
    const Modal = ({ onClose, text }: { onClose: () => {}; text: string }) => (
      <EuiOverlayMask>
        <EuiModal onClose={onClose}>A modal that has {text}</EuiModal>
      </EuiOverlayMask>
    );
    const { queryByText, getByTestId, getByLabelText } = render(
      <div>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <ServicesConsumer>{services => services && <ModalRoot services={services} />}</ServicesConsumer>
            <ModalConsumer>
              {({ onShow }) => (
                <EuiButton data-test-subj="showModal" onClick={() => onShow(Modal, { text: "interesting text" })}>
                  Show Modal
                </EuiButton>
              )}
            </ModalConsumer>
          </ModalProvider>
        </ServicesContext.Provider>
      </div>
    );

    expect(queryByText("A modal that has interesting text")).toBeNull();

    fireEvent.click(getByTestId("showModal"));

    expect(queryByText("A modal that has interesting text")).not.toBeNull();

    fireEvent.click(getByLabelText("Closes this modal window"));

    expect(queryByText("A modal that has interesting text")).toBeNull();
  });
});
