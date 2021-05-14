/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import React, { ChangeEvent, Component } from "react";
import { EMPTY_TRANSFORM } from "../../utils/constants";
import queryString from "query-string";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { EuiFlexItem, EuiFlexGroup, EuiButton, EuiTitle, EuiSpacer, EuiButtonEmpty } from "@elastic/eui";
import ConfigureTransform from "../../components/ConfigureTransform";
import Schedule from "../../components/Schedule";
import Indices from "../../components/Indices";
import moment from "moment";
import { Transform } from "../../../../../models/interfaces";

interface EditTransformProps extends RouteComponentProps {
  transformService: TransformService;
}

interface EditTransformState {
  id: string;
  error: string;
  seqNo: number | null;
  primaryTerm: number | null;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
  pageSize: number;
  enabled: boolean;
  transformJSON: any;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  interval: number;
  intervalError: string;
  intervalTimeUnit: string;
  cronExpression: string;
  cronTimeZone: string;
  schedule: string;
}

export default class EditTransform extends Component<EditTransformProps, EditTransformState> {
  static contextType = CoreServicesContext;

  constructor(props: EditTransformProps) {
    super(props);
    this.state = {
      id: "",
      error: "",
      seqNo: null,
      primaryTerm: null,
      description: "",
      sourceIndex: "",
      targetIndex: "",
      sourceIndexFilter: "",
      pageSize: 1000,
      enabled: true,
      transformJSON: EMPTY_TRANSFORM,
      isSubmitting: false,
      interval: 2,
      intervalError: "",
      intervalTimeUnit: "MINUTES",
      cronExpression: "",
      cronTimeZone: "UTC",
      schedule: "fixed",
      submitError: "",
      hasSubmitted: false,
    };
  }

  componentDidMount = async () => {
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string" && !!id) {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS, BREADCRUMBS.EDIT_TRANSFORM, { text: id }]);
      await this.getTransform(id);
    } else {
      this.context.notifications.toasts.addDanger(`Invalid transform id: ${id}`);
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  getTransform = async (transformId: string) => {
    try {
      const { transformService } = this.props;
      const response = await transformService.getTransform(transformId);

      if (response.ok) {
        let json = JSON.parse(this.state.transformJSON);
        json.transform = response.response.transform;

        this.setState({
          seqNo: response.response._seqNo,
          primaryTerm: response.response._primaryTerm,
          id: response.response._id,
          description: response.response.transform.description,
          sourceIndex: response.response.transform.source_index,
          targetIndex: response.response.transform.target_index,
          sourceIndexFilter: JSON.stringify(response.response.transform.data_selection_query),
          enabled: response.response.transform.enabled,
          pageSize: response.response.transform.page_size,
          transformJSON: json,
        });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load transform job ${transformId}: ${response.error}`);
        this.props.history.push(ROUTES.TRANSFORMS);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not load transform job ${transformId}`));
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  render() {
    const {
      id,
      error,
      pageSize,
      description,
      sourceIndex,
      targetIndex,
      sourceIndexFilter,
      isSubmitting,
      enabled,
      interval,
      intervalError,
      intervalTimeUnit,
      cronExpression,
      cronTimeZone,
      schedule,
    } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>Edit transform job</h1>
        </EuiTitle>
        <EuiSpacer />
        <ConfigureTransform
          inEdit={true}
          transformId={id}
          error={error}
          onChangeName={this.onNameChange}
          onChangeDescription={this.onDescriptionChange}
          description={description}
        />
        <EuiSpacer />
        <Indices
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          sourceIndexFilter={sourceIndexFilter}
        />
        <EuiSpacer />
        <Schedule
          transformId={id}
          pageSize={pageSize}
          schedule={schedule}
          error={error}
          enabled={enabled}
          interval={interval}
          intervalError={intervalError}
          intervalTimeUnit={intervalTimeUnit}
          cronExpression={cronExpression}
          cronTimeZone={cronTimeZone}
          onEnabledChange={this.onEnabledChange}
          onCronExpressionChange={this.onCronExpressionChange}
          onIntervalChange={this.onIntervalChange}
          onPageChange={this.onPageChange}
          onScheduleChange={this.onScheduleChange}
          onCronTimeZoneChange={this.onCronTimeZoneChange}
          onIntervalTimeUnitChange={this.onIntervalTimeUnitChange}
        />

        <EuiSpacer />

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="editTransformCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="editTransformSaveButton">
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  onCancel = () => {
    this.props.history.push(ROUTES.TRANSFORMS);
  };

  onSubmit = async (): Promise<void> => {
    const { id, transformJSON } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      this.updateSchedule();
      await this.update(id, transformJSON);
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Transform JSON");
      console.error(err);
    }
  };

  updateSchedule = () => {
    const { schedule, cronExpression, cronTimeZone, interval, intervalTimeUnit } = this.state;
    let json = this.state.transformJSON;
    if (schedule == "cron") {
      json.transform.schedule.cron = { expression: `${cronExpression}`, timezone: `${cronTimeZone}` };
      delete json.transform.schedule["interval"];
    } else {
      json.transform.schedule.interval = {
        start_time: moment().unix(),
        unit: intervalTimeUnit,
        period: interval,
      };
      delete json.transform.schedule["cron"];
    }

    this.setState({ transformJSON: json });
  };

  update = async (transformId: string, transform: Transform): Promise<void> => {
    try {
      const { transformService } = this.props;
      const { primaryTerm, seqNo } = this.state;
      if (primaryTerm == null || seqNo == null) {
        this.context.notifications.toasts.addDanger("Could not update transform without seqNo and primaryTerm");
        return;
      }
      const response = await transformService.putTransform(transform, transformId, seqNo, primaryTerm);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Changes to transform saved`);
        this.props.history.push(ROUTES.TRANSFORMS);
      } else {
        this.context.notifications.toasts.addDanger(`Couldn't update transform ${transformId}: ${response.error}`);
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, `Couldn't update transform ${transformId}`) });
    }
  };

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    // DO NOTHING SINCE edit is disabled for this page
  };

  onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    let json = this.state.transformJSON;
    json.transform.description = description;
    this.setState({ transformJSON: json, description: description });
  };

  onEnabledChange = () => {
    const enabled = this.state.enabled;
    let json = this.state.transformJSON;
    json.transform.enabled = enabled;
    this.setState({ transformJSON: json, enabled: !enabled });
  };

  onCronExpressionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ cronExpression: e.target.value });
  };

  onCronTimeZoneChange = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ cronTimeZone: e.target.value });
  };

  onIntervalChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ interval: e.target.valueAsNumber });
    if (e.target.value == "") {
      const intervalError = "Interval value is required.";
      this.setState({ intervalError: intervalError });
    } else {
      this.setState({ intervalError: "" });
    }
  };

  onPageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pageSize = e.target.valueAsNumber;
    let json = this.state.transformJSON;
    json.transform.pageSize = pageSize;
    this.setState({ pageSize: pageSize, transformJSON: json });
  };

  onScheduleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ schedule: e.target.value });
  };

  onIntervalTimeUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ intervalTimeUnit: e.target.value });
  };
}
