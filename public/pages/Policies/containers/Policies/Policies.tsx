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
import { RouteComponentProps } from "react-router-dom";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
// @ts-ignore
import { EuiBasicTable, EuiHorizontalRule, EuiLink } from "@elastic/eui";
import _ from "lodash";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import PolicyControls from "../../components/PolicyControls";
import PolicyEmptyPrompt from "../../components/PolicyEmptyPrompt";
import PolicyModal from "../../../../components/PolicyModal";
import { ModalConsumer } from "../../../../components/Modal";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import { PoliciesQueryParams, PolicyItem } from "../../models/interfaces";
import { getURLQueryParams, renderTime } from "../../utils/helpers";
import { BREADCRUMBS, ROUTES, SortDirection } from "../../../../utils/constants";
import { PolicyService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { TableParams } from "../../../../models/interfaces";
import ConfirmationModal from "../../../../components/ConfirmationModal";

interface PoliciesProps extends RouteComponentProps {
  policyService: PolicyService;
}

interface PoliciesState {
  totalPolicies: number;
  from: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: SortDirection;
  selectedItems: PolicyItem[];
  policies: PolicyItem[];
  loadingPolicies: boolean;
}

export default class Policies extends Component<PoliciesProps, PoliciesState> {
  columns: object[];

  constructor(props: PoliciesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalPolicies: 0,
      from,
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
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
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
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: PoliciesProps, prevState: PoliciesState) {
    const prevQuery = Policies.getQueryObjectFromState(prevState);
    const currQuery = Policies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: PoliciesState): PoliciesQueryParams {
    return { from, size, search, sortField, sortDirection };
  }

  getPolicies = async (): Promise<void> => {
    this.setState({ loadingPolicies: true });
    try {
      const { policyService, history } = this.props;
      const queryParamsString = queryString.stringify(Policies.getQueryObjectFromState(this.state));
      history.replace({ ...this.props.location, search: queryParamsString });
      const getPoliciesResponse = await policyService.getPolicies(queryParamsString);
      if (getPoliciesResponse.ok) {
        const {
          response: { policies, totalPolicies },
        } = getPoliciesResponse;
        this.setState({ policies, totalPolicies });
      } else {
        toastNotifications.addDanger(getPoliciesResponse.error);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem loading the policies"));
    }
    this.setState({ loadingPolicies: false });
  };

  deletePolicy = async (policyId: string): Promise<boolean> => {
    const { policyService } = this.props;
    try {
      const deletePolicyResponse = await policyService.deletePolicy(policyId);
      if (deletePolicyResponse.ok) {
        toastNotifications.addSuccess(`Deleted the policy: ${policyId}`);
        return true;
      } else {
        toastNotifications.addDanger(`Failed to delete the policy, ${deletePolicyResponse.error}`);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "There was a problem deleting the policy"));
    }
    return false;
  };

  onTableChange = ({ page: tablePage, sort }: TableParams): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: PolicyItem[]): void => {
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

  onClickEdit = (): void => {
    const {
      selectedItems: [{ id }],
    } = this.state;
    if (id) this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${id}`);
  };

  onClickCreate = (): void => {
    this.props.history.push(ROUTES.CREATE_POLICY);
  };

  onClickDelete = async (policyIds: string[]): Promise<void> => {
    if (!policyIds.length) return;

    const deletePromises = policyIds.map(policyId => this.deletePolicy(policyId));

    const deleted = (await Promise.all(deletePromises)).reduce((deleted: boolean, result: boolean) => deleted && result);
    if (deleted) await this.getPolicies();
  };

  onClickModalEdit = (item: PolicyItem, onClose: () => void): void => {
    onClose();
    if (!item || !item.id) return;
    this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${item.id}`);
  };

  render() {
    const { totalPolicies, from, size, search, sortField, sortDirection, selectedItems, policies, loadingPolicies } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalPolicies,
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
        buttonProps: { disabled: !selectedItems.length },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(ConfirmationModal, {
              title: `Delete ${selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`}`,
              bodyMessage: `Delete ${
                selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`
              } permanently? This action cannot be undone.`,
              actionMessage: "Delete",
              onAction: () => this.onClickDelete(selectedItems.map(item => item.id)),
            }),
        },
      },
      {
        text: "Edit",
        buttonProps: {
          disabled: selectedItems.length !== 1,
          onClick: this.onClickEdit,
        },
      },
      {
        text: "Create policy",
        buttonProps: {
          onClick: this.onClickCreate,
        },
      },
    ];

    return (
      <ContentPanel actions={<ContentPanelActions actions={actions} />} bodyStyles={{ padding: "initial" }} title="Index policies">
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
          itemId="id"
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
