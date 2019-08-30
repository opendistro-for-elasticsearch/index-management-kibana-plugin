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

import React, { Component } from "react";
import { toastNotifications } from "ui/notify";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiComboBox,
  EuiFormRow,
  EuiFieldText,
  EuiCallOut,
} from "@elastic/eui";
import { BrowserServices } from "../../../../models/interfaces";
import { PolicyOption } from "../../models/interfaces";
import { Policy } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";

interface AddPolicyModalProps {
  onClose: () => void;
  services: BrowserServices;
  indices: string[];
}

interface AddPolicyModalState {
  isLoading: boolean;
  selectedPolicy: PolicyOption | null;
  hasRolloverAction: boolean;
  policyOptions: PolicyOption[];
  rolloverAlias: string;
}

export default class AddPolicyModal extends Component<AddPolicyModalProps, AddPolicyModalState> {
  state: AddPolicyModalState = {
    isLoading: false,
    selectedPolicy: null,
    hasRolloverAction: false,
    policyOptions: [],
    rolloverAlias: "",
  };

  async componentDidMount(): Promise<void> {
    await this.onPolicySearchChange("");
  }

  onAddPolicy = async (): Promise<void> => {
    try {
      const { selectedPolicy, hasRolloverAction, rolloverAlias } = this.state;
      const {
        onClose,
        indices,
        services: { indexService },
      } = this.props;
      if (!indices) {
        toastNotifications.addDanger("There are no selected indices");
        return;
      }
      if (!selectedPolicy) {
        toastNotifications.addDanger("There is no selected policy");
        return;
      }

      const policyId = selectedPolicy.label;
      const addPolicyResponse = await indexService.addPolicy(indices, policyId);
      if (addPolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = addPolicyResponse.response;
        if (updatedIndices) {
          toastNotifications.addSuccess(`Added policy to ${updatedIndices} indices`);
          if (hasRolloverAction && rolloverAlias && indices.length === 1) {
            await this.onAddRolloverAlias(indices[0], rolloverAlias);
          }
        }
        if (failures) {
          toastNotifications.addDanger(
            `Failed to add policy to ${failedIndices.map(failedIndex => `[${failedIndex.indexName}, ${failedIndex.reason}]`).join(", ")}`
          );
        }
        onClose();
      } else {
        toastNotifications.addDanger(addPolicyResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem adding policy to indices"));
    }
  };

  onAddRolloverAlias = async (index: string, rolloverAlias: string): Promise<void> => {
    const {
      services: { indexService },
    } = this.props;
    try {
      const response = await indexService.addRolloverAlias(index, rolloverAlias);
      if (response.ok) {
        if (response.response.acknowledged) {
          toastNotifications.addSuccess(`Added rollover alias to ${index}`);
        } else {
          toastNotifications.addDanger(`Failed to add rollover alias to ${index}`);
        }
      } else {
        toastNotifications.addDanger(response.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, `There was a problem adding rollover alias to ${index}`));
    }
  };

  onPolicySearchChange = async (searchValue: string): Promise<void> => {
    const {
      services: { indexService },
    } = this.props;
    this.setState({ isLoading: true, policyOptions: [] });
    try {
      const searchPoliciesResponse = await indexService.searchPolicies(searchValue, true);
      if (searchPoliciesResponse.ok) {
        const policies = searchPoliciesResponse.response.hits.hits.map((hit: { _id: string; _source: { policy: Policy } }) => ({
          label: hit._id,
          policy: hit._source.policy,
        }));
        this.setState({ policyOptions: policies });
      } else {
        if (searchPoliciesResponse.error.startsWith("[index_not_found_exception]")) {
          toastNotifications.addDanger("You have not created a policy yet");
        } else {
          toastNotifications.addDanger(searchPoliciesResponse.error);
        }
      }
    } catch (err) {
      toastNotifications.addDanger(err.message);
    }

    this.setState({ isLoading: false });
  };

  onChangeSelectedPolicy = (selectedPolicies: PolicyOption[]): void => {
    const selectedPolicy = selectedPolicies.length ? selectedPolicies[0] : null;
    const hasRolloverAction =
      !!selectedPolicy &&
      !!selectedPolicy.policy &&
      selectedPolicy.policy.states.some(state => state.actions.some(action => action.hasOwnProperty("rollover")));
    this.setState({ selectedPolicy, hasRolloverAction });
  };

  onChangeRolloverAlias = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ rolloverAlias: e.target.value });
  };

  renderRollover = () => {
    const { rolloverAlias, hasRolloverAction } = this.state;
    const { indices } = this.props;
    const hasSingleIndexSelected = indices.length === 1;

    if (!hasRolloverAction) return null;

    if (hasSingleIndexSelected) {
      return (
        <EuiFormRow label="Rollover alias" helpText="A rollover alias is required when using the rollover action">
          <EuiFieldText placeholder="Rollover alias" value={rolloverAlias} onChange={this.onChangeRolloverAlias} />
        </EuiFormRow>
      );
    }

    return (
      <EuiCallOut
        style={{ width: "350px" }}
        title={
          <p>
            You are applying a policy with rollover to multiple indices. You will need to add a unique rollover_alias setting to each index.
          </p>
        }
        iconType="alert"
        size="s"
        color="warning"
      />
    );
  };

  render() {
    const { policyOptions, selectedPolicy, isLoading, rolloverAlias, hasRolloverAction } = this.state;
    const { onClose, indices } = this.props;
    const selectedOptions = selectedPolicy ? [selectedPolicy] : [];
    const hasSingleIndexSelected = indices.length === 1;
    const isAddDisabled = !selectedPolicy || (hasSingleIndexSelected && hasRolloverAction && !rolloverAlias);
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Add policy</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiFormRow label="Policy" helpText="Select the policy you want to add to the indices">
              <EuiComboBox
                placeholder="Search policies"
                async
                options={policyOptions}
                singleSelection={{ asPlainText: true }}
                selectedOptions={selectedOptions}
                isLoading={isLoading}
                onChange={this.onChangeSelectedPolicy}
                onSearchChange={this.onPolicySearchChange}
              />
            </EuiFormRow>
            {this.renderRollover()}
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={onClose} data-test-subj="addPolicyModalCloseButton">
              Close
            </EuiButtonEmpty>

            <EuiButton disabled={isAddDisabled} onClick={this.onAddPolicy} fill data-test-subj="addPolicyModalEditButton">
              Add
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
