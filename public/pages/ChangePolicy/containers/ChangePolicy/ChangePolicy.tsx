/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { RouteComponentProps } from "react-router-dom";
import { EuiSpacer, EuiTitle, EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { CoreStart } from "kibana/public";
import { IndexService, ManagedIndexService } from "../../../../services";
import ChangeManagedIndices from "../../components/ChangeManagedIndices";
import NewPolicy from "../../components/NewPolicy";
import { BREADCRUMBS } from "../../../../utils/constants";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { PolicyOption } from "../../models/interfaces";

interface ChangePolicyProps extends RouteComponentProps {
  managedIndexService: ManagedIndexService;
  indexService: IndexService;
  core: CoreStart;
}

interface ChangePolicyState {
  selectedPolicies: PolicyOption[];
  selectedManagedIndices: { label: string; value?: ManagedIndexItem }[];
  selectedStateFilters: { label: string }[];
  stateSelected: string;
  stateRadioIdSelected: string;
  managedIndicesError: string;
  selectedPoliciesError: string;
  hasSubmitted: boolean;
}

export enum Radio {
  Current = "current",
  State = "state",
}

export default class ChangePolicy extends Component<ChangePolicyProps, ChangePolicyState> {
  state: ChangePolicyState = {
    selectedPolicies: [],
    selectedManagedIndices: [],
    selectedStateFilters: [],
    stateRadioIdSelected: Radio.Current,
    stateSelected: "",
    managedIndicesError: "",
    selectedPoliciesError: "",
    hasSubmitted: false,
  };

  async componentDidMount(): Promise<void> {
    this.props.core.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.MANAGED_INDICES, BREADCRUMBS.CHANGE_POLICY]);
  }

  onChangeSelectedPolicy = (selectedPolicies: PolicyOption[]): void => {
    // reset the selected state and radio whenever we select a new policy
    const selectedPoliciesError = selectedPolicies.length ? "" : "Required";
    this.setState({ selectedPolicies, selectedPoliciesError, stateSelected: "", stateRadioIdSelected: Radio.Current });
  };

  onChangeManagedIndices = (selectedManagedIndices: { label: string; value?: ManagedIndexItem }[]): void => {
    const managedIndicesError = selectedManagedIndices.length ? "" : "Required";
    if (!selectedManagedIndices.length) {
      this.onChangeStateFilters([]);
    }
    this.setState({ selectedManagedIndices, managedIndicesError });
  };

  onChangeStateFilters = (selectedStateFilters: { label: string }[]): void => {
    this.setState({ selectedStateFilters });
  };

  onChangeStateRadio = (optionId: string): void => {
    this.setState({ stateRadioIdSelected: optionId });
  };

  onStateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ stateSelected: e.target.value });
  };

  onChangePolicy = async () => {
    try {
      const { managedIndexService } = this.props;
      const { selectedPolicies, selectedManagedIndices, selectedStateFilters, stateRadioIdSelected, stateSelected } = this.state;

      if (!selectedManagedIndices.length || !selectedPolicies.length) return;

      const indices = selectedManagedIndices.map(
        (selectedManagedIndex: { label: string; value?: ManagedIndexItem }) => selectedManagedIndex.label
      );
      const policyId = selectedPolicies[0].label;
      const state = stateRadioIdSelected === Radio.State ? stateSelected : null;
      const include = selectedStateFilters.map((selectedStateFilter: { label: string }) => ({ state: selectedStateFilter.label }));

      const changePolicyResponse = await managedIndexService.changePolicy(indices, policyId, state, include);

      if (changePolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = changePolicyResponse.response;
        if (updatedIndices) {
          this.props.core.notifications.toasts.addSuccess(`Changed policy on ${updatedIndices} indices`);
        }
        if (failures) {
          this.props.core.notifications.toasts.addDanger(
            `Failed to change policy on ${failedIndices
              .map((failedIndex) => `[${failedIndex.indexName}, ${failedIndex.reason}]`)
              .join(", ")}`
          );
        }
      } else {
        this.props.core.notifications.toasts.addDanger(changePolicyResponse.error);
      }
    } catch (err) {
      this.props.core.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem changing policy"));
    }
  };

  onSubmit = async () => {
    const { selectedPolicies, selectedManagedIndices } = this.state;

    const managedIndicesError = selectedManagedIndices.length ? "" : "Required";
    const selectedPoliciesError = selectedPolicies.length ? "" : "Required";

    this.setState({ managedIndicesError, selectedPoliciesError, hasSubmitted: true });
    if (selectedManagedIndices.length && selectedPolicies.length) {
      await this.onChangePolicy();
    }
  };

  render() {
    const { indexService, managedIndexService } = this.props;
    const {
      selectedPolicies,
      selectedManagedIndices,
      selectedStateFilters,
      stateRadioIdSelected,
      stateSelected,
      managedIndicesError,
      selectedPoliciesError,
      hasSubmitted,
    } = this.state;

    return (
      <div style={{ padding: "0px 25px" }}>
        <EuiTitle size="l">
          <h1>Change policy</h1>
        </EuiTitle>

        <EuiSpacer />

        <ChangeManagedIndices
          {...this.props}
          managedIndexService={managedIndexService}
          selectedManagedIndices={selectedManagedIndices}
          selectedStateFilters={selectedStateFilters}
          onChangeManagedIndices={this.onChangeManagedIndices}
          onChangeStateFilters={this.onChangeStateFilters}
          managedIndicesError={hasSubmitted ? managedIndicesError : ""}
        />

        <EuiSpacer />

        <NewPolicy
          {...this.props}
          indexService={indexService}
          selectedPolicies={selectedPolicies}
          stateRadioIdSelected={stateRadioIdSelected}
          stateSelected={stateSelected}
          onChangePolicy={this.onChangeSelectedPolicy}
          onChangeStateRadio={this.onChangeStateRadio}
          onStateSelectChange={this.onStateSelectChange}
          selectedPoliciesError={hasSubmitted ? selectedPoliciesError : ""}
        />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} data-test-subj="changePolicyChangeButton">
              Change
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
