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

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty, EuiCallOut } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import RollupIndices from "../../component/RollupIndices";
import CreateRollupSteps from "../../component/CreateRollupSteps";
import DateHistogram from "../../component/DateHistogram";
import { DEFAULT_ROLLUP } from "../../utils/constants";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface CreateRollupState {
  rollupId: string;
  rollupIdError: string;
  jsonString: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  stateRadioIdSelected: string;
}

// export enum Radio {
//   Fixed = "fixed",
//   Calender = "calender",
// }

export default class CreateRollupStep2 extends Component<CreateRollupProps, CreateRollupState> {
  constructor(props: CreateRollupProps) {
    super(props);

    this.state = {
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      rollupId: "",
      rollupIdError: "",
      submitError: "",
      jsonString: "",
      isSubmitting: false,
      hasSubmitted: false,
      // stateRadioIdSelected: Radio.Fixed,
    };
  }

  //TODO: Figure out what to do with the DEFAULT_POLICY part.

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP_STEP2);
    this.setState({ jsonString: DEFAULT_ROLLUP });
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeStateRadio = (optionId: string): void => {
    this.setState({ stateRadioIdSelected: optionId });
  };

  onChangeJSON = (value: string): void => {
    this.setState({ jsonString: value });
  };

  onAutoIndent = (): void => {
    try {
      const parsedJSON = JSON.parse(this.state.jsonString);
      this.setState({ jsonString: JSON.stringify(parsedJSON, null, 4) });
    } catch (err) {
      // do nothing
    }
  };

  onNext = (): void => {
    this.props.history.push(ROUTES.CREATE_ROLLUP_STEP3);
  };

  render() {
    const {
      rollupId,
      rollupIdError,
      jsonString,
      submitError,
      isSubmitting,
      // stateRadioIdSelected
    } = this.state;
    // Will be used later on for DefineRollup job (similar to DefinePolicy)
    let hasJSONError = false;
    try {
      JSON.parse(jsonString);
    } catch (err) {
      hasJSONError = true;
    }

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <CreateRollupSteps step={2} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Histogram aggregation on a date</h1>
            </EuiTitle>
            <EuiSpacer />
            <DateHistogram
              rollupId={rollupId}
              rollupIdError={rollupIdError}
              onChange={this.onChange}
              // onChangeStateRadio={this.onChangeStateRadio}
              // stateRadioIdSelected={stateRadioIdSelected}
            />
            <EuiSpacer />
            <RollupIndices rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />
            {submitError && (
              <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
                <p>{submitError}</p>
              </EuiCallOut>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onNext} isLoading={isSubmitting} data-test-subj="createRollupStep2NextButton">
              Next
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
