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
import { RouteComponentProps } from "react-router-dom";
import queryString from "querystring";
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
} from "@elastic/eui";
import { CoreStart } from "kibana/public";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import IndexControls from "../../components/IndexControls";
import ApplyPolicyModal from "../../components/ApplyPolicyModal";
import IndexEmptyPrompt from "../../components/IndexEmptyPrompt";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS, indicesColumns } from "../../utils/constants";
import { ModalConsumer } from "../../../../components/Modal";
import IndexService from "../../../../services/IndexService";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { getURLQueryParams } from "../../utils/helpers";
import { IndicesQueryParams } from "../../models/interfaces";
import { BREADCRUMBS } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";

interface IndicesProps extends RouteComponentProps {
  indexService: IndexService;
  core: CoreStart;
}

interface IndicesState {
  totalIndices: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof ManagedCatIndex;
  sortDirection: Direction;
  selectedItems: ManagedCatIndex[];
  indices: ManagedCatIndex[];
  loadingIndices: boolean;
}

export default class Indices extends Component<IndicesProps, IndicesState> {
  constructor(props: IndicesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalIndices: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      indices: [],
      loadingIndices: true,
    };

    this.getIndices = _.debounce(this.getIndices, 500, { leading: true });
  }

  async componentDidMount() {
    // chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
    this.props.core.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
    await this.getIndices();
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = Indices.getQueryObjectFromState(prevState);
    const currQuery = Indices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: IndicesState): IndicesQueryParams {
    return { from, size, search, sortField, sortDirection };
  }

  getIndices = async (): Promise<void> => {
    this.setState({ loadingIndices: true });
    try {
      const { indexService, history } = this.props;
      const queryObject = Indices.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getIndicesResponse = await indexService.getIndices(queryObject);
      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        this.setState({ indices, totalIndices });
      } else {
        this.props.core.notifications.toasts.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      this.props.core.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }
    this.setState({ loadingIndices: false });
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
    const { totalIndices, from, size, search, sortField, sortDirection, selectedItems, indices, loadingIndices } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalIndices,
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
    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {({ onShow }) => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Apply policy",
                    buttonProps: {
                      disabled: !selectedItems.length,
                      onClick: () => onShow(ApplyPolicyModal, { indices: selectedItems.map((item: ManagedCatIndex) => item.index) }),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="Indices"
      >
        <IndexControls
          activePage={page}
          pageCount={Math.ceil(totalIndices / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getIndices}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={indicesColumns}
          isSelectable={true}
          itemId="index"
          items={indices}
          noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}
