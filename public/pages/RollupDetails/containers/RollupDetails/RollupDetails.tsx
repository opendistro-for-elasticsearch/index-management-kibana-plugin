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
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiModalFooter,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
  EuiHealth,
} from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import GeneralInformation from "../../components/GeneralInformation/GeneralInformation";
import RollupStatus from "../../components/RollupStatus/RollupStatus";
import AggregationAndMetricsSettings from "../../components/AggregationAndMetricsSettings/AggregationAndMetricsSettings";
import { parseTimeunit } from "../../../CreateRollup/utils/helpers";
import {
  DimensionItem,
  MetricItem,
  RollupDimensionItem,
  RollupMetadata,
  RollupMetricItem,
  DateHistogramItem,
} from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";
import DeleteModal from "../../../Rollups/components/DeleteModal";

interface RollupDetailsProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface RollupDetailsState {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  rollupJSON: any;
  continuousJob: string;
  continuousDefinition: string;

  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  lastUpdated: string;
  metadata: RollupMetadata | undefined;

  timestamp: string;
  histogramInterval: string;
  timezone: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
  metricsShown: MetricItem[];
  dimensionsShown: DimensionItem[];

  isModalOpen: boolean;
  enabled: boolean;
  isDeleteModalVisible: boolean;
}

export default class RollupDetails extends Component<RollupDetailsProps, RollupDetailsState> {
  constructor(props: RollupDetailsProps) {
    super(props);

    this.state = {
      rollupId: "",
      description: "",
      sourceIndex: "",
      targetIndex: "",

      continuousJob: "no",
      continuousDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: "",
      lastUpdated: "-",
      metadata: undefined,

      timestamp: "",
      histogramInterval: "",
      timezone: "UTC +0",
      selectedDimensionField: [],
      selectedMetrics: [],
      dimensionsShown: [],
      metricsShown: [],
      isModalOpen: false,
      enabled: false,
      isDeleteModalVisible: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      chrome.breadcrumbs.push({ text: id });
      this.props.history.push(`${ROUTES.ROLLUP_DETAILS}?id=${id}`);
      await this.getRollup(id);
      this.forceUpdate();
    } else {
      toastNotifications.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  getRollup = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);

      if (response.ok) {
        const newJSON = response.response;
        const selectedMetrics = this.parseMetric(response.response.rollup.metrics);
        const selectedDimensionField = this.parseDimension(response.response.rollup.dimensions);
        this.setState({
          rollupId: response.response._id,
          description: response.response.rollup.description,
          sourceIndex: response.response.rollup.source_index,
          targetIndex: response.response.rollup.target_index,
          delayTime: response.response.rollup.delay as number,
          pageSize: response.response.rollup.page_size,
          rollupJSON: newJSON,
          lastUpdated: renderTime(response.response.rollup.last_updated_time),
          timestamp: response.response.rollup.dimensions[0].date_histogram.source_field,
          histogramInterval: response.response.rollup.dimensions[0].date_histogram.fixed_interval
            ? response.response.rollup.dimensions[0].date_histogram.fixed_interval
            : response.response.rollup.dimensions[0].date_histogram.calendar_interval,
          timezone: response.response.rollup.dimensions[0].date_histogram.timezone,
          selectedDimensionField,
          selectedMetrics,
          metricsShown: selectedMetrics.slice(0, 10),
          dimensionsShown: selectedDimensionField.slice(0, 10),
          enabled: response.response.rollup.enabled,
        });
        if (response.response.metadata != null) {
          this.setState({ metadata: response.response.metadata[response.response._id] });
        }
        if ("interval" in response.response.rollup.schedule) {
          this.setState({
            interval: response.response.rollup.schedule.interval.period,
            intervalTimeunit: response.response.rollup.schedule.interval.unit,
          });
        } else {
          this.setState({ cronExpression: response.response.rollup.schedule.cron.expression });
        }
      } else {
        toastNotifications.addDanger(`Could not load the rollup job: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  parseDimension = (dimensions: RollupDimensionItem[]): DimensionItem[] => {
    const sourceArray = dimensions.slice(1, dimensions.length);
    if (sourceArray.length == 0) return [];
    const result = sourceArray.map((dimension: RollupDimensionItem) => ({
      sequence: dimensions.indexOf(dimension),
      aggregationMethod: dimension.histogram == null ? "terms" : "histogram",
      field: dimension.histogram == null ? { label: dimension.terms?.source_field } : { label: dimension.histogram?.source_field },
      interval: dimension.histogram == null ? null : dimension.histogram?.interval,
    }));
    return result;
  };

  parseMetric = (metrics: RollupMetricItem[]): MetricItem[] => {
    if (metrics.length == 0) return [];
    const result = metrics.map((metric) => ({
      source_field: metric.source_field,
      all: false,
      min: metric.metrics.filter((item) => item.min != null).length > 0,
      max: metric.metrics.filter((item) => item.max != null).length > 0,
      sum: metric.metrics.filter((item) => item.sum != null).length > 0,
      avg: metric.metrics.filter((item) => item.avg != null).length > 0,
      value_count: metric.metrics.filter((item) => item.value_count != null).length > 0,
    }));
    return result;
  };

  onDisable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;
    try {
      const response = await rollupService.stopRollup(rollupId);

      if (response.ok) {
        this.setState({ enabled: false });
        //Show success message
        await this.getRollup(rollupId);
        this.forceUpdate();
        toastNotifications.addSuccess(`${rollupId} is disabled`);
      } else {
        toastNotifications.addDanger(`Could not stop the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not stop the rollup job: " + rollupId));
    }
  };

  onEnable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;

    try {
      const response = await rollupService.startRollup(rollupId);

      if (response.ok) {
        this.setState({ enabled: true });
        //Show success message
        await this.getRollup(rollupId);
        this.forceUpdate();
        toastNotifications.addSuccess(`${rollupId} is enabled`);
      } else {
        toastNotifications.addDanger(`Could not start the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not start the rollup job: " + rollupId));
    }
  };

  onEdit = (): void => {
    const { rollupId } = this.state;
    if (rollupId) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${rollupId}`);
  };

  showModal = () => this.setState({ isModalOpen: true });

  closeModal = () => this.setState({ isModalOpen: false });

  closeDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  onClickDelete = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;

    try {
      const response = await rollupService.deleteRollup(rollupId);

      if (response.ok) {
        this.closeDeleteModal();
        //Show success message
        toastNotifications.addSuccess(`"${rollupId}" successfully deleted!`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        toastNotifications.addDanger(`Could not delete the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not delete the rollup job"));
    }
  };

  onChangeDimensionsShown = (from: number, size: number): void => {
    const { selectedDimensionField } = this.state;
    this.setState({ dimensionsShown: selectedDimensionField.slice(from, from + size) });
  };
  onChangeMetricsShown = (from: number, size: number): void => {
    const { selectedMetrics } = this.state;
    this.setState({ metricsShown: selectedMetrics.slice(from, from + size) });
  };

  render() {
    const {
      rollupId,
      description,
      sourceIndex,
      targetIndex,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      lastUpdated,
      metadata,

      timestamp,
      histogramInterval,
      timezone,
      selectedDimensionField,
      selectedMetrics,
      metricsShown,
      dimensionsShown,
      isModalOpen,
      rollupJSON,
      enabled,
      isDeleteModalVisible,
    } = this.state;

    let scheduleText = continuousJob ? "Continuous, " : "Not continuous, ";
    if (continuousDefinition == "fixed") {
      scheduleText += "every " + interval + " " + parseTimeunit(intervalTimeunit);
    } else {
      scheduleText += "defined by cron expression: " + cronExpression;
    }

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2>{rollupId}</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            {enabled ? (
              <EuiHealth color="success">{"Enabled on " + lastUpdated}</EuiHealth>
            ) : (
              <EuiHealth color="danger">Disabled</EuiHealth>
            )}
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton disabled={!enabled} onClick={this.onDisable} data-test-subj="disableButton">
                  Disable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton disabled={enabled} onClick={this.onEnable} data-test-subj="enableButton">
                  Enable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showModal}>View JSON</EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                  Delete
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <GeneralInformation
          rollupId={rollupId}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          scheduleText={scheduleText}
          pageSize={pageSize}
          lastUpdated={lastUpdated}
          onEdit={this.onEdit}
        />
        <EuiSpacer />
        <RollupStatus metadata={metadata} />
        <EuiSpacer />
        <AggregationAndMetricsSettings
          timestamp={timestamp}
          histogramInterval={histogramInterval}
          timezone={timezone}
          selectedDimensionField={selectedDimensionField}
          selectedMetrics={selectedMetrics}
          metricsShown={metricsShown}
          dimensionsShown={dimensionsShown}
          onChangeMetricsShown={this.onChangeMetricsShown}
          onChangeDimensionsShown={this.onChangeDimensionsShown}
        />
        <EuiSpacer />

        {isModalOpen && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>{"View JSON of " + rollupId} </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                  {JSON.stringify(rollupJSON, null, 4)}
                </EuiCodeBlock>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiButtonEmpty onClick={this.closeModal}>Close</EuiButtonEmpty>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}

        {isDeleteModalVisible && (
          <DeleteModal rollupId={rollupId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}
