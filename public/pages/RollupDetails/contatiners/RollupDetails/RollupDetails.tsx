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
  EuiComboBoxOptionOption,
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
} from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_ROLLUP } from "../../../CreateRollup/utils/constants";
import GeneralInformation from "../../Components/GeneralInformation/GeneralInformation";
import RollupStatus from "../../Components/RollupStatus/RollupStatus";
import AggregationAndMetricsSettings from "../../Components/AggregationAndMetricsSettings/AggregationAndMetricsSettings";
import { parseTimeunit } from "../../../CreateRollup/utils/helpers";
import { RollupMetadata } from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";
import { DimensionItem, MetricItem, RollupDimensionItem, RollupMetricItem } from "../../../CreateRollup/models/interfaces";
import DeleteModal from "../../../Rollups/components/DeleteModal";

interface RollupDetailsProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface RollupDetailsState {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  roles: EuiComboBoxOptionOption<String>[];
  rollupJSON: string;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  lastUpdated: string;
  metadata: RollupMetadata | null;

  timestamp: string;
  histogramInterval: string;
  timezone: string;
  selectedDimensionField: RollupDimensionItem[];
  selectedMetrics: MetricItem[];

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
      roles: [],

      recurringJob: "no",
      recurringDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: EMPTY_ROLLUP,
      lastUpdated: "-",
      metadata: null,

      timestamp: "",
      histogramInterval: "",
      timezone: "UTC +0",
      selectedDimensionField: [],
      selectedMetrics: [],
      isModalOpen: false,
      enabled: false,
      isDeleteModalVisible: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    const { id } = queryString.parse(this.props.location.search);
    console.log(id);
    if (typeof id === "string" && !!id) {
      chrome.breadcrumbs.push({ text: id });

      await this.getRollup(id);
    } else {
      toastNotifications.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  getRollup = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);
      const explainResponse = await rollupService.explainRollup(rollupId);

      if (response.ok) {
        let newJSON = JSON.parse(this.state.rollupJSON);
        newJSON.rollup = response.response.rollup;
        let roles: EuiComboBoxOptionOption<String>[] = [];
        var i;
        for (i = 0; i < response.response.rollup.roles.length; i++) {
          roles.push({ label: response.response.rollup.roles[i] });
        }

        this.setState({
          rollupId: response.response.id,
          description: response.response.rollup.description,
          sourceIndex: response.response.rollup.source_index,
          targetIndex: response.response.rollup.target_index,
          roles: roles,
          delayTime: response.response.rollup.delay,
          pageSize: response.response.rollup.page_size,
          rollupJSON: newJSON,
          lastUpdated: renderTime(response.response.rollup.last_updated_time),
          timestamp: response.response.rollup.dimensions[0].date_histogram.source_field,
          histogramInterval: response.response.rollup.dimensions[0].date_histogram.fixed_interval
            ? response.response.rollup.dimensions[0].date_histogram.fixed_interval
            : response.response.rollup.dimensions[0].date_histogram.calendar_interval,
          timezone: response.response.rollup.dimensions[0].date_histogram.timezone,
          selectedDimensionField: this.parseDimension(response.response.rollup.dimensions),
          selectedMetrics: this.parseMetric(response.response.rollup.metrics),
          enabled: response.response.rollup.enabled,
        });
        if (response.response.rollup.schedule.cron == undefined) {
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
      if (explainResponse.ok) {
        let metadata = explainResponse.response[rollupId];
        console.log(metadata);
        this.setState({ metadata: metadata });
      } else {
        toastNotifications.addDanger(`Could not load the explain API of rollup job: ${explainResponse.error}`);
      }
      console.log(explainResponse);
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      // this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  parseDimension = (dimensions: RollupDimensionItem[]): DimensionItem[] => {
    const sourceArray = dimensions.slice(1, dimensions.length);
    if (sourceArray.length == 0) return [];
    const result = sourceArray.map((dimension: RollupDimensionItem) => ({
      sequence: dimensions.indexOf(dimension),
      aggregationMethod: !!dimension.histogram ? "terms" : "histogram",
      field: dimension.histogram == null ? { label: dimension.terms?.source_field } : { label: dimension.histogram?.source_field },
      interval: dimension.histogram == null ? null : dimension.histogram?.interval,
    }));

    // console.log(result);
    return result;
  };

  parseMetric = (metrics: RollupMetricItem[]): MetricItem[] => {
    if (metrics.length == 0) return [];
    console.log(metrics);
    const result = metrics.map((metric) => ({
      source_field: metric.source_field,
      all: null,
      min: metric.metrics.filter((item) => item.min != null).length > 0,
      max: metric.metrics.filter((item) => item.max != null).length > 0,
      sum: metric.metrics.filter((item) => item.sum != null).length > 0,
      avg: metric.metrics.filter((item) => item.avg != null).length > 0,
      value_count: metric.metrics.filter((item) => item.value_count != null).length > 0,
    }));
    console.log("Result: " + result);
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
        //TODO: Update status or pull jobs again
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

  render() {
    const {
      rollupId,
      description,
      sourceIndex,
      targetIndex,
      roles,
      recurringJob,
      recurringDefinition,
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
      isModalOpen,
      rollupJSON,
      enabled,
      isDeleteModalVisible,
    } = this.state;

    let scheduleText = recurringJob ? "Continuous, " : "Not continuous, ";
    if (recurringDefinition == "fixed") {
      scheduleText += "every " + interval + " " + parseTimeunit(intervalTimeunit);
    } else {
      scheduleText += "defined by cron expression: " + cronExpression;
    }

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={"m"}>
              <h3>{rollupId}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton disabled={!enabled} onClick={this.onDisable}>
                  Disable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton disabled={enabled} onClick={this.onEnable}>
                  Enable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showModal}>View JSON</EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showDeleteModal} color={"danger"}>
                  Delete
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton fill={true}>Explore target index</EuiButton>
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
          roles={roles}
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
                  {JSON.stringify(rollupJSON)}
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