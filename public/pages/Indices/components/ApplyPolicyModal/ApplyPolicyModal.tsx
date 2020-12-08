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

import React, { Component, Fragment } from "react";
import _ from "lodash";
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
  EuiText,
  EuiSpacer,
  EuiCodeBlock,
  EuiLink,
  EuiIcon,
} from "@elastic/eui";
import { BrowserServices } from "../../../../models/interfaces";
import { PolicyOption } from "../../models/interfaces";
import { Policy, State } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { DOCUMENTATION_URL } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

interface ApplyPolicyModalProps {
  onClose: () => void;
  services: BrowserServices;
  indices: string[];
}

interface ApplyPolicyModalState {
  isLoading: boolean;
  selectedPolicy: PolicyOption | null;
  selectedPolicyError: string;
  hasRolloverAction: boolean;
  policyOptions: PolicyOption[];
  rolloverAlias: string;
  rolloverAliasError: string;
  hasSubmitted: boolean;
}

export default class ApplyPolicyModal extends Component<ApplyPolicyModalProps, ApplyPolicyModalState> {
  static contextType = CoreServicesContext;
  toasts = this.context.notifications.toasts;
  state: ApplyPolicyModalState = {
    isLoading: false,
    selectedPolicy: null,
    selectedPolicyError: "",
    hasRolloverAction: false,
    policyOptions: [],
    rolloverAlias: "",
    rolloverAliasError: "",
    hasSubmitted: false,
  };

  async componentDidMount(): Promise<void> {
    await this.onPolicySearchChange("");
  }

  onApplyPolicy = async (selectedPolicy: PolicyOption, hasRolloverAction: boolean, rolloverAlias: string): Promise<void> => {
    try {
      const {
        onClose,
        indices,
        services: { indexService },
      } = this.props;
      const policyId = selectedPolicy.label;
      const applyPolicyResponse = await indexService.applyPolicy(indices, policyId);
      if (applyPolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = applyPolicyResponse.response;
        if (updatedIndices) {
          this.context.notifications.toasts.addSuccess(`Applied policy to ${updatedIndices} indices`);
          if (hasRolloverAction && rolloverAlias && indices.length === 1) {
            await this.onEditRolloverAlias(indices[0], rolloverAlias);
          }
        }
        if (failures) {
          this.context.notifications.toasts.addDanger(
            `Failed to apply policy to ${failedIndices
              .map((failedIndex) => `[${failedIndex.indexName}, ${failedIndex.reason}]`)
              .join(", ")}`
          );
        }
        onClose();
      } else {
        this.context.notifications.toasts.addDanger(applyPolicyResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem adding policy to indices"));
    }
  };

  onEditRolloverAlias = async (index: string, rolloverAlias: string): Promise<void> => {
    const {
      services: { indexService },
    } = this.props;
    try {
      const response = await indexService.editRolloverAlias(index, rolloverAlias);
      if (response.ok) {
        if (response.response.acknowledged) {
          this.context.notifications.toasts.addSuccess(`Edited rollover alias on ${index}`);
        } else {
          this.context.notifications.toasts.addDanger(`Failed to edit rollover alias on ${index}`);
        }
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `There was a problem editing rollover alias on ${index}`));
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
          this.context.notifications.toasts.addDanger("You have not created a policy yet");
        } else {
          this.context.notifications.toasts.addDanger(searchPoliciesResponse.error);
        }
      }
    } catch (err) {
      // if (this.context != null) this.context.notifications.toasts.addDanger(err.message);
      this.toasts.addDanger(err.message);
    }

    this.setState({ isLoading: false });
  };

  onChangeSelectedPolicy = (selectedPolicies: PolicyOption[]): void => {
    const selectedPolicy = selectedPolicies.length ? selectedPolicies[0] : null;
    const hasRolloverAction = this.hasRolloverAction(selectedPolicy);
    this.setState({
      selectedPolicy,
      hasRolloverAction,
      selectedPolicyError: this.getSelectedPolicyError(selectedPolicy),
    });
  };

  onChangeRolloverAlias = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rolloverAlias = e.target.value;
    this.setState({
      rolloverAlias,
      rolloverAliasError: this.getRolloverAliasError(rolloverAlias),
    });
  };

  onSubmit = async (): Promise<void> => {
    const { selectedPolicy, rolloverAlias } = this.state;
    const selectedPolicyError = this.getSelectedPolicyError(selectedPolicy);
    const rolloverAliasError = this.getRolloverAliasError(rolloverAlias);
    const hasSubmitError = !!selectedPolicyError || !!rolloverAliasError;
    if (hasSubmitError) {
      this.setState({ selectedPolicyError, rolloverAliasError, hasSubmitted: true });
    } else {
      // @ts-ignore
      await this.onApplyPolicy(selectedPolicy, this.hasRolloverAction(selectedPolicy), rolloverAlias);
    }
  };

  getRolloverAliasError = (rolloverAlias: string): string => {
    const { hasRolloverAction } = this.state;
    const { indices } = this.props;
    const hasSingleIndexSelected = indices.length === 1;
    const requiresAlias = hasRolloverAction && hasSingleIndexSelected;
    const hasAliasError = requiresAlias && !rolloverAlias;
    return hasAliasError ? "Required" : "";
  };

  getSelectedPolicyError = (selectedPolicy: PolicyOption | null): string => (selectedPolicy ? "" : "You must select a policy");

  hasRolloverAction = (selectedPolicy: PolicyOption | null): boolean =>
    _.get(selectedPolicy, "policy.states", []).some((state: State) => state.actions.some((action) => action.hasOwnProperty("rollover")));

  renderRollover = (): React.ReactNode | null => {
    const { rolloverAlias, hasRolloverAction, rolloverAliasError, hasSubmitted } = this.state;
    const { indices } = this.props;
    const hasSingleIndexSelected = indices.length === 1;

    if (!hasRolloverAction) return null;

    if (hasSingleIndexSelected) {
      return (
        <EuiFormRow
          label="Rollover alias"
          helpText={
            <EuiText size="xs" grow={false}>
              <p>
                This policy includes a rollover action. Specify a rollover alias.{" "}
                <EuiLink href={DOCUMENTATION_URL} target="_blank">
                  Learn more <EuiIcon type="popout" size="s" />
                </EuiLink>
              </p>
            </EuiText>
          }
          isInvalid={hasSubmitted && !!rolloverAliasError}
          error={rolloverAliasError}
          fullWidth
        >
          <EuiFieldText
            isInvalid={hasSubmitted && !!rolloverAliasError}
            placeholder="Rollover alias"
            value={rolloverAlias}
            onChange={this.onChangeRolloverAlias}
            fullWidth
          />
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

  renderPreview = (): React.ReactNode | null => {
    const { selectedPolicy } = this.state;
    if (!selectedPolicy) return null;

    let policyString = "";
    try {
      policyString = JSON.stringify({ policy: selectedPolicy.policy }, null, 4);
    } catch (err) {
      console.error(err);
    }

    if (!policyString) {
      return null;
    }

    return (
      <Fragment>
        <EuiText size="xs" grow={false}>
          <p>
            <strong>Preview</strong>
          </p>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiCodeBlock language="json" fontSize="m" style={{ height: "200px" }}>
          {policyString}
        </EuiCodeBlock>
        <EuiSpacer size="m" />
      </Fragment>
    );
  };

  render() {
    const { policyOptions, selectedPolicy, selectedPolicyError, isLoading, hasSubmitted } = this.state;
    const { onClose } = this.props;
    const selectedOptions = selectedPolicy ? [selectedPolicy] : [];
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Apply policy</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiText size="xs" grow={false}>
              <p>
                Choose the policy you want to use for the selected indices. A copy of the policy will be created and applied to the indices.
              </p>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiFormRow label="Policy ID" isInvalid={hasSubmitted && !!selectedPolicyError} error={selectedPolicyError} fullWidth>
              <EuiComboBox
                placeholder="Search policies"
                async
                options={policyOptions}
                singleSelection={{ asPlainText: true }}
                selectedOptions={selectedOptions}
                isLoading={isLoading}
                isInvalid={hasSubmitted && !!selectedPolicyError}
                onChange={this.onChangeSelectedPolicy}
                onSearchChange={this.onPolicySearchChange}
                fullWidth
              />
            </EuiFormRow>
            {this.renderPreview()}
            {this.renderRollover()}
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={onClose} data-test-subj="applyPolicyModalCloseButton">
              Cancel
            </EuiButtonEmpty>

            <EuiButton onClick={this.onSubmit} fill data-test-subj="applyPolicyModalEditButton">
              Apply
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
