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

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiComboBoxOptionOption } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import TimeAggregation from "../../components/TimeAggregations";
import AdvancedAggregation from "../../components/AdvancedAggregation";
import MetricsCalculation from "../../components/MetricsCalculation";
import { DimensionItem, FieldItem } from "../../../../../models/interfaces";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  currentStep: number;
  fields: FieldItem[];
  selectedTerms: FieldItem[];
  selectedDimensionField: DimensionItem[];
  timestamp: EuiComboBoxOptionOption<String>[];
  intervalValue: number;
  intervalType: string;
  timezone: string;
  timeunit: string;
  onChangeTimestamp: (selectedOptions: EuiComboBoxOptionOption<String>[]) => void;
  onChangeIntervalType: (optionId: string) => void;
  onChangeIntervalValue: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
}

interface CreateRollupState {
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default class CreateRollupStep2 extends Component<CreateRollupProps, CreateRollupState> {
  constructor(props: CreateRollupProps) {
    super(props);

    this.state = {
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    if (this.props.currentStep !== 2) return null;
    const { fields, timestamp } = this.props;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={2} />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Define aggregations and metrics</h1>
            </EuiTitle>
            <EuiSpacer />

            <TimeAggregation {...this.props} selectedTimestamp={timestamp} fieldsOption={fields} />
            <EuiSpacer />
            <AdvancedAggregation {...this.props} fieldsOption={fields} />
            <EuiSpacer />
            <MetricsCalculation {...this.props} fieldsOption={fields} />
            <EuiSpacer />
            <MetricsCalculation />
            {submitError && (
              <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
                <p>{submitError}</p>
              </EuiCallOut>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
