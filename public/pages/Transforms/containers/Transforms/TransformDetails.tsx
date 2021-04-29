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
import { TransformService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import React, { Component } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import queryString from "query-string";
import { getErrorMessage } from "../../../../utils/helpers";
import { DimensionItem, MetricItem, RollupDimensionItem, TransformMetadata } from "../../../../../models/interfaces";
import DeleteModal from "../../components/DeleteModal";
import GenerationInformation from "../../components/GeneralInformation";
import TransformStatus from "../../components/TransformStatus";
import { EMPTY_TRANSFORM } from "../../utils/constants";

interface TransformDetailsProps extends RouteComponentProps {
  transformService: TransformService;
}

interface TransformDetailsState {
  id: string;
  description: string;
  enabled: boolean;
  enabledAt: number | null;
  updatedAt: number;
  pageSize: number;
  transformJson: any;
  sourceIndex: string;
  targetIndex: string;
  aggregationsShown: MetricItem[];
  groupsShown: DimensionItem[];
  metadata: TransformMetadata | undefined;
  interval: number;
  intervalTimeUnit: string;
  cronExpression: string;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
}

export default class TransformDetails extends Component<TransformDetailsProps, TransformDetailsState> {
  static contextType = CoreServicesContext;
  constructor(props: TransformDetailsProps) {
    super(props);

    this.state = {
      id: "",
      description: "",
      enabled: false,
      enabledAt: null,
      updatedAt: 1,
      pageSize: 1000,
      transformJson: EMPTY_TRANSFORM,
      sourceIndex: "",
      targetIndex: "",
      aggregationsShown: [],
      groupsShown: [],
      metadata: undefined,
      interval: 2,
      intervalTimeUnit: "",
      cronExpression: "",
      isModalOpen: false,
      isDeleteModalOpen: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS]);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS, { text: id }]);
      this.props.history.push(`${ROUTES.TRANSFORM_DETAILS}?id=${id}`);
      await this.getTransform(id);
      this.forceUpdate();
    } else {
      this.context.notifications.toasts.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  getTransform = async (transformId: string) => {
    try {
      const { transformService } = this.props;
      const response = await transformService.getTransform(transformId);

      if (response.ok) {
        let json = response.response;
        // let aggregations = this.parseAggregations(response.response.transform.aggregations);
        let groups = this.parseGroups(response.response.transform.groups);
        this.setState({
          id: response.response._id,
          description: response.response.transform.description,
          enabled: response.response.transform.enabled,
          enabledAt: response.response.transform.enabled_at,
          updatedAt: response.response.transform.updated_at,
          pageSize: response.response.transform.page_size,
          transformJson: json,
          sourceIndex: response.response.transform.source_index,
          targetIndex: response.response.transform.target_index,
          aggregationsShown: [],
          groupsShown: groups.slice(0, 10),
        });

        if (response.response.metadata != null) {
          this.setState({ metadata: response.response.metadata[response.response._id] });
        }
        if ("interval" in response.response.transform.schedule) {
          this.setState({
            interval: response.response.transform.schedule.interval.period,
            intervalTimeUnit: response.response.transform.schedule.interval.unit,
          });
        } else {
          this.setState({ cronExpression: response.response.transform.schedule.cron.expression });
        }
      } else {
        this.context.notifications.toasts.addDanger(`Could not load transform job ${transformId}: ${response.error}`);
        this.props.history.push(ROUTES.TRANSFORMS);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not load transform job ${transformId}`));
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  parseGroups = (groups: RollupDimensionItem[]): DimensionItem[] => {
    const sourceArray = groups.slice(1, groups.length);
    if (sourceArray.length == 0) return [];
    // @ts-ignore
    return sourceArray.map((group: RollupDimensionItem) => {
      let sequence = groups.indexOf(group);
      switch (true) {
        case group.date_histogram != null:
          return {
            sequence: sequence,
            aggregationMethod: "date_histogram",
            field: {
              label: group.date_histogram?.source_field,
            },
            interval: group.date_histogram?.interval,
          };
        case group.histogram != null:
          return {
            sequence: sequence,
            aggregationMethod: "histogram",
            field: {
              label: group.histogram?.source_field,
            },
            interval: group.histogram?.interval,
          };
        case group.terms != null:
          return {
            sequence: sequence,
            aggregationMethod: "terms",
            field: {
              label: group.terms?.source_field,
            },
            interval: null,
          };
      }
    });
  };

  render() {
    const {
      id,
      enabled,
      updatedAt,
      description,
      sourceIndex,
      targetIndex,
      pageSize,
      metadata,
      transformJson,
      isDeleteModalOpen,
      isModalOpen,
    } = this.state;

    let scheduleText = "At some time";
    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2>{id}</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            {enabled ? <EuiHealth color="success">{"Enabled on " + updatedAt}</EuiHealth> : <EuiHealth color="danger">Disabled</EuiHealth>}
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
        <GenerationInformation
          id={id}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          scheduledText={scheduleText}
          pageSize={pageSize}
          updatedAt={updatedAt}
          onEdit={this.onEdit}
        />
        <EuiSpacer />
        <TransformStatus metadata={metadata} />
        <EuiSpacer />
        <EuiSpacer />

        {isModalOpen && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>{"View JSON of " + id} </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                  {JSON.stringify(transformJson, null, 4)}
                </EuiCodeBlock>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiButtonEmpty onClick={this.closeModal}>Close</EuiButtonEmpty>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}

        {isDeleteModalOpen && <DeleteModal item={id} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />}
      </div>
    );
  }

  closeModal = () => {};
  closeDeleteModal = () => {};
  onClickDelete = () => {};
  onEdit = () => {};
  onEnable = () => {};
  onDisable = () => {};
  showModal = () => {};
  showDeleteModal = () => {};
}
