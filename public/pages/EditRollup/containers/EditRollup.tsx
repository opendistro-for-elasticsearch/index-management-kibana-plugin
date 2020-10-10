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
import { RouteComponentProps } from "react-router-dom";
import { EuiFlexItem, EuiFlexGroup, EuiButton, EuiTitle, EuiSpacer, EuiButtonEmpty, EuiComboBoxOptionOption } from "@elastic/eui";
import { RollupService } from "../../../../services";
import ConfigureRollup from "../../CreateRollup/components/ConfigureRollup";
import Roles from "../../CreateRollup/components/Roles";
import Schedule from "../../CreateRollup/components/Schedule";
import { DEFAULT_ROLLUP } from "../../CreateRollup/utils/constants";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { getErrorMessage } from "../../../utils/helpers";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { Rollup } from "../../../../models/interfaces";

interface EditRollupProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface EditRollupState {
  rollupId: string;
  rollupIdError: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  description: string;
  roles: EuiComboBoxOptionOption<String>[];
  rollupJSON: any;
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

export default class EditRollup extends Component<EditRollupProps, EditRollupState> {
  //TODO: Get actual rollupId etc. here
  constructor(props: EditRollupProps) {
    super(props);
    this.state = {
      rollupId: "",
      rollupIdError: "",
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      description: "",
      roles: [],
      rollupJSON: `{"rollup":{}}`,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    const { id } = queryString.parse(this.props.location.search);
    console.log(id);
    if (typeof id === "string" && !!id) {
      chrome.breadcrumbs.push(BREADCRUMBS.EDIT_ROLLUP);
      chrome.breadcrumbs.push({ text: id });

      await this.getRollupToEdit(id);
    } else {
      toastNotifications.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  getRollupToEdit = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);

      if (response.ok) {
        let newJSON = JSON.parse(this.state.rollupJSON);
        newJSON.rollup = response.response.rollup;
        this.setState({
          rollupSeqNo: response.response.seqNo,
          rollupPrimaryTerm: response.response.primaryTerm,
          rollupId: response.response.id,
          description: response.response.rollup.description,
          rollupJSON: newJSON,
        });
      } else {
        toastNotifications.addDanger(`Could not load the rollup job: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
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
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.description = description;
    this.setState({ description: description, rollupJSON: newJSON });
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
    const { rollupId, rollupJSON } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        //TODO: Build JSON string here
        // const rollup = JSON.parse(rollupJSON);
        await this.onUpdate(rollupId, rollupJSON);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Rollup JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  onUpdate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const { rollupPrimaryTerm, rollupSeqNo } = this.state;
      if (rollupSeqNo == null || rollupPrimaryTerm == null) {
        toastNotifications.addDanger("Could not update rollup without seqNo and primaryTerm");
        return;
      }
      const response = await rollupService.putRollup(rollup, rollupId, rollupSeqNo, rollupPrimaryTerm);
      if (response.ok) {
        console.log("Submit success.");
        toastNotifications.addSuccess(`Updated rollup: ${response.response._id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem updating the rollup") });
    }
  };

  render() {
    const { rollupId, rollupIdError, submitError, isSubmitting, hasSubmitted, roles, description, rollupJSON } = this.state;
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
