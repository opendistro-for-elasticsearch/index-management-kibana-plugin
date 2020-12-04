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
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "kibana/public";
import moment from "moment";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import CreateRollup from "../CreateRollup";
import CreateRollupStep2 from "../CreateRollupStep2";
import { DimensionItem, FieldItem, IndexItem, MetricItem, Rollup } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_ROLLUP } from "../../utils/constants";
import CreateRollupStep3 from "../CreateRollupStep3";
import CreateRollupStep4 from "../CreateRollupStep4";
import { compareFieldItem, parseFieldOptions } from "../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";

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
  allMappings: FieldItem[][];
  fields: FieldItem[];
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

  continuousJob: string;
  continuousDefinition: string;
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
  static contextType = CoreServicesContext;
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
      allMappings: [],
      fields: [],
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
      timezone: "UTC",
      timeunit: "h",

      jobEnabledByDefault: true,
      continuousJob: "no",
      continuousDefinition: "fixed",
      interval: 1,
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      cronTimezone: "UTC",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: JSON.parse(EMPTY_ROLLUP),
    };
    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS, BREADCRUMBS.CREATE_ROLLUP]);
  };

  getMappings = async (srcIndex: string): Promise<void> => {
    if (!srcIndex.length) return;
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getMappings(srcIndex);
      if (response.ok) {
        let allMappings: FieldItem[][] = [];
        const mappings = response.response;
        //Push mappings array to allMappings 2D array first
        for (let index in mappings) {
          allMappings.push(parseFieldOptions("", mappings[index].mappings.properties));
        }
        //Find intersect from all mappings
        const fields = allMappings.reduce((mappingA, mappingB) =>
          mappingA.filter((itemA) => mappingB.some((itemB) => compareFieldItem(itemA, itemB)))
        );
        this.setState({ mappings, fields, allMappings });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load fields: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load fields"));
    }
  };

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
        let invalidMetric = false;
        selectedMetrics.map((metric) => {
          if (!(metric.min || metric.max || metric.sum || metric.avg || metric.value_count)) {
            const errorMsg = "Must specify at least one metric to aggregate on for: " + metric.source_field.label;
            this.setState({ submitError: errorMsg, metricError: errorMsg });
            invalidMetric = true;
            error = true;
          }
        });
        //If nothing invalid found, clear error.
        if (!invalidMetric) this.setState({ metricError: "" });
      }
    } else if (currentStep == 3) {
      //Check if interval is a valid value and is specified.
      const { intervalError, continuousDefinition } = this.state;
      if (continuousDefinition == "fixed") {
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
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const rollupId = e.target.value;
    this.setState({ rollupId, rollupIdError: rollupId ? "" : "Name is required" });
  };

  onChangeSourceIndex = async (options: EuiComboBoxOptionOption<IndexItem>[]): Promise<void> => {
    let newJSON = this.state.rollupJSON;
    let sourceIndex = options.map(function (option) {
      return option.label;
    });
    const sourceIndexError = sourceIndex.length ? "" : "Source index is required";
    const srcIndexText = sourceIndex.length ? sourceIndex[0] : "";
    newJSON.rollup.source_index = srcIndexText;
    this.setState({ sourceIndex: options, rollupJSON: newJSON, sourceIndexError: sourceIndexError });
    this.setState({
      selectedDimensionField: [],
      selectedMetrics: [],
    });
    await this.getMappings(srcIndexText);
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

  onChangeIntervalType = (intervalType: string): void => {
    this.setState({ intervalType, timeunit: "h" });
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
    this.setState({ cronExpression: e.target.value });
  };

  onChangeCronTimezone = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ cronTimezone: e.target.value });
  };

  onChangeDelayTime = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ delayTime: e.target.valueAsNumber });
  };

  updateDelay = (): void => {
    const { delayTimeunit, delayTime } = this.state;
    let newJSON = this.state.rollupJSON;
    if (delayTime == undefined) newJSON.rollup.delay = 0;
    else if (delayTimeunit == "SECONDS") {
      newJSON.rollup.delay = moment.duration(delayTime, "seconds").asMilliseconds();
    } else if (delayTimeunit == "MINUTES") {
      newJSON.rollup.delay = moment.duration(delayTime, "minutes").asMilliseconds();
    } else if (delayTimeunit == "HOURS") {
      newJSON.rollup.delay = moment.duration(delayTime, "hours").asMilliseconds();
    } else {
      newJSON.rollup.delay = moment.duration(delayTime, "days").asMilliseconds();
    }
    this.setState({ rollupJSON: newJSON });
  };

  onChangeIntervalTime = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ interval: e.target.valueAsNumber });
    if (e.target.value == "") {
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

  onChangeContinuousDefinition = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ continuousDefinition: e.target.value });
  };

  updateSchedule = (): void => {
    const { continuousDefinition, cronExpression, interval, intervalTimeunit, cronTimezone } = this.state;
    let newJSON = this.state.rollupJSON;

    if (continuousDefinition == "cron") {
      newJSON.rollup.schedule.cron = { expression: `${cronExpression}`, timezone: `${cronTimezone}` };
      delete newJSON.rollup.schedule["interval"];
    } else {
      newJSON.rollup.schedule.interval = {
        start_time: moment().unix(),
        unit: `${intervalTimeunit}`,
        period: `${interval}`,
      };
      delete newJSON.rollup.schedule["cron"];
    }
    this.setState({ rollupJSON: newJSON });
  };

  onChangeContinuousJob = (optionId: string): void => {
    let newJSON = this.state.rollupJSON;
    newJSON.rollup.continuous = optionId == "yes";
    this.setState({ continuousJob: optionId, rollupJSON: newJSON });
  };

  //Update delay field in JSON if delay value is defined.
  onChangeDelayTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ delayTimeunit: e.target.value });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ intervalTimeunit: e.target.value });
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
        this.updateDelay();
        await this.onCreate(rollupId, rollupJSON);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Rollup JSON");
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
        this.context.notifications.toasts.addSuccess(`Created rollup: ${response.response._id}`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.setState({ submitError: response.error });
        this.context.notifications.toasts.addDanger(`Failed to create rollup: ${response.error}`);
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the rollup job") });
      this.context.notifications.toasts.addDanger(
        `Failed to create rollup: ${getErrorMessage(err, "There was a problem creating the rollup job")}`
      );
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
      continuousJob,
      continuousDefinition,
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
          continuousJob={continuousJob}
          continuousDefinition={continuousDefinition}
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
          onChangeContinuousDefinition={this.onChangeContinuousDefinition}
          onChangeContinuousJob={this.onChangeContinuousJob}
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
          continuousJob={continuousJob}
          continuousDefinition={continuousDefinition}
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
              <EuiButton onClick={this._prev} data-test-subj="createRollupPreviousButton">
                Previous
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep == 4 ? (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createRollupSubmitButton">
                Create
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this._next} data-test-subj="createRollupNextButton">
                Next
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </form>
    );
  }
}
