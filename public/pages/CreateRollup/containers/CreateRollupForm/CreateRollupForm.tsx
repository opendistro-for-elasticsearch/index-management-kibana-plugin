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
import { EuiButton, EuiButtonEmpty, EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import CreateRollup from "../CreateRollup";
import CreateRollupStep2 from "../CreateRollupStep2";
import { toastNotifications } from "ui/notify";
import { IndexItem, Rollup } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_ROLLUP } from "../../utils/constants";
import CreateRollupStep3 from "../CreateRollupStep3";
import CreateRollupStep4 from "../CreateRollupStep4";
import { DimensionItem, FieldItem, MetricItem } from "../../models/interfaces";
import moment from "moment";

interface CreateRollupFormProps extends RouteComponentProps {
  rollupService: RollupService;
  indexService: IndexService;
}

interface CreateRollupFormState {
  currentStep: number;
  rollupId: string;
  rollupIdError: string;
  rollupSeqNo: number | null;
  rollupPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  loadingIndices: boolean;
  indices: ManagedCatIndex[];
  totalIndices: number;

  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;

  mappings: any;
  fields: any;
  selectedTerms: FieldItem[];
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
  metricError: string;
  timestamp: EuiComboBoxOptionOption<String>[];
  timestampError: string;
  intervalType: string;
  intervalValue: number;
  timezone: string;
  timeunit: string;
  selectedFields: FieldItem[];
  jobEnabledByDefault: boolean;

  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalError: string;
  intervalTimeunit: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  rollupJSON: any;
}

export default class CreateRollupForm extends Component<CreateRollupFormProps, CreateRollupFormState> {
  constructor(props: CreateRollupFormProps) {
    super(props);

    this.state = {
      currentStep: 1,
      rollupSeqNo: null,
      rollupPrimaryTerm: null,
      rollupId: "",
      rollupIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      loadingIndices: true,
      indices: [],
      totalIndices: 0,

      mappings: "",
      fields: undefined,
      selectedFields: [],
      selectedTerms: [],
      selectedDimensionField: [],
      selectedMetrics: [],
      metricError: "",
      description: "",
      sourceIndex: [],
      sourceIndexError: "",
      targetIndex: [],
      targetIndexError: "",

      timestamp: [],
      timestampError: "",
      intervalType: "fixed",
      intervalValue: 1,
      intervalError: "",
      timezone: "Africa/Abidjan",
      timeunit: "ms",

      jobEnabledByDefault: false,
      recurringJob: "no",
      recurringDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      cronTimezone: "Africa/Abidjan",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: JSON.parse(EMPTY_ROLLUP),
    };
    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    chrome.breadcrumbs.push(BREADCRUMBS.CREATE_ROLLUP);
    await this.getMappings();
  };

  //TODO: Try to get only the mapping of specified source index instead of all indices. And maybe get mappings after selecting src index
  getMappings = async (): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const { sourceIndex } = this.state;
      //TODO: modify this to actual src index when onChangeSourceIndex is called.
      const response = await rollupService.getMappings("kibana_sample_data_flights");
      if (response.ok) {
        //Set mapping when there is source index selected.
        this.setState({
          mappings: response.response,
          fields: sourceIndex.length ? response.response[sourceIndex[0].label].mappings.properties : undefined,
        });
      } else {
        toastNotifications.addDanger(`Could not load fields: ${response.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load fields"));
    }
  };

  //TODO: Add error when no method is selected in metrics (step 2)
  _next() {
    let currentStep = this.state.currentStep;
    let error = false;
    //Verification here
    if (currentStep == 1) {
      const { rollupId, sourceIndex, targetIndex } = this.state;

      if (!rollupId) {
        this.setState({ submitError: "Job name is required.", rollupIdError: "Job name is required." });
        error = true;
      }
      if (sourceIndex.length == 0) {
        this.setState({ submitError: "Source index is required.", sourceIndexError: "Source index is required." });
        error = true;
      }
      if (targetIndex.length == 0) {
        this.setState({ submitError: "Target index is required.", targetIndexError: "Target index is required." });
        error = true;
      }
    } else if (currentStep == 2) {
      const { timestamp, selectedMetrics } = this.state;
      if (timestamp.length == 0) {
        this.setState({ submitError: "Timestamp is required.", timestampError: "Timestamp is required." });
        error = true;
      }
      if (selectedMetrics.length != 0) {
        //Check if there's any metric item with no method selected.
        //TODO: Could Probably store all invalid fields in an array and highlight them in table.
        selectedMetrics.map((metric) => {
          if (!(metric.min || metric.max || metric.sum || metric.avg || metric.value_count)) {
            const errorMsg = "Must specify at least one metric to aggregate on for: " + metric.source_field.label;
            this.setState({ submitError: errorMsg, metricError: errorMsg });
            error = true;
          }
        });
        //If nothing invalid found, clear error.
        if (!error) this.setState({ metricError: "" });
      }
    } else if (currentStep == 3) {
      //Check if interval is a valid value and is specified.
      const { intervalError, recurringDefinition } = this.state;
      if (recurringDefinition == "fixed") {
        if (intervalError != "") {
          const intervalErrorMsg = "Interval value is required.";
          this.setState({ submitError: intervalErrorMsg, intervalError: intervalErrorMsg });
          error = true;
        }
      }
    }

    if (error) return;

    currentStep = currentStep >= 3 ? 4 : currentStep + 1;

    this.setState({
      submitError: "",
      currentStep: currentStep,
    });
  }

  _prev() {
    let currentStep = this.state.currentStep;
    // If the current step is 2 or 3, then subtract one on "previous" button click
    currentStep = currentStep <= 1 ? 1 : currentStep - 1;
    this.setState({
      currentStep: currentStep,
    });
  }

  onChangeStep = (step: number): void => {
    if (step > 3) return;
    this.setState({
      currentStep: step,
    });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.description = description;
    this.setState({ description: description, rollupJSON: newJSON });
    console.log(this.state);
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const rollupId = e.target.value;
    this.setState({ rollupId, rollupIdError: rollupId ? "" : "Name is required" });
  };

  onChangeSourceIndex = (options: EuiComboBoxOptionOption<IndexItem>[]): void => {
    const { mappings } = this.state;
    //Try to get label text from option from the only array element in options, if exists
    let newJSON = this.state.rollupJSON;
    let sourceIndex = options.map(function (option) {
      return option.label;
    });
    const sourceIndexError = sourceIndex.length ? "" : "Source index is required";
    const srcIndexText = sourceIndex.length ? sourceIndex[0] : "";
    newJSON.rollup.source_index = srcIndexText;
    this.setState({ sourceIndex: options, rollupJSON: newJSON, sourceIndexError: sourceIndexError });
    this.setState({
      fields: sourceIndex.length ? mappings[srcIndexText].mappings.properties : undefined,
      selectedDimensionField: [],
      selectedMetrics: [],
    });
  };

  onChangeTargetIndex = (options: EuiComboBoxOptionOption<IndexItem>[]): void => {
    //Try to get label text from option from the only array element in options, if exists
    let newJSON = this.state.rollupJSON;
    let targetIndex = options.map(function (option) {
      return option.label;
    });
    const targetIndexError = targetIndex.length ? "" : "Target index is required";

    newJSON.rollup.target_index = targetIndex[0];
    this.setState({ targetIndex: options, rollupJSON: newJSON, targetIndexError: targetIndexError });
  };

  onChangeIntervalType = (optionId: string): void => {
    this.setState({ intervalType: optionId });
  };

  onChangeIntervalValue = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ intervalValue: e.target.valueAsNumber });
  };

  onChangeTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ timeunit: e.target.value });
  };

  setDateHistogram = (): void => {
    const { intervalType, intervalValue, timeunit } = this.state;
    let newJSON = this.state.rollupJSON;
    if (intervalType == "calendar") {
      newJSON.rollup.dimensions[0].date_histogram.calendar_interval = `1${timeunit}`;
      delete newJSON.rollup.dimensions[0].date_histogram["fixed_interval"];
    } else {
      newJSON.rollup.dimensions[0].date_histogram.fixed_interval = `${intervalValue}${timeunit}`;
      delete newJSON.rollup.dimensions[0].date_histogram["calendar_interval"];
    }
    this.setState({ rollupJSON: newJSON });
  };

  onChangeTimestamp = (selectedOptions: EuiComboBoxOptionOption<String>[]): void => {
    let newJSON = this.state.rollupJSON;
    const timestamp = selectedOptions.map(function (option) {
      return option.label;
    });

    const timestampError = timestamp.length ? "" : "Timestamp is required.";

    newJSON.rollup.dimensions[0].date_histogram.source_field = timestamp.length ? timestamp[0] : "";
    this.setState({ timestamp: selectedOptions, rollupJSON: newJSON, timestampError: timestampError });
  };

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.dimensions[0].date_histogram.timezone = e.target.value;
    this.setState({ timezone: e.target.value, rollupJSON: newJSON });
  };

  onDimensionSelectionChange = (selectedFields: DimensionItem[]): void => {
    this.setState({ selectedDimensionField: selectedFields });
  };

  onMetricSelectionChange = (selectedFields: MetricItem[]): void => {
    this.setState({ selectedMetrics: selectedFields });
  };

  onChangeJobEnabledByDefault = (): void => {
    const checked = this.state.jobEnabledByDefault;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.enabled = !checked;
    this.setState({ jobEnabledByDefault: !checked, rollupJSON: newJSON });
  };

  onChangeCron = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    let newJSON = this.state.rollupJSON;
    this.setState({ cronExpression: e.target.value, rollupJSON: newJSON });
  };

  onChangeCronTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ cronTimezone: e.target.value });
  };

  //TODO: Figure out the correct format of delay time, do we need to convert the value along with timeunit?
  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.delay = e.target.valueAsNumber ? e.target.value : 0;
    this.setState({ delayTime: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  onChangeIntervalTime = (e: ChangeEvent<HTMLInputElement>): void => {
    const interval = e.target.value;
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.schedule.interval.period = e.target.value;
    this.setState({ interval: e.target.valueAsNumber, rollupJSON: newJSON });
    if (interval == "") {
      const intervalErrorMsg = "Interval value is required.";
      this.setState({ submitError: intervalErrorMsg, intervalError: intervalErrorMsg });
    } else {
      this.setState({ intervalError: "" });
    }
  };

  onChangePage = (e: ChangeEvent<HTMLInputElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.page_size = e.target.valueAsNumber;
    this.setState({ pageSize: e.target.valueAsNumber, rollupJSON: newJSON });
  };

  //Trying to clear interval field when cron expression is defined,and bring back value when switched back
  onChangeRecurringDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ recurringDefinition: e.target.value });
  };

  updateSchedule = (): void => {
    const { recurringDefinition, cronExpression, interval, intervalTimeunit, cronTimezone } = this.state;
    let newJSON = this.state.rollupJSON;
    if (recurringDefinition == "cron") {
      newJSON.rollup.schedule.cron = { expression: `${cronExpression}`, timezone: `${cronTimezone}` };
      delete newJSON.rollup.schedule["interval"];
    } else {
      newJSON.rollup.schedule.interval = { start_time: moment().unix(), unit: `${intervalTimeunit}`, period: `${interval}` };
      // delete newJSON.rollup.schedule["cron"];
    }
    this.setState({ rollupJSON: newJSON });
  };

  onChangeRecurringJob = (optionId: string): void => {
    let newJSON = this.state.rollupJSON;
    s;
    newJSON.rollup.continuous = optionId == "yes";
    this.setState({ recurringJob: optionId, rollupJSON: newJSON });
  };

  //Update delay field in JSON if delay value is defined.
  onChangeDelayTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.schedule.interval.unit = e.target.value;
    this.setState({ intervalTimeunit: e.target.value, rollupJSON: newJSON });
  };

  updateDimension = (): void => {
    const { rollupJSON, selectedDimensionField } = this.state;
    let newJSON = rollupJSON;
    //Push rest of dimensions
    selectedDimensionField.map((dimension) => {
      if (dimension.aggregationMethod == "terms") {
        newJSON.rollup.dimensions.push({
          terms: {
            source_field: dimension.field.label,
          },
        });
      } else {
        newJSON.rollup.dimensions.push({
          histogram: {
            source_field: dimension.field.label,
            interval: dimension.interval,
          },
        });
      }
    });
    this.setState({ rollupJSON: newJSON });
  };

  updateMetric = (): void => {
    const { rollupJSON, selectedMetrics } = this.state;
    let newJSON = rollupJSON;
    //Push all metrics
    selectedMetrics.map((metric) => {
      const metrics = [];
      if (metric.min) metrics.push({ min: {} });
      if (metric.max) metrics.push({ max: {} });
      if (metric.sum) metrics.push({ sum: {} });
      if (metric.avg) metrics.push({ avg: {} });
      if (metric.value_count) metrics.push({ value_count: {} });
      newJSON.rollup.metrics.push({
        source_field: metric.source_field.label,
        metrics: metrics,
      });
    });
    this.setState({ rollupJSON: newJSON });
  };

  //TODO: Complete submit logistic
  onSubmit = async (): Promise<void> => {
    const { rollupId, rollupJSON } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!rollupId) {
        this.setState({ rollupIdError: "Required" });
      } else {
        this.setDateHistogram();
        this.updateDimension();
        this.updateMetric();
        this.updateSchedule();
        await this.onCreate(rollupId, rollupJSON);
      }
    } catch (err) {
      toastNotifications.addDanger("Invalid Rollup JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  onCreate = async (rollupId: string, rollup: Rollup): Promise<void> => {
    const { rollupService } = this.props;
    try {
      const response = await rollupService.putRollup(rollup, rollupId);
      if (response.ok) {
        toastNotifications.addSuccess(`Created rollup: ${response.response._id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
        toastNotifications.addDanger(`Failed to create rollup: ${response.error}`);
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the rollup job") });
      toastNotifications.addDanger(`Failed to create rollup: ${getErrorMessage(err, "There was a problem creating the rollup job")}`);
    }
  };

  render() {
    const {
      rollupId,
      rollupIdError,
      submitError,
      isSubmitting,
      hasSubmitted,
      description,
      sourceIndex,
      sourceIndexError,
      targetIndex,
      targetIndexError,
      currentStep,

      timestamp,
      timestampError,
      fields,
      selectedTerms,
      selectedDimensionField,
      selectedMetrics,
      metricError,
      intervalValue,
      intervalType,
      timezone,
      timeunit,

      jobEnabledByDefault,
      recurringJob,
      recurringDefinition,
      interval,
      intervalTimeunit,
      intervalError,
      cronExpression,
      cronTimezone,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <CreateRollup
          {...this.props}
          rollupId={rollupId}
          rollupIdError={rollupIdError}
          submitError={submitError}
          isSubmitting={isSubmitting}
          hasSubmitted={hasSubmitted}
          description={description}
          sourceIndex={sourceIndex}
          sourceIndexError={sourceIndexError}
          targetIndex={targetIndex}
          targetIndexError={targetIndexError}
          onChangeName={this.onChangeName}
          onChangeDescription={this.onChangeDescription}
          onChangeSourceIndex={this.onChangeSourceIndex}
          onChangeTargetIndex={this.onChangeTargetIndex}
          currentStep={this.state.currentStep}
          hasAggregation={selectedDimensionField.length != 0 || selectedMetrics.length != 0}
        />
        <CreateRollupStep2
          {...this.props}
          currentStep={this.state.currentStep}
          fields={fields}
          selectedTerms={selectedTerms}
          selectedDimensionField={selectedDimensionField}
          selectedMetrics={selectedMetrics}
          metricError={metricError}
          intervalType={intervalType}
          intervalValue={intervalValue}
          timestamp={timestamp}
          timestampError={timestampError}
          timeunit={timeunit}
          timezone={timezone}
          onChangeIntervalType={this.onChangeIntervalType}
          onChangeIntervalValue={this.onChangeIntervalValue}
          onChangeTimestamp={this.onChangeTimestamp}
          onChangeTimeunit={this.onChangeTimeunit}
          onChangeTimezone={this.onChangeTimezone}
          onDimensionSelectionChange={this.onDimensionSelectionChange}
          onMetricSelectionChange={this.onMetricSelectionChange}
        />
        <CreateRollupStep3
          {...this.props}
          currentStep={this.state.currentStep}
          jobEnabledByDefault={jobEnabledByDefault}
          recurringJob={recurringJob}
          recurringDefinition={recurringDefinition}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          intervalError={intervalError}
          cronExpression={cronExpression}
          cronTimezone={cronTimezone}
          pageSize={pageSize}
          delayTime={delayTime}
          delayTimeunit={delayTimeunit}
          onChangeJobEnabledByDefault={this.onChangeJobEnabledByDefault}
          onChangeCron={this.onChangeCron}
          onChangeCronTimezone={this.onChangeCronTimezone}
          onChangeDelayTime={this.onChangeDelayTime}
          onChangeIntervalTime={this.onChangeIntervalTime}
          onChangePage={this.onChangePage}
          onChangeRecurringDefinition={this.onChangeRecurringDefinition}
          onChangeRecurringJob={this.onChangeRecurringJob}
          onChangeDelayTimeunit={this.onChangeDelayTimeunit}
          onChangeIntervalTimeunit={this.onChangeIntervalTimeunit}
        />
        <CreateRollupStep4
          {...this.props}
          rollupId={rollupId}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          intervalType={intervalType}
          intervalValue={intervalValue}
          timestamp={timestamp}
          timeunit={timeunit}
          timezone={timezone}
          selectedDimensionField={selectedDimensionField}
          selectedMetrics={selectedMetrics}
          jobEnabledByDefault={jobEnabledByDefault}
          recurringJob={recurringJob}
          recurringDefinition={recurringDefinition}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          cronExpression={cronExpression}
          cronTimezone={cronTimezone}
          pageSize={pageSize}
          delayTime={delayTime}
          delayTimeunit={delayTimeunit}
          currentStep={this.state.currentStep}
          onChangeStep={this.onChangeStep}
          submitError={submitError}
        />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd" style={{ padding: "5px 50px" }}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createRollupCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          {currentStep != 1 && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this._prev} isLoading={isSubmitting} data-test-subj="createRollupPreviousButton">
                {"Previous"}
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep == 4 ? (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createRollupSubmitButton">
                {"Create"}
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this._next} isLoading={isSubmitting} data-test-subj="createRollupNextButton">
                {"Next"}
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
