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
import RetryModal from "./RetryModal";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";

const retryItems: ManagedIndexItem[] = [
  {
    index: "some_index",
    indexUuid: "some-index-uuid",
    policyId: "some_policy",
    policySeqNo: 1,
    policyPrimaryTerm: 1,
    policy: {
      description: "some description",
      default_state: "one",
      states: [
        { name: "one", actions: [{ delete: {} }], transitions: [] },
        { name: "two", actions: [{ delete: {} }], transitions: [] },
      ],
    },
    enabled: false,
    managedIndexMetaData: null,
  },
];

describe("<RetryModal /> spec", () => {
  it("renders the component", () => {
    render(<RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />);
    // EuiOverlayMask appends an element to the body so we should have two, an empty div from react-test-library
    // and our EuiOverlayMask element
    expect(document.body.children).toHaveLength(2);
    expect(document.body.children[1]).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<RetryModal services={browserServicesMock} retryItems={retryItems} onClose={onClose} />);

    fireEvent.click(getByTestId("retryModalCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables select from state when no common states", () => {
    const retryItems: ManagedIndexItem[] = [
      {
        index: "some_index_1",
        indexUuid: "some-index-uuid-1",
        policyId: "some_policy_1",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "one",
          states: [
            { name: "one", actions: [{ delete: {} }], transitions: [] },
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: false,
        managedIndexMetaData: null,
      },
      {
        index: "some_index_2",
        indexUuid: "some-index-uuid-2",
        policyId: "some_policy_2",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "five",
          states: [{ name: "five", actions: [{ delete: {} }], transitions: [] }],
        },
        enabled: false,
        managedIndexMetaData: null,
      },
      {
        index: "some_index_3",
        indexUuid: "some-index-uuid-3",
        policyId: "some_policy_3",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "two",
          states: [
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: false,
        managedIndexMetaData: null,
      },
    ];
    const { getByLabelText } = render(
      <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} core={coreServicesMock} />
    );

    expect(getByLabelText("Retry failed policy from")).toBeDisabled();
  });

  it("disables select from state when item has no policy", () => {
    const retryItems: ManagedIndexItem[] = [
      {
        index: "some_index_1",
        indexUuid: "some-index-uuid-1",
        policyId: "some_policy_1",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "one",
          states: [
            { name: "one", actions: [{ delete: {} }], transitions: [] },
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: false,
        managedIndexMetaData: null,
      },
      {
        index: "some_index_2",
        indexUuid: "some-index-uuid-2",
        policyId: "some_policy_2",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: {
          description: "some description",
          default_state: "two",
          states: [
            { name: "two", actions: [{ delete: {} }], transitions: [] },
            { name: "three", actions: [{ delete: {} }], transitions: [] },
          ],
        },
        enabled: false,
        managedIndexMetaData: null,
      },
      {
        index: "some_index_3",
        indexUuid: "some-index-uuid-3",
        policyId: "some_policy_3",
        policySeqNo: 1,
        policyPrimaryTerm: 1,
        policy: null,
        enabled: false,
        managedIndexMetaData: null,
      },
    ];
    const { getByLabelText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    expect(getByLabelText("Retry failed policy from")).toBeDisabled();
  });

  it("can select a different state to retry from", async () => {
    browserServicesMock.managedIndexService.retryManagedIndexPolicy = jest
      .fn()
      .mockResolvedValue({ ok: true, response: { updatedIndices: 1, failedIndices: [], failures: false } });
    const { getByLabelText, getByTestId, getByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        {" "}
        <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    fireEvent.click(getByLabelText("Retry policy from selected state"));
    // @ts-ignore
    expect(getByText("two").selected).toBe(false);
    userEvent.selectOptions(getByLabelText("Retry failed policy from"), ["two"]);
    // trigger change until this is merged in: https://github.com/testing-library/user-event/pull/131
    fireEvent.change(getByLabelText("Retry failed policy from"));
    // @ts-ignore
    expect(getByText("two").selected).toBe(true);

    fireEvent.click(getByTestId("retryModalRetryButton"));

    await wait();

    expect(browserServicesMock.managedIndexService.retryManagedIndexPolicy).toHaveBeenCalledWith(["some_index"], "two");
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Retried 1 managed indices");
  });

  it("shows error toaster when error is thrown", async () => {
    browserServicesMock.managedIndexService.retryManagedIndexPolicy = jest.fn().mockRejectedValue(new Error("this is an error"));
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    fireEvent.click(getByTestId("retryModalRetryButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("this is an error");
  });

  it("shows error toaster when error is returned", async () => {
    browserServicesMock.managedIndexService.retryManagedIndexPolicy = jest.fn().mockResolvedValue({ ok: false, error: "some error" });
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    fireEvent.click(getByTestId("retryModalRetryButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("some error");
  });

  it("shows error toaster with each failed reason", async () => {
    browserServicesMock.managedIndexService.retryManagedIndexPolicy = jest.fn().mockResolvedValue({
      ok: true,
      response: { updatedIndices: 0, failures: true, failedIndices: [{ indexName: "index_a", reason: "some reason" }] },
    });
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <RetryModal services={browserServicesMock} retryItems={retryItems} onClose={() => {}} />
      </CoreServicesContext.Provider>
    );

    fireEvent.click(getByTestId("retryModalRetryButton"));

    await wait();

    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Failed to retry: [index_a, some reason]");
  });
});
