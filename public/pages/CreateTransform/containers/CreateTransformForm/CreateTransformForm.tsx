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

import React, { ChangeEvent, Component } from "react";
import { EuiButton, EuiButtonEmpty, EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import moment from "moment";
import { RollupService, TransformService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import CreateTransform from "../CreateTransform";
import CreateTransformStep2 from "../CreateTransformStep2";
import {
  FieldItem,
  IndexItem,
  Transform,
  TRANSFORM_AGG_TYPE,
  TransformAggItem,
  TransformGroupItem,
} from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_TRANSFORM } from "../../utils/constants";
import CreateTransformStep3 from "../CreateTransformStep3";
import CreateTransformStep4 from "../CreateTransformStep4";
import { compareFieldItem, createdTransformToastMessage, parseFieldOptions } from "../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateTransformFormProps extends RouteComponentProps {
  rollupService: RollupService;
  transformService: TransformService;
  indexService: IndexService;
  beenWarned: boolean;
}

interface CreateTransformFormState {
  currentStep: number;
  transformId: string;
  transformIdError: string;
  transformSeqNo: number | null;
  transformPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  loadingIndices: boolean;
  indices: ManagedCatIndex[];
  totalIndices: number;
  previewTransform: any[];

  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  sourceIndexError: string;
  //TODO: Uncomment the following line when multiple data filter is supported
  // sourceIndexFilter: string[];
  sourceIndexFilter: string;
  targetIndex: { label: string; value?: IndexItem }[];
  targetIndexError: string;

  mappings: any;
  allMappings: FieldItem[][];
  fields: FieldItem[];
  fieldSelectedOption: string;

  selectedGroupField: TransformGroupItem[];
  selectedAggregations: any;
  aggList: TransformAggItem[];
  selectedFields: FieldItem[];
  jobEnabledByDefault: boolean;

  interval: number;
  intervalError: string;
  intervalTimeunit: string;
  pageSize: number;
  transformJSON: any;

  beenWarned: boolean;
}

export default class CreateTransformForm extends Component<CreateTransformFormProps, CreateTransformFormState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateTransformFormProps) {
    super(props);

    this.state = {
      currentStep: 1,
      transformSeqNo: null,
      transformPrimaryTerm: null,
      transformId: "",
      transformIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      loadingIndices: true,
      indices: [],
      totalIndices: 0,
      previewTransform: [],

      mappings: "",
      allMappings: [],
      fields: [],
      fieldSelectedOption: "",
      selectedFields: [],
      selectedGroupField: [],
      selectedAggregations: {},
      aggList: [],
      description: "",

      sourceIndex: [],
      sourceIndexError: "",
      //TODO: Uncomment the following line when multiple data filter is supported
      // sourceIndexFilter: [],
      sourceIndexFilter: "",
      targetIndex: [],
      targetIndexError: "",

      intervalError: "",

      jobEnabledByDefault: true,
      interval: 1,
      intervalTimeunit: "MINUTES",
      pageSize: 1000,
      transformJSON: JSON.parse(EMPTY_TRANSFORM),

      beenWarned: false,
    };
    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS, BREADCRUMBS.CREATE_TRANSFORM]);
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

  previewTransform = async (transform: any): Promise<void> => {
    try {
      const { transformService } = this.props;
      const previewResponse = await transformService.previewTransform(transform);
      if (previewResponse.ok) this.setState({ previewTransform: previewResponse.response.documents });
      else this.context.notifications.toasts.addDanger(`Could not preview transform: ${previewResponse.error}`);
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load preview transform"));
    }
  };

  _next = async () => {
    let currentStep = this.state.currentStep;
    let warned = this.state.beenWarned;
    let error = false;
    //Verification here
    if (currentStep == 1) {
      const { transformId, sourceIndex, targetIndex } = this.state;
      const response = await this.props.transformService.getTransform(transformId);

      if (response.ok && response.response._id == transformId) {
        this.setState({
          submitError: `There is already a job named "${transformId}". Please provide a different name.`,
          transformIdError: `There is already a job named "${transformId}". Please provide a different name.`,
        });
        error = true;
      }
      if (!transformId) {
        this.setState({ submitError: "Job name is required.", transformIdError: "Job name is required." });
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
      //TODO: Add checking to see if grouping is defined
    } else if (currentStep == 3) {
      //Check if interval is a valid value and is specified.
      const { intervalError } = this.state;
    }

    if (error) return;

    if (warned) {
      currentStep = currentStep >= 3 ? 4 : currentStep + 1;
    }
    warned = true;

    this.setState({
      submitError: "",
      currentStep: currentStep,
      beenWarned: warned,
    });
  };

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
    let newJSON = this.state.transformJSON;
    newJSON.transform.description = description;
    this.setState({ description: description, transformJSON: newJSON });
  };

  onChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const transformId = e.target.value;
    this.setState({ transformId, transformIdError: transformId ? "" : "Name is required" });
  };

  onChangeSourceIndex = async (options: EuiComboBoxOptionOption<IndexItem>[]): Promise<void> => {
    let newJSON = this.state.transformJSON;
    let sourceIndex = options.map(function (option) {
      return option.label;
    });
    const sourceIndexError = sourceIndex.length ? "" : "Source index is required";
    const srcIndexText = sourceIndex.length ? sourceIndex[0] : "";
    newJSON.transform.source_index = srcIndexText;
    this.setState({ sourceIndex: options, transformJSON: newJSON, sourceIndexError: sourceIndexError });
    this.setState({
      selectedGroupField: [],
      selectedAggregations: {},
      aggList: [],
    });
    await this.getMappings(srcIndexText);
  };

  //TODO: Change type from string to string[] or something else  when multiple data filter is supported
  onChangeSourceIndexFilter = (newFilter: string): void => {
    let newJSON = this.state.transformJSON;
    if (newFilter == "") {
      newJSON.transform.hasOwnProperty("data_selection_query") && delete newJSON.transform.data_selection_query
    } else {
      try {
        newJSON.transform.data_selection_query = JSON.parse(newFilter);
      } catch (err) {
        this.context.notifications.toasts.addDanger('Invalid source index filter JSON: "' + newFilter + '"');
      }
    }
    this.setState({ sourceIndexFilter: newFilter, transformJSON: newJSON });
  };

  onChangeTargetIndex = (options: EuiComboBoxOptionOption<IndexItem>[]): void => {
    //Try to get label text from option from the only array element in options, if exists
    let newJSON = this.state.transformJSON;
    let targetIndex = options.map(function (option) {
      return option.label;
    });

    const targetIndexError = targetIndex.length ? "" : "Target index is required";

    newJSON.transform.target_index = targetIndex[0];
    this.setState({ targetIndex: options, transformJSON: newJSON, targetIndexError: targetIndexError });
  };

  onGroupSelectionChange = async (selectedGroupField: TransformGroupItem[], aggItem: TransformAggItem): Promise<void> => {
    const { aggList } = this.state;
    aggList.push(aggItem);
    this.updateGroup();

    await this.previewTransform(this.state.transformJSON);
    this.setState({ selectedGroupField });
  };

  onAggregationSelectionChange = async (selectedAggregations: any, aggItem: TransformAggItem): Promise<void> => {
    const { aggList } = this.state;
    aggList.push(aggItem);
    this.updateAggregation();

    await this.previewTransform(this.state.transformJSON);
    this.setState({ selectedAggregations: selectedAggregations });
  };

  onRemoveTransformation = async (name: string): Promise<void> => {
    const { aggList } = this.state;
    const toRemoveIndex = aggList.findIndex((item) => {
      return item.name === name;
    });
    aggList.splice(toRemoveIndex, 1);
    this.setState({ aggList });

    this.updateGroup();
    this.updateAggregation();
    await this.previewTransform(this.state.transformJSON);
  };

  onChangeJobEnabledByDefault = (): void => {
    const checked = this.state.jobEnabledByDefault;
    let newJSON = this.state.transformJSON;
    newJSON.transform.enabled = !checked;
    this.setState({ jobEnabledByDefault: !checked, transformJSON: newJSON });
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
    let newJSON = this.state.transformJSON;
    newJSON.transform.page_size = e.target.valueAsNumber;
    this.setState({ pageSize: e.target.valueAsNumber, transformJSON: newJSON });
  };

  updateSchedule = (): void => {
    const { interval, intervalTimeunit } = this.state;
    let newJSON = this.state.transformJSON;

    newJSON.transform.schedule.interval = {
      start_time: moment().unix(),
      unit: `${intervalTimeunit}`,
      period: `${interval}`,
    };
    delete newJSON.transform.schedule["cron"];

    this.setState({ transformJSON: newJSON });
  };

  onChangeIntervalTimeunit = (e: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ intervalTimeunit: e.target.value });
  };

  updateGroup = (): void => {
    const { transformJSON, aggList } = this.state;
    let newJSON = transformJSON;
    let tempGroupSelect: TransformGroupItem[] = [];
    aggList.map((aggItem) => {
      if (
        aggItem.type == TRANSFORM_AGG_TYPE.histogram ||
        aggItem.type == TRANSFORM_AGG_TYPE.terms ||
        aggItem.type == TRANSFORM_AGG_TYPE.date_histogram
      )
        tempGroupSelect.push(aggItem.item);
    });
    if (tempGroupSelect.length) newJSON.transform.groups = tempGroupSelect;
    this.setState({ transformJSON: newJSON });
  };

  updateAggregation = (): void => {
    const { transformJSON, aggList } = this.state;
    let newJSON = transformJSON;
    let aggJSON: any = {};
    aggList.map((aggItem) => {
      // Form the final aggregation object with items with correct types from aggList
      if (
        aggItem.type !== TRANSFORM_AGG_TYPE.histogram &&
        aggItem.type !== TRANSFORM_AGG_TYPE.terms &&
        aggItem.type !== TRANSFORM_AGG_TYPE.date_histogram
      )
        aggJSON[aggItem.name] = aggItem.item;
    });
    newJSON.transform.aggregations = aggJSON;
    this.setState({ transformJSON: newJSON });
  };

  onSubmit = async (): Promise<void> => {
    const { transformId, transformJSON } = this.state;
    console.log(transformJSON);
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!transformId) {
        this.setState({ transformIdError: "Required" });
      } else {
        this.updateGroup();
        this.updateAggregation();
        this.updateSchedule();
        await this.onCreate(transformId, transformJSON);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Transform JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.TRANSFORMS);
  };

  onCreate = async (transformId: string, transform: Transform): Promise<void> => {
    const { transformService } = this.props;
    try {
      const response = await transformService.putTransform(transform, transformId);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(createdTransformToastMessage(response.response._id));
        this.props.history.push(ROUTES.TRANSFORMS);
      } else {
        this.setState({ submitError: response.error });
        this.context.notifications.toasts.addDanger(`Failed to create transform: ${response.error}`);
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the transform job") });
      this.context.notifications.toasts.addDanger(
        `Failed to create transform: ${getErrorMessage(err, "There was a problem creating the transform job")}`
      );
    }
  };

  render() {
    const {
      transformId,
      transformIdError,
      submitError,
      isSubmitting,
      hasSubmitted,
      description,
      sourceIndex,
      sourceIndexError,
      sourceIndexFilter,
      targetIndex,
      targetIndexError,
      currentStep,
      previewTransform,
      fields,
      fieldSelectedOption,
      selectedGroupField,
      selectedAggregations,
      aggList,
      jobEnabledByDefault,
      interval,
      intervalTimeunit,
      intervalError,
      pageSize,

      beenWarned,
    } = this.state;
    return (
      <div>
        <CreateTransform
          {...this.props}
          transformId={transformId}
          transformIdError={transformIdError}
          submitError={submitError}
          isSubmitting={isSubmitting}
          hasSubmitted={hasSubmitted}
          description={description}
          sourceIndexFilter={sourceIndexFilter}
          sourceIndex={sourceIndex}
          sourceIndexError={sourceIndexError}
          targetIndex={targetIndex}
          targetIndexError={targetIndexError}
          onChangeName={this.onChangeName}
          onChangeDescription={this.onChangeDescription}
          onChangeSourceIndex={this.onChangeSourceIndex}
          onChangeSourceIndexFilter={this.onChangeSourceIndexFilter}
          onChangeTargetIndex={this.onChangeTargetIndex}
          currentStep={this.state.currentStep}
          hasAggregation={selectedGroupField.length != 0 ||
            Object.keys(selectedAggregations).length != 0 ||
            aggList.length != 0}
          fields={fields}
          fieldSelectedOption={fieldSelectedOption}
          beenWarned={beenWarned}
        />
        <CreateTransformStep2
          {...this.props}
          currentStep={this.state.currentStep}
          sourceIndex={sourceIndex[0] ? sourceIndex[0].label : ""}
          fields={fields}
          aggList={aggList}
          selectedGroupField={selectedGroupField}
          selectedAggregations={selectedAggregations}
          onGroupSelectionChange={this.onGroupSelectionChange}
          onAggregationSelectionChange={this.onAggregationSelectionChange}
          onRemoveTransformation={this.onRemoveTransformation}
          previewTransform={previewTransform}
        />
        <CreateTransformStep3
          {...this.props}
          currentStep={this.state.currentStep}
          jobEnabledByDefault={jobEnabledByDefault}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          intervalError={intervalError}
          pageSize={pageSize}
          onChangeJobEnabledByDefault={this.onChangeJobEnabledByDefault}
          onChangeIntervalTime={this.onChangeIntervalTime}
          onChangePage={this.onChangePage}
          onChangeIntervalTimeunit={this.onChangeIntervalTimeunit}
        />
        <CreateTransformStep4
          {...this.props}
          transformId={transformId}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          sourceIndexFilter={sourceIndexFilter}
          fields={fields}
          selectedGroupField={selectedGroupField}
          onGroupSelectionChange={this.onGroupSelectionChange}
          selectedAggregations={selectedAggregations}
          aggList={aggList}
          onAggregationSelectionChange={this.onAggregationSelectionChange}
          onRemoveTransformation={this.onRemoveTransformation}
          previewTransform={previewTransform}
          jobEnabledByDefault={jobEnabledByDefault}
          interval={interval}
          intervalTimeunit={intervalTimeunit}
          pageSize={pageSize}
          currentStep={this.state.currentStep}
          onChangeStep={this.onChangeStep}
          submitError={submitError}
        />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd" style={{ padding: "5px 50px" }}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createTransformCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          {currentStep != 1 && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this._prev} data-test-subj="createTransformPreviousButton">
                Previous
              </EuiButton>
            </EuiFlexItem>
          )}

          {currentStep == 4 ? (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createTransformSubmitButton">
                Create
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={this._next} data-test-subj="createTransformNextButton">
                Next
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </div>
    );
  }
}
