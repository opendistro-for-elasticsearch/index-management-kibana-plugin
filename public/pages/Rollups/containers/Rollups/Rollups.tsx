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
import { getURLQueryParams } from "../../../Indices/utils/helpers";
import _ from "lodash";
import chrome from "ui/chrome";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { IndicesQueryParams } from "../../../Indices/models/interfaces";
import queryString from "query-string";
import { toastNotifications } from "ui/notify";
import { getErrorMessage } from "../../../../utils/helpers";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../../Indices/utils/constants";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import ApplyPolicyModal from "../../../Indices/components/ApplyPolicyModal";
import IndexControls from "../../../Indices/components/IndexControls";
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
} from "@elastic/eui";
import { rollupsColumns } from "../../utils/constants";
import { RollupService } from "../../../../services";
import RollupEmptyPrompt from "../../components/RollupEmptyPrompt";
import EuiRefreshPicker from "../../../../temporary/EuiRefreshPicker";

interface RollupsProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface RollupsState {
  totalRollups: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof ManagedCatIndex;
  sortDirection: Direction;
  selectedItems: ManagedCatIndex[];
  rollups: ManagedCatIndex[];
  loadingRollups: boolean;
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
      loadingRollups: true,
    };

    this.getRollups = _.debounce(this.getRollups, 500, { leading: true });
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    await this.getRollups();
  }

  async componentDidUpdate(prevProps: RollupsProps, prevState: RollupsState) {
    const prevQuery = Rollups.getQueryObjectFromState(prevState);
    const currQuery = Rollups.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getRollups();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: RollupsState): IndicesQueryParams {
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

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ManagedCatIndex[]): void => {
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

    const sorting: EuiTableSortingType<ManagedCatIndex> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ManagedCatIndex> = {
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
                      onClick: () => onShow(ApplyPolicyModal, { indices: selectedItems.map((item: ManagedCatIndex) => item.index) }),
                    },
                  },
                  {
                    text: "Enable",
                    buttonProps: {
                      disabled: !selectedItems.length,
                      onClick: () => onShow(ApplyPolicyModal, { indices: selectedItems.map((item: ManagedCatIndex) => item.index) }),
                    },
                  },
                  {
                    text: "Actions",
                    buttonProps: {
                      iconType: "arrowDown",
                      iconSide: "right",
                      disabled: !selectedItems.length,
                      onClick: () => onShow(ApplyPolicyModal, { indices: selectedItems.map((item: ManagedCatIndex) => item.index) }),
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
          itemId="index"
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
