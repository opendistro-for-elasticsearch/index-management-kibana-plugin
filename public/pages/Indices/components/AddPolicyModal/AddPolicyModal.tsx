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
} from "@elastic/eui";
import { BrowserServices } from "../../../../models/interfaces";
import { PolicyOption } from "../../models/interfaces";

interface AddPolicyModalProps {
  onClose: () => void;
  services: BrowserServices;
  indices: string[];
}

interface AddPolicyModalState {
  isLoading: boolean;
  selectedPolicies: PolicyOption[];
  policyOptions: PolicyOption[];
}

export default class AddPolicyModal extends Component<AddPolicyModalProps, AddPolicyModalState> {
  state: AddPolicyModalState = {
    isLoading: false,
    selectedPolicies: [],
    policyOptions: [],
  };

  async componentDidMount() {
    await this.onPolicySearchChange("");
  }

  onAddPolicy = async (): Promise<void> => {
    try {
      const { selectedPolicies } = this.state;
      const {
        onClose,
        indices,
        services: { indexService },
      } = this.props;
      if (selectedPolicies.length !== 1) {
        toastNotifications.addDanger(`There are no selected indices`);
        return;
      }
      const policyId = selectedPolicies[0].label;
      const addPolicyResponse = await indexService.addPolicy(indices, policyId);
      if (addPolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = addPolicyResponse.response;
        toastNotifications.addSuccess(`Added policy to ${updatedIndices} indices`);
        if (failures) {
          toastNotifications.addDanger(`Failed to add policy to ${failedIndices}`);
        }
        onClose();
      } else {
        toastNotifications.addDanger(addPolicyResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message);
    }
  };

  onPolicySearchChange = async (searchValue: string): Promise<void> => {
    const {
      services: { indexService },
    } = this.props;
    this.setState({ isLoading: true, policyOptions: [] });
    try {
      const searchPoliciesResponse = await indexService.searchPolicies(searchValue);
      if (searchPoliciesResponse.ok) {
        const policies = searchPoliciesResponse.response.hits.hits.map((hit: { _id: string }) => hit._id);
        this.setState({ policyOptions: policies.map((policyId: string) => ({ label: policyId })) });
      } else {
        if (searchPoliciesResponse.error.startsWith("[index_not_found_exception]")) {
          toastNotifications.addDanger("You have no created a policy yet");
        } else {
          toastNotifications.addDanger(searchPoliciesResponse.error);
        }
      }
    } catch (err) {
      toastNotifications.addDanger(err.message);
    }

    this.setState({ isLoading: false });
  };

  onChange = (selectedPolicies: PolicyOption[]): void => {
    this.setState({ selectedPolicies });
  };

  render() {
    const { policyOptions, selectedPolicies, isLoading } = this.state;
    const { onClose } = this.props;
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Add policy</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiComboBox
              placeholder="Search policies"
              async
              options={policyOptions}
              singleSelection
              selectedOptions={selectedPolicies}
              isLoading={isLoading}
              onChange={this.onChange}
              onSearchChange={this.onPolicySearchChange}
            />
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={onClose} data-test-subj="addPolicyModalCloseButton">
              Close
            </EuiButtonEmpty>

            <EuiButton disabled={selectedPolicies.length !== 1} onClick={this.onAddPolicy} fill data-test-subj="addPolicyModalEditButton">
              Add
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
