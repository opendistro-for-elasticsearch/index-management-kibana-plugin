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
import { IHttpResponse, IHttpService } from "angular";
import { RouteComponentProps } from "react-router";
import { toastNotifications } from "ui/notify";
// @ts-ignore
import queryString from "query-string";
// @ts-ignore
import { EuiBasicTable, EuiHorizontalRule, EuiLink } from "@elastic/eui";
import _ from "lodash";
import { ContentPanel, ContentPanelActions } from "../../../components/ContentPanel";
import PolicyControls from "../components/PolicyControls/PolicyControls";
import PolicyEmptyPrompt from "../components/PolicyEmptyPrompt/PolicyEmptyPrompt";
import PolicyModal from "../../../components/PolicyModal";
import { ModalConsumer } from "../../../components/Modal";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../utils/constants";
import { PolicyItem } from "../models/interfaces";
import { getURLQueryParams, renderTime } from "../utils/helpers";
import { DeletePolicyResponse, GetPoliciesResponse } from "../../../../server/models/interfaces";
import { ServerResponse } from "../../../../server/models/types";
import { PLUGIN_NAME } from "../../../utils/constants";

interface PoliciesProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface PoliciesState {
  totalPolicies: number;
  page: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: PolicyItem[];
  policies: PolicyItem[];
  loadingPolicies: boolean;
}

class Policies extends Component<PoliciesProps, PoliciesState> {
  columns: object[];
  static getItemId = (item: PolicyItem) => `${item.id}`;

  constructor(props: PoliciesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalPolicies: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      policies: [],
      loadingPolicies: true,
    };

    this.getPolicies = _.debounce(this.getPolicies, 500, { leading: true });

    this.columns = [
      {
        field: "id",
        name: "Policy",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
        render: (name: string, item: PolicyItem) => (
          <ModalConsumer>
            {({ onShow, onClose }) => (
              <EuiLink
                onClick={() =>
                  onShow(PolicyModal, { policyId: item.id, policy: item.policy, onEdit: () => this.onClickModalEdit(item, onClose) })
                }
              >
                {name}
              </EuiLink>
            )}
          </ModalConsumer>
        ),
      },
      {
        field: "policy.policy.description",
        name: "Description",
        sortable: false,
        truncateText: true,
        textOnly: true,
        width: "150px",
      },
      {
        field: "affectedIndices",
        name: "Number of affected indices",
        sortable: false,
        truncateText: false,
        width: "100px",
        render: () => "#",
      },
      {
        field: "policy.policy.last_updated_time",
        name: "Last updated time",
        sortable: true,
        truncateText: false,
        render: renderTime,
        dataType: "date",
        width: "150px",
      },
    ];
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([{ text: "Index Management", href: "#/" }, { text: "Policies", href: "#/policies" }]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: PoliciesProps, prevState: PoliciesState) {
    const prevQuery = Policies.getQueryObjectFromState(prevState);
    const currQuery = Policies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
    }
  }

  static getQueryObjectFromState({ page, size, search, sortField, sortDirection }: PoliciesState) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
    };
  }

  getPolicies = async (): Promise<void> => {
    this.setState({ loadingPolicies: true });
    try {
      const { httpClient, history } = this.props;
      const { page, size, search, sortField, sortDirection } = this.state;
      const params = { from: page * size, size, search, sortField, sortDirection };
      const queryParamsString = queryString.stringify(params);
      history.replace({ ...this.props.location, search: queryParamsString });
      const response = (await httpClient.get(`../api/ism/policies?${queryString.stringify(params)}`)) as IHttpResponse<
        ServerResponse<GetPoliciesResponse>
      >;
      if (response.data.ok) {
        const {
          data: {
            response: { policies, totalPolicies },
          },
        } = response;
        this.setState({ policies, totalPolicies });
      } else {
        toastNotifications.addDanger(response.data.error);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem loading the policies");
    }
    this.setState({ loadingPolicies: false });
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

  onSelectionChange = (selectedItems: PolicyItem[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ page: 0, search: e.target.value });
  };

  deletePolicy = async (item: PolicyItem): Promise<void> => {
    const { httpClient } = this.props;
    try {
      const { id } = item;
      const response = (await httpClient.delete(`../api/ism/policies/${id}`)) as IHttpResponse<ServerResponse<DeletePolicyResponse>>;
      if (response.data.ok) {
        toastNotifications.addSuccess(`Deleted the policy: ${item.id}`);
      } else {
        toastNotifications.addDanger(`Failed to delete the policy, ${response.data.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem deleting the policy");
    }
  };

  onClickEdit = (): void => {
    const {
      selectedItems: [{ id }],
    } = this.state;
    if (id) this.props.history.push(`/edit-policy?id=${id}`);
  };

  onClickDelete = async (): Promise<void> => {
    const { selectedItems } = this.state;
    if (selectedItems.length !== 1) return;
    await this.deletePolicy(selectedItems[0]);
    await this.getPolicies();
  };

  onPageClick = (page: number): void => {
    this.setState({ page });
  };

  onClickModalEdit = (item: PolicyItem, onClose: () => void): void => {
    onClose();
    if (!item || !item.id) return;
    this.props.history.push(`/edit-policy?id=${item.id}`);
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  };

  render() {
    const { totalPolicies, page, size, search, sortField, sortDirection, selectedItems, policies, loadingPolicies } = this.state;

    const filterIsApplied = !!search;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(10000, totalPolicies),
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

    const actions = [
      {
        text: "Delete",
        disabled: selectedItems.length !== 1,
        onClick: this.onClickDelete,
      },
      {
        text: "Edit",
        disabled: selectedItems.length !== 1,
        onClick: this.onClickEdit,
      },
      {
        text: "Create policy",
        href: `${PLUGIN_NAME}#/create-policy`,
      },
    ];

    return (
      <ContentPanel actions={<ContentPanelActions actions={actions} />} bodyStyles={{ padding: "initial" }} title="Policies">
        <PolicyControls
          activePage={page}
          pageCount={Math.ceil(totalPolicies / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getPolicies}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId={Policies.getItemId}
          items={policies}
          noItemsMessage={
            <PolicyEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingPolicies} resetFilters={this.resetFilters} />
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

export default Policies;
