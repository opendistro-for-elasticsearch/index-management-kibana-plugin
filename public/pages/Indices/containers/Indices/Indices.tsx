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
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import _ from "lodash";
import { RouteComponentProps } from "react-router";
// @ts-ignore
import queryString from "query-string";
// @ts-ignore
import { EuiBasicTable, EuiHorizontalRule } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import IndexControls from "../../components/IndexControls";
import AddPolicyModal from "../../components/AddPolicyModal";
import IndexEmptyPrompt from "../../components/IndexEmptyPrompt";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS, indicesColumns } from "../../utils/constants";
import { ModalConsumer } from "../../../../components/Modal";
import IndexService from "../../../../services/IndexService";
import { TableParams } from "../../../../models/interfaces";
import { CatIndex } from "../../../../../server/models/interfaces";
import { getURLQueryParams } from "../../utils/helpers";
import { PoliciesQueryParams } from "../../models/interfaces";
import { BREADCRUMBS } from "../../../../utils/constants";

interface IndicesProps extends RouteComponentProps {
  indexService: IndexService;
}

interface IndicesState {
  totalIndices: number;
  from: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: CatIndex[];
  indices: CatIndex[];
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
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES]);
    await this.getIndices();
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = Indices.getQueryObjectFromState(prevState);
    const currQuery = Indices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: IndicesState): PoliciesQueryParams {
    return { from, size, search, sortField, sortDirection };
  }

  getIndices = async (): Promise<void> => {
    this.setState({ loadingIndices: true });
    try {
      const { indexService, history } = this.props;
      const { from, size, search, sortField, sortDirection } = this.state;
      const params = { from, size, search, sortField, sortDirection };
      const queryParamsString = queryString.stringify(params);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getIndicesResponse = await indexService.getIndices(queryParamsString);
      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        this.setState({ indices, totalIndices });
      } else {
        toastNotifications.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem LOADING the indices, please try again.");
    }
    this.setState({ loadingIndices: false });
  };

  onTableChange = ({ page: tablePage, sort }: TableParams): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: CatIndex[]): void => {
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

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalIndices,
    };

    const sorting = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection = {
      onSelectionChange: this.onSelectionChange,
      selectableMessage: (selectable: boolean) => (selectable ? undefined : undefined),
    };

    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {({ onShow }) => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Add policy",
                    disabled: !selectedItems.length,
                    onClick: () => onShow(AddPolicyModal, { indices: selectedItems.map((item: CatIndex) => item.index) }),
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
