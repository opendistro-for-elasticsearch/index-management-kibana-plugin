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
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
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
  EuiContextMenu,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiText,
  EuiTextColor,
} from "@elastic/eui";
import { rollupsColumns } from "../../utils/constants";
import { RollupService } from "../../../../services";
import RollupEmptyPrompt from "../../components/RollupEmptyPrompt";
import { RollupItem, RollupsQueryParams } from "../../models/interfaces";
import { getURLQueryParams } from "../../utils/helpers";

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
  loadingRollups: boolean;
  isPopoverOpen: boolean;
}

let SampleGetRollupJobs: RollupItem[] = [
  {
    _id: "sample_job1",
    _version: 1,
    _seq_no: 0,
    _primary_term: 1,
    rollup: {
      enabled: false,
      schedule: {
        interval: {
          start_time: 1553112384,
          period: 1,
          unit: "Days",
        },
      },
      last_updated_time: 1602191791392,
      enabled_time: null,
      description: "Rolls up our daily indices into monthly summarized views",
      schema_version: 5,
      source_index: "kibana_sample_data_flights",
      target_index: "rollup-stats",
      metadata_id: null,
      roles: [],
      page_size: 200,
      delay: 10,
      continuous: false,
      dimensions: [
        {
          date_histogram: {
            fixed_interval: "30d",
            source_field: "timestamp",
            target_field: "timestamp",
            timezone: "America/Los_Angeles",
          },
        },
      ],
      metrics: [],
    },
  },
  {
    _id: "sample_job2",
    _version: 1,
    _seq_no: 1,
    _primary_term: 1,
    rollup: {
      enabled: false,
      schedule: {
        interval: {
          start_time: 1553112384,
          period: 1,
          unit: "Days",
        },
      },
      last_updated_time: 1602191837182,
      enabled_time: null,
      description: "Rolls up our daily indices into monthly summarized views",
      schema_version: 5,
      source_index: "kibana_sample_data_flights",
      target_index: "rollup-stats",
      metadata_id: null,
      roles: [],
      page_size: 200,
      delay: 10,
      continuous: false,
      dimensions: [
        {
          date_histogram: {
            fixed_interval: "30d",
            source_field: "timestamp",
            target_field: "timestamp",
            timezone: "America/Los_Angeles",
          },
        },
      ],
      metrics: [],
    },
  },
  {
    _id: "sample_job3",
    _version: 1,
    _seq_no: 2,
    _primary_term: 1,
    rollup: {
      enabled: false,
      schedule: {
        interval: {
          start_time: 1553112384,
          period: 1,
          unit: "Days",
        },
      },
      last_updated_time: 1602191874405,
      enabled_time: null,
      description: "Rolls up our daily indices into monthly summarized views",
      schema_version: 5,
      source_index: "kibana_sample_data_flights",
      target_index: "new-index",
      metadata_id: null,
      roles: [],
      page_size: 200,
      delay: 10,
      continuous: false,
      dimensions: [
        {
          date_histogram: {
            fixed_interval: "30d",
            source_field: "timestamp",
            target_field: "timestamp",
            timezone: "America/Los_Angeles",
          },
        },
      ],
      metrics: [],
    },
  },
];

export default class Rollups extends Component<RollupsProps, RollupsState> {
  constructor(props: RollupsProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalRollups: 1,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      rollups: SampleGetRollupJobs,
      loadingRollups: false,
      isPopoverOpen: false,
    };

    this.getRollups = _.debounce(this.getRollups, 500, { leading: true });
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    // await this.getRollups();
  }

  async componentDidUpdate(prevProps: RollupsProps, prevState: RollupsState) {
    // const prevQuery = Rollups.getQueryObjectFromState(prevState);
    // const currQuery = Rollups.getQueryObjectFromState(this.state);
    // if (!_.isEqual(prevQuery, currQuery)) {
    //   await this.getRollups();
    // }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: RollupsState): RollupsQueryParams {
    return { from, size, search, sortField, sortDirection };
  }

  panels = [
    {
      id: 0,
      items: [
        {
          name: "Edit",
          onClick: () => {
            this.closePopover();
            this.onClickEdit();
          },
        },
        {
          name: "Delete",
          href: "http://elastic.co",
          target: "_blank",
        },
      ],
    },
  ];

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

  onClickCreate = (): void => {
    this.props.history.push(ROUTES.CREATE_ROLLUP);
  };

  onClickEdit = (): void => {
    const {
      selectedItems: [{ _id }],
    } = this.state;
    if (_id) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${_id}`);
  };

  //TODO: Complete this function to disable selected rollup jobs
  onDisable = (): void => {};

  onEnable = (): void => {};

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: RollupItem[]): void => {
    this.setState({ selectedItems });
    console.log(this.state);
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
      <EuiButton iconType={"arrowDown"} iconSide={"right"} disabled={!selectedItems.length} onClick={this.onActionButtonClick}>
        Actions
      </EuiButton>
    );

    const selection: EuiTableSelectionType<RollupItem> = {
      onSelectionChange: this.onSelectionChange,
    };

    const items = [
      <EuiContextMenuItem
        key="Edit"
        icon="empty"
        disabled={selectedItems.length != 1}
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
        onClick={() => {
          this.closePopover();
        }}
      >
        <EuiTextColor color={"danger"}>Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];

    //TODO: Add action buttons here
    return (
      <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={"m"}>
              <h3>Rollup jobs</h3>
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
                <EuiButton disabled={!selectedItems.length} onClick={this.onEnable}>
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
                  {/*<EuiContextMenu initialPanelId={0} panels={this.panels} />*/}
                  <EuiContextMenuPanel items={items} />
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.onClickCreate} fill={true}>
                  Create Rollup Job
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
            tableLayout={"auto"}
          />
        </div>
      </EuiPanel>
    );
  }
}
