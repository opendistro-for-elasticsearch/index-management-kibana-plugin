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
import _ from "lodash";
import chrome from "ui/chrome";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { RouteComponentProps } from "react-router-dom";
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiButton,
  EuiTitle,
  EuiSpacer,
  EuiCallOut,
  EuiButtonEmpty,
  EuiComboBoxOptionOption,
} from "@elastic/eui";
import { RollupService } from "../../../../services";
import { RollupItem } from "../../models/interfaces";
import CreateRollupSteps from "../../CreateRollup/components/CreateRollupSteps";
import ConfigureRollup from "../../CreateRollup/components/ConfigureRollup";
import Roles from "../../CreateRollup/components/Roles";
import Schedule from "../../CreateRollup/components/Schedule";
import { DEFAULT_ROLLUP } from "../../CreateRollup/utils/constants";
import { toastNotifications } from "ui/notify";

interface EditRollupProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface EditRollupState {
  rollupId: string;
  rollupIdError: string;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  roles: EuiComboBoxOptionOption<String>[];
}

//TODO: Fetch actual roles from backend
const options: EuiComboBoxOptionOption<String>[] = [
  {
    label: "Role1",
  },
  {
    label: "Role2",
  },
  {
    label: "Role3",
  },
];

let SampleGetRollupJobs: RollupItem[] = [
  {
    id: "rollup-job-1",
    seqNo: 1,
    primaryTerm: 1,
    rollup: {
      source_index: "stats-*",
      target_index: "rollup-stats",
      schedule: {
        interval: {
          period: 1,
          unit: "Days",
        },
      },
      run_as_user: "dbbaughe",
      roles: ["admin"],
      description: "Rolls up our daily indices into monthly summarized views",
      enabled: true,
      error_notification: {
        destination: { slack: { url: "..." } },
        message_template: { source: "..." },
      },
      page_size: 200,
      delay: "6h",
      dimensions: {
        date_histogram: {
          field: "timestamp",
          fixed_interval: "30d",
          timezone: "America/Los_Angeles",
        },
        terms: {
          fields: ["customer_city"],
        },
      },
      metrics: [
        {
          field: "price",
          metric_aggregations: ["avg", "min", "max", "sum"],
        },
      ],
    },
  },
  {
    id: "rollup-job-2",
    seqNo: 2,
    primaryTerm: 2,
    rollup: {
      source_index: "Pricehistory",
      target_index: "All-history",
      schedule: {
        interval: {
          period: 1,
          unit: "Days",
        },
      },
      run_as_user: "dbbaughe",
      roles: ["admin"],
      description: "Rolls up our daily indices into monthly summarized views",
      enabled: false,
      error_notification: {
        destination: { slack: { url: "..." } },
        message_template: { source: "..." },
      },
      page_size: 200,
      delay: "6h",
      dimensions: {
        date_histogram: {
          field: "timestamp",
          fixed_interval: "30d",
          timezone: "America/Los_Angeles",
        },
        terms: {
          fields: ["customer_city"],
        },
      },
      metrics: [
        {
          field: "price",
          metric_aggregations: ["avg", "min", "max", "sum"],
        },
      ],
    },
  },
];

export default class EditRollup extends Component<EditRollupProps, EditRollupState> {
  //TODO: Get actual rollupId etc. here
  constructor(props: EditRollupProps) {
    super(props);
    this.state = {
      rollupId: "",
      rollupIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      description: "",
      roles: [],
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.EDIT_ROLLUP);
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

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    this.setState({ description });
    console.log(this.state);
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const rollupId = e.target.value;
    if (hasSubmitted) this.setState({ rollupId, rollupIdError: rollupId ? "" : "Required" });
    else this.setState({ rollupId });
  };

  onChangeRoles = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    this.setState({ roles: selectedOptions });
  };

  onSubmit = async (): Promise<void> => {
    const { rollupId } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //TODO: Build JSON string here
        const rollup = DEFAULT_ROLLUP;
        // await this.onCreate(rollupId, rollup);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const { rollupId, rollupIdError, submitError, isSubmitting, hasSubmitted, roles, description } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>Edit rollup job</h1>
        </EuiTitle>
        <EuiSpacer />
        <ConfigureRollup
          rollupId={rollupId}
          rollupIdError={rollupIdError}
          onChangeDescription={this.onChangeDescription}
          description={description}
          onChange={this.onChange}
        />
        <EuiSpacer />

        <Roles rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChangeRoles} roleOptions={options} roles={roles} />
        <EuiSpacer />
        <Schedule rollupId={rollupId} rollupIdError={rollupIdError} onChange={this.onChange} />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="editRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="editRollupSaveChangesButton">
              {"Save changes"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
