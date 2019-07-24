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
import { toastNotifications } from "ui/notify";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router";
import { IHttpResponse, IHttpService } from "angular";
// @ts-ignore
import { EuiBasicTable, EuiHorizontalRule, EuiLink } from "@elastic/eui";
// @ts-ignore
import queryString from "query-string";
import _ from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import ManagedIndexActions from "../../components/ManagedIndexActions";
import ManagedIndexControls from "../../components/ManagedIndexControls";
import ManagedIndexEmptyPrompt from "../../components/ManagedIndexEmptyPrompt";
import { ACTIONS, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import { DEFAULT_EMPTY_DATA } from "../../../../utils/constants";
import InfoModal from "../../components/InfoModal";
import PolicyModal from "../../../../components/PolicyModal";
import { ModalConsumer } from "../../../../components/Modal";
import { getURLQueryParams } from "../../utils/helpers";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { GetManagedIndicesResponse } from "../../../../../server/models/interfaces";

interface ManagedIndicesProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface ManagedIndicesState {
  totalManagedIndices: number;
  page: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: ManagedIndexItem[];
  managedIndices: ManagedIndexItem[];
  loadingManagedIndices: boolean;
}

export default class ManagedIndices extends Component<ManagedIndicesProps, ManagedIndicesState> {
  columns: object[];

  constructor(props: ManagedIndicesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalManagedIndices: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      managedIndices: [],
      loadingManagedIndices: true,
    };

    this.getManagedIndices = _.debounce(this.getManagedIndices, 500, { leading: true });

    this.columns = [
      {
        field: "index",
        name: "Index",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
      },
      {
        field: "policyId",
        name: "Policy",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
        render: this.renderPolicyId,
      },
      {
        field: "managedIndexMetaData.state.name",
        name: "State",
        sortable: false,
        truncateText: false,
        width: "150px",
        // @ts-ignore
        render: (state: string) => _.defaultTo(state, DEFAULT_EMPTY_DATA),
      },
      {
        field: "managedIndexMetaData.action.name",
        name: "Action",
        sortable: false,
        truncateText: false,
        width: "150px",
        // @ts-ignore
        render: (action: string) => _.defaultTo(ACTIONS[action], DEFAULT_EMPTY_DATA),
      },
      {
        field: "managedIndexMetaData.info",
        name: "Info",
        sortable: false,
        truncateText: true,
        textOnly: true,
        width: "150px",
        render: (info: object) => (
          <ModalConsumer>
            {({ onShow }) => <EuiLink onClick={() => onShow(InfoModal, { info })}>{_.get(info, "message", DEFAULT_EMPTY_DATA)}</EuiLink>}
          </ModalConsumer>
        ),
      },
      {
        field: "index", // we don't care about the field as we're using the whole item in render
        name: "Status",
        sortable: false,
        truncateText: false,
        width: "150px",
        render: (index: string, item: ManagedIndexItem) => {
          const { managedIndexMetaData } = item;
          if (!managedIndexMetaData) return "Initializing";
          const { policyCompleted, retryInfo } = managedIndexMetaData;
          if (policyCompleted) return "Completed";
          if (retryInfo && retryInfo.failed) return "Failed";
          return "Running";
        },
      },
    ];
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([{ text: "Index Management", href: "#/" }, { text: "Managed Indices", href: "#/managed-indices" }]);
    await this.getManagedIndices();
  }

  async componentDidUpdate(prevProps: ManagedIndicesProps, prevState: ManagedIndicesState) {
    const prevQuery = ManagedIndices.getQueryObjectFromState(prevState);
    const currQuery = ManagedIndices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getManagedIndices();
    }
  }

  static getQueryObjectFromState({ page, size, search, sortField, sortDirection }: ManagedIndicesState) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
    };
  }

  renderPolicyId = (policyId: string, item: ManagedIndexItem) => {
    let errorMessage: string | undefined = undefined;
    if (!item.policy) {
      if (!item.managedIndexMetaData) errorMessage = `Still initializing, please wait a moment`;
      else errorMessage = `Failed to load the policy: ${item.policyId}`;
    }

    return (
      <ModalConsumer>
        {({ onShow, onClose }) => (
          <EuiLink
            onClick={() =>
              onShow(PolicyModal, {
                policyId: policyId,
                policy: item.policy,
                onEdit: () => this.onClickModalEdit(item, onClose),
                errorMessage,
              })
            }
          >
            {policyId}
          </EuiLink>
        )}
      </ModalConsumer>
    );
  };

  getManagedIndices = async (): Promise<void> => {
    this.setState({ loadingManagedIndices: true });
    try {
      const { page, size, search, sortField, sortDirection } = this.state;
      const params = { from: page * size, size, search, sortField, sortDirection };
      const queryParamsString = queryString.stringify(params);
      const { httpClient, history } = this.props;
      history.replace({ ...this.props.location, search: queryParamsString });
      const response = (await httpClient.get(`../api/ism/managedIndices?${queryParamsString}`)) as IHttpResponse<
        ServerResponse<GetManagedIndicesResponse>
      >;
      if (response.data.ok) {
        const {
          data: {
            response: { managedIndices, totalManagedIndices },
          },
        } = response;
        this.setState({ managedIndices, totalManagedIndices });
      } else {
        toastNotifications.addDanger(response.data.error);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem loading the managed indices");
    }
    this.setState({ loadingManagedIndices: false });
  };

  onTableChange = ({
    page: tablePage,
    sort,
  }: {
    page: { index: number; size: number };
    sort: { field: string; direction: string };
  }): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ page, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ManagedIndexItem[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ page: 0, search: e.target.value });
  };

  onPageClick = (page: number): void => {
    this.setState({ page });
  };

  onClickModalEdit = (item: ManagedIndexItem, onClose: () => void): void => {
    onClose();
    if (!item || !item.policyId) return;
    this.props.history.push(`/edit-policy?id=${item.policyId}`);
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  };

  render() {
    const {
      totalManagedIndices,
      page,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      managedIndices,
      loadingManagedIndices,
    } = this.state;

    const filterIsApplied = !!search;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(10000, totalManagedIndices),
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
          <ManagedIndexActions
            isRemoveDisabled={true}
            onClickRemove={() => {}}
            isRetryDisabled={!selectedItems.length}
            isChangeDisabled={true}
            onClickChange={() => {}}
            selectedItems={selectedItems}
            httpClient={this.props.httpClient}
          />
        }
        bodyStyles={{ padding: "initial" }}
        title="Managed Indices"
      >
        <ManagedIndexControls
          activePage={page}
          pageCount={Math.ceil(totalManagedIndices / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getManagedIndices}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId="index"
          items={managedIndices}
          noItemsMessage={
            <ManagedIndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingManagedIndices} resetFilters={this.resetFilters} />
          }
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}
