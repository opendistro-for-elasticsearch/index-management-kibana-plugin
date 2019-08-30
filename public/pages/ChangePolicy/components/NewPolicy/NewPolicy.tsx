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
import _ from "lodash";
import { EuiSpacer, EuiText, EuiRadioGroup, EuiFormRow, EuiSelect, EuiComboBox } from "@elastic/eui";
import { toastNotifications } from "ui/notify";
import { ContentPanel } from "../../../../components/ContentPanel";
import { IndexService } from "../../../../services";
import { Radio } from "../../containers/ChangePolicy/ChangePolicy";
import { Policy } from "../../../../../models/interfaces";
import { PolicyOption } from "../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";

interface NewPolicyProps {
  indexService: IndexService;
  selectedPolicies: PolicyOption[];
  stateRadioIdSelected: string;
  stateSelected: string;
  onChangePolicy: (selectedPolicies: PolicyOption[]) => void;
  onChangeStateRadio: (optionId: string) => void;
  onStateSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface NewPolicyState {
  stateOptions: { value: string; text: string }[];
  policiesIsLoading: boolean;
  policies: PolicyOption[];
}

export default class NewPolicy extends React.Component<NewPolicyProps, NewPolicyState> {
  state = {
    stateOptions: [],
    policiesIsLoading: false,
    policies: [],
  };

  async componentDidMount(): Promise<void> {
    await this.onPolicySearchChange("");
  }

  onPolicySearchChange = async (searchValue: string): Promise<void> => {
    const { indexService } = this.props;
    this.setState({ policiesIsLoading: true, policies: [] });
    try {
      const searchPoliciesResponse = await indexService.searchPolicies(searchValue, true);
      if (searchPoliciesResponse.ok) {
        const policies = searchPoliciesResponse.response.hits.hits.map((hit: { _id: string; _source: { policy: Policy } }) => ({
          label: hit._id,
          value: hit._source.policy,
        }));
        this.setState({ policies });
      } else {
        if (searchPoliciesResponse.error.startsWith("[index_not_found_exception]")) {
          toastNotifications.addDanger("You have not created a policy yet");
        } else {
          toastNotifications.addDanger(searchPoliciesResponse.error);
        }
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem searching policies"));
    }

    this.setState({ policiesIsLoading: false });
  };

  render() {
    const { selectedPolicies, stateRadioIdSelected, stateSelected } = this.props;
    const { policies, policiesIsLoading } = this.state;

    const hasSelectedPolicy = !!selectedPolicies.length;
    const stateOptions = _.flatten(
      selectedPolicies.map((selectedPolicy: PolicyOption) =>
        selectedPolicy.value.states.map(state => ({ value: state.name, text: state.name }))
      )
    );

    const currentRadio = { id: Radio.Current, label: "Continue from current state" };
    const stateRadio = { id: Radio.State, label: "Start from a chosen state after changing policies", disabled: !hasSelectedPolicy };
    const radioOptions = [currentRadio, stateRadio];
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="New policy" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiText size="xs">
            <p>Select a new policy. Choose between switching to a new state after changing policies or staying in the current state.</p>
          </EuiText>

          <EuiSpacer size="s" />

          <EuiFormRow label="Policy">
            <EuiComboBox
              placeholder="Choose a policy"
              async
              options={policies}
              singleSelection={{ asPlainText: true }}
              selectedOptions={selectedPolicies}
              isLoading={policiesIsLoading}
              // @ts-ignore
              onChange={this.props.onChangePolicy}
              onSearchChange={this.onPolicySearchChange}
            />
          </EuiFormRow>

          <EuiRadioGroup options={radioOptions} idSelected={stateRadioIdSelected} onChange={this.props.onChangeStateRadio} />

          <EuiSpacer size="s" />

          <EuiFormRow label="Start state" helpText="Select a state to start from after changing policies">
            <EuiSelect
              disabled={stateRadioIdSelected !== Radio.State}
              options={stateOptions}
              value={stateSelected}
              onChange={this.props.onStateSelectChange}
              aria-label="Start state for new policy"
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    );
  }
}
