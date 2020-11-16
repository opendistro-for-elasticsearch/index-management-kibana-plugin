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
import _ from "lodash";
import chrome from "ui/chrome";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import queryString from "query-string";
import { toastNotifications } from "ui/notify";
import { getErrorMessage } from "../../../../utils/helpers";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../../Indices/utils/constants";
import { RouteComponentProps } from "react-router-dom";
import {
  EuiBasicTable,
  EuiHorizontalRule,
  // @ts-ignore
  Criteria,
  EuiTableSortingType,
  Direction,
  // @ts-ignore
  Pagination,
  EuiTableSelectionType,
  EuiFlexItem,
  EuiFieldSearch,
  EuiPagination,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiButton,
  EuiPopover,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiTextColor,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiIcon,
  EuiText,
} from "@elastic/eui";
import { RollupService } from "../../../../services";
import RollupEmptyPrompt from "../../components/RollupEmptyPrompt";
import { RollupItem, RollupsQueryParams } from "../../models/interfaces";
import { getURLQueryParams, renderContinuous, renderEnabled, renderTime } from "../../utils/helpers";
import DeleteModal from "../../components/DeleteModal";

interface RollupsProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface RollupsState {
  totalRollups: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof RollupItem;
  sortDirection: Direction;
  selectedItems: RollupItem[];
  rollups: RollupItem[];
  rollupExplain: any;
  loadingRollups: boolean;
  isPopoverOpen: boolean;
  isDeleteModalVisible: boolean;
}

export default class Rollups extends Component<RollupsProps, RollupsState> {
  constructor(props: RollupsProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalRollups: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      rollups: [],
      loadingRollups: false,
      isPopoverOpen: false,
      isDeleteModalVisible: false,
      rollupExplain: {},
    };

    this.getRollups = _.debounce(this.getRollups, 500, { leading: true });
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    await this.getRollups();
    const { rollups } = this.state;
    if (rollups.length != 0) await this.getExplains();
  }

  async componentDidUpdate(prevProps: RollupsProps, prevState: RollupsState) {
    const prevQuery = Rollups.getQueryObjectFromState(prevState);
    const currQuery = Rollups.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getRollups();
      const { rollups } = this.state;
      if (rollups.length != 0) await this.getExplains();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: RollupsState): RollupsQueryParams {
    return { from, size, search, sortField, sortDirection };
  }

  getRollups = async (): Promise<void> => {
    this.setState({ loadingRollups: true });
    try {
      const { rollupService, history } = this.props;
      const queryParamsString = queryString.stringify(Rollups.getQueryObjectFromState(this.state));
      history.replace({ ...this.props.location, search: queryParamsString });
      const rollupJobsResponse = await rollupService.getRollups(queryParamsString);
      if (rollupJobsResponse.ok) {
        const { rollups, totalRollups } = rollupJobsResponse.response;
        this.setState({ rollups, totalRollups });
      } else {
        toastNotifications.addDanger(rollupJobsResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem loading the rollups"));
    }
    this.setState({ loadingRollups: false });
  };

  getExplains = async (): Promise<void> => {
    this.setState({ loadingRollups: true });
    try {
      const { rollupService } = this.props;
      const { rollups } = this.state;
      //Concat the rollup job ids to form params for explain api:
      let paramString = "";
      rollups.map((rollup) => {
        if (rollups.indexOf(rollup) == 0) {
          paramString = paramString + rollup._id;
        } else {
          paramString = paramString + "," + rollup._id;
        }
      });
      const rollupJobsResponse = await rollupService.explainRollup(paramString);
      if (rollupJobsResponse.ok) {
        const rollupExplain = rollupJobsResponse.response;
        this.setState({ rollupExplain });
        // Assuming the order of rollup jobs is identical to metadata.
        rollups.map((rollup: RollupItem) => {
          rollup.rollup.metadata = rollupExplain[rollup._id];
        });
        this.setState({ rollups });
      } else {
        toastNotifications.addDanger(rollupJobsResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem loading the metadata of rollups"));
    }
    this.setState({ loadingRollups: false });
  };

  onClickCreate = (): void => {
    this.props.history.push(ROUTES.CREATE_ROLLUP);
  };

  onClickEdit = (): void => {
    const {
      selectedItems: [{ _id }],
    } = this.state;
    if (_id) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${_id}`);
  };

  onClickDelete = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    var item;
    for (item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.deleteRollup(rollupId);

        if (response.ok) {
          this.closeDeleteModal();
          await this.getRollups();
          //Show success message
          toastNotifications.addSuccess(`"${rollupId}" successfully deleted!`);
        } else {
          toastNotifications.addDanger(`Could not delete the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        toastNotifications.addDanger(getErrorMessage(err, "Could not delete the rollup job"));
      }
    }
  };

  onDisable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    var item;
    for (item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.stopRollup(rollupId);

        if (response.ok) {
          await this.getRollups();
          await this.getExplains();
          //Show success message
          toastNotifications.addSuccess(`${rollupId} is disabled`);
        } else {
          toastNotifications.addDanger(`Could not stop the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        toastNotifications.addDanger(getErrorMessage(err, "Could not stop the rollup job"));
      }
    }
  };

  onEnable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    var item;
    for (item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.startRollup(rollupId);

        if (response.ok) {
          await this.getRollups();
          await this.getExplains();
          //Show success message
          toastNotifications.addSuccess(`${rollupId} is enabled`);
        } else {
          toastNotifications.addDanger(`Could not start the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        toastNotifications.addDanger(getErrorMessage(err, "Could not start the rollup job"));
      }
    }
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: RollupItem[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ from: 0, search: e.target.value });
  };

  onPageClick = (page: number): void => {
    const { size } = this.state;
    this.setState({ from: page * size });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  };

  onActionButtonClick = (): void => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  closePopover = (): void => {
    this.setState({ isPopoverOpen: false });
  };

  closeDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  concatName = (): string => {
    const { selectedItems } = this.state;
    let result = "";
    var item;
    for (item of selectedItems) {
      if (selectedItems.indexOf(item) == 0) result = result + item._id;
      else result = result + ", " + item._id;
    }
    return result;
  };
  render() {
    const {
      totalRollups,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      rollups,
      loadingRollups,
      isPopoverOpen,
      isDeleteModalVisible,
    } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);
    const pageCount = Math.ceil(totalRollups / size) || 1;

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalRollups,
    };

    const sorting: EuiTableSortingType<RollupItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const actionButton = (
      <EuiButton iconType="arrowDown" iconSide="right" disabled={!selectedItems.length} onClick={this.onActionButtonClick}>
        Actions
      </EuiButton>
    );

    const selection: EuiTableSelectionType<RollupItem> = {
      onSelectionChange: this.onSelectionChange,
    };

    const actionItems = [
      <EuiContextMenuItem
        key="Edit"
        icon="empty"
        disabled={selectedItems.length != 1}
        data-test-subj="EditButton"
        onClick={() => {
          this.closePopover();
          this.onClickEdit();
        }}
      >
        Edit
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="Delete"
        icon="empty"
        disabled={selectedItems.length == 0}
        onClick={() => {
          this.closePopover();
          this.showDeleteModal();
        }}
      >
        <EuiTextColor color="danger">Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];

    const rollupsColumns: EuiTableFieldDataColumnType<RollupItem>[] = [
      {
        field: "_id",
        name: "Name",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: (_id) => (
          <EuiLink
            href={"opendistro_index_management_kibana#/rollup-details?" + _id}
            onClick={() => this.props.history.push(`${ROUTES.ROLLUP_DETAILS}?id=${_id}`)}
          >
            {_id}
          </EuiLink>
        ),
      },
      {
        field: "rollup.rollup.source_index",
        name: "Source index",
        sortable: true,
        textOnly: true,
        truncateText: true,
      },
      {
        field: "rollup.rollup.target_index",
        name: "Target index",
        sortable: true,
        textOnly: true,
        truncateText: true,
      },
      {
        field: "rollup.rollup.enabled",
        name: "Job state",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: renderEnabled,
      },
      {
        field: "rollup.rollup.continuous",
        name: "Continuous",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: renderContinuous,
      },
      {
        field: "rollup.metadata.rollup_metadata.continuous",
        name: "Next rollup window",
        sortable: true,
        textOnly: true,
        render: (metadata) =>
          metadata == null ? "-" : renderTime(metadata.next_window_start_time) + " - " + renderTime(metadata.next_window_end_time),
      },
      {
        field: "rollup.metadata",
        name: "Rollup job status",
        sortable: true,
        textOnly: true,
        render: (metadata) =>
          metadata == null || metadata.rollup_metadata == undefined || metadata.rollup_metadata == null ? (
            "-"
          ) : metadata.rollup_metadata.status == "failed" ? (
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiIcon size="s" type="alert" color="danger" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="danger">
                  {"Failed:" + metadata.rollup_metadata.failure_reason}
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : metadata.rollup_metadata.status == "finished" ? (
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiIcon size="s" type="check" color="success" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="secondary">
                  Complete
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : metadata.rollup_metadata.status == "init" ? (
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiIcon size="s" type="clock" color="primary" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs" style={{ color: "#006BB4" }}>
                  Initializing
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : metadata.rollup_metadata.status == "started" ? (
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiIcon size="s" type="play" color="success" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="secondary">
                  Started
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : metadata.rollup_metadata.status == "stopped" ? (
            <EuiFlexGroup gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiIcon size="s" type="stop" color="subdued" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="subdued">
                  Stopped
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            "-"
          ),
      },
    ];

    return (
      <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="m">
              <h3>{"Rollup jobs (" + `${rollups.length}` + ")"}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton disabled={!selectedItems.length} onClick={this.onDisable}>
                  Disable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  disabled={!selectedItems.length}
                  onClick={() => {
                    this.onEnable();
                  }}
                >
                  Enable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  id="action"
                  button={actionButton}
                  isOpen={isPopoverOpen}
                  closePopover={this.closePopover}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <EuiContextMenuPanel items={actionItems} />
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.onClickCreate} fill={true} data-test-subj="createRollupButton">
                  Create rollup job
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <div style={{ padding: "initial" }}>
          <EuiFlexGroup style={{ padding: "0px 5px" }}>
            <EuiFlexItem>
              <EuiFieldSearch fullWidth={true} value={search} placeholder="Search" onChange={this.onSearchChange} />
            </EuiFlexItem>
            {pageCount > 1 && (
              <EuiFlexItem grow={false} style={{ justifyContent: "center" }}>
                <EuiPagination
                  pageCount={pageCount}
                  activePage={page}
                  onPageClick={this.onPageClick}
                  data-test-subj="indexControlsPagination"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>

          <EuiHorizontalRule margin="xs" />

          <EuiBasicTable
            columns={rollupsColumns}
            isSelectable={true}
            itemId="_id"
            items={rollups}
            noItemsMessage={
              <RollupEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingRollups} resetFilters={this.resetFilters} />
            }
            onChange={this.onTableChange}
            pagination={pagination}
            selection={selection}
            sorting={sorting}
            tableLayout="auto"
          />
          {isDeleteModalVisible && (
            <DeleteModal
              rollupId={selectedItems.length ? this.concatName() : ""}
              closeDeleteModal={this.closeDeleteModal}
              onClickDelete={this.onClickDelete}
            />
          )}
        </div>
      </EuiPanel>
    );
  }
}
