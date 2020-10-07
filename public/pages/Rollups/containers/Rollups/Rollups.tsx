/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  EuiButton,
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
}

let SampleGetRollupJobs: RollupItem[] = [
  {
    id: "rollup-job-1",
    seqNo: 1,
    primaryTerm: 1,
    rollup: {
      source_index: "stats-*",
      target_index: "rollup-stats",
      schedule: {
        interval: {
          period: 1,
          unit: "Days",
        },
      },
      run_as_user: "dbbaughe",
      roles: ["admin"],
      description: "Rolls up our daily indices into monthly summarized views",
      enabled: true,
      error_notification: {
        destination: { slack: { url: "..." } },
        message_template: { source: "..." },
      },
      page_size: 200,
      delay: "6h",
      dimensions: {
        date_histogram: {
          field: "timestamp",
          fixed_interval: "30d",
          timezone: "America/Los_Angeles",
        },
        terms: {
          fields: ["customer_city"],
        },
      },
      metrics: [
        {
          field: "price",
          metric_aggregations: ["avg", "min", "max", "sum"],
        },
      ],
    },
  },
  {
    id: "rollup-job-2",
    seqNo: 2,
    primaryTerm: 2,
    rollup: {
      source_index: "Pricehistory",
      target_index: "All-history",
      schedule: {
        interval: {
          period: 1,
          unit: "Days",
        },
      },
      run_as_user: "dbbaughe",
      roles: ["admin"],
      description: "Rolls up our daily indices into monthly summarized views",
      enabled: false,
      error_notification: {
        destination: { slack: { url: "..." } },
        message_template: { source: "..." },
      },
      page_size: 200,
      delay: "6h",
      dimensions: {
        date_histogram: {
          field: "timestamp",
          fixed_interval: "30d",
          timezone: "America/Los_Angeles",
        },
        terms: {
          fields: ["customer_city"],
        },
      },
      metrics: [
        {
          field: "price",
          metric_aggregations: ["avg", "min", "max", "sum"],
        },
      ],
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

  render() {
    const { totalRollups, from, size, search, sortField, sortDirection, selectedItems, rollups, loadingRollups } = this.state;

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

    const selection: EuiTableSelectionType<RollupItem> = {
      onSelectionChange: this.onSelectionChange,
    };

    //TODO: Add action buttons here
    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {({ onShow }) => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Disable",
                    buttonProps: {
                      disabled: !selectedItems.length,
                      onClick: () => this.onDisable,
                    },
                  },
                  {
                    text: "Enable",
                    buttonProps: {
                      disabled: !selectedItems.length,
                      onClick: () => this.onEnable,
                    },
                  },
                  {
                    text: "Actions",
                    buttonProps: {
                      iconType: "arrowDown",
                      iconSide: "right",
                      disabled: !selectedItems.length,
                      // onClick: () => onShow(ApplyPolicyModal, { indices: selectedItems.map((item: RollupItem) => item.id) }),
                    },
                  },

                  {
                    text: "Create rollup job",
                    buttonProps: {
                      onClick: () => this.onClickCreate(),
                      fill: true,
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Rollup jobs"
      >
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
          itemId="id"
          items={rollups}
          noItemsMessage={<RollupEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingRollups} resetFilters={this.resetFilters} />}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}
