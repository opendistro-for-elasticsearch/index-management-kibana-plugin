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
import { RouteComponentProps } from "react-router-dom";
import {
  EuiBasicTable,
  EuiHorizontalRule,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  // @ts-ignore
  Criteria,
  EuiTableSortingType,
  Direction,
  // @ts-ignore
  Pagination,
  EuiTableSelectionType,
} from "@elastic/eui";
import queryString from "query-string";
import _ from "lodash";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import ManagedIndexControls from "../../components/ManagedIndexControls";
import ManagedIndexEmptyPrompt from "../../components/ManagedIndexEmptyPrompt";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, PLUGIN_NAME, ROUTES } from "../../../../utils/constants";
import InfoModal from "../../components/InfoModal";
import PolicyModal from "../../../../components/PolicyModal";
import { ModalConsumer } from "../../../../components/Modal";
import { getURLQueryParams } from "../../utils/helpers";
import { ManagedIndexItem } from "../../../../../models/interfaces";
import { ManagedIndexService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import RetryModal from "../../components/RetryModal";
import RolloverAliasModal from "../../components/RolloverAliasModal";
import { CoreServicesContext } from "../../../../components/core_services";

interface ManagedIndicesProps extends RouteComponentProps {
  managedIndexService: ManagedIndexService;
}

interface ManagedIndicesState {
  totalManagedIndices: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof ManagedIndexItem;
  sortDirection: Direction;
  selectedItems: ManagedIndexItem[];
  managedIndices: ManagedIndexItem[];
  loadingManagedIndices: boolean;
}

export default class ManagedIndices extends Component<ManagedIndicesProps, ManagedIndicesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<ManagedIndexItem>[];

  constructor(props: ManagedIndicesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      totalManagedIndices: 0,
      from,
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
        render: (index: string) => <span title={index}>{index}</span>,
      },
      {
        field: "indexUuid",
        name: "Index ID",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
        render: (indexUuid: string) => indexUuid || DEFAULT_EMPTY_DATA,
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
        render: (state: string) => state || DEFAULT_EMPTY_DATA,
      },
      {
        field: "managedIndexMetaData.action.name",
        name: "Action",
        sortable: false,
        truncateText: false,
        width: "150px",
        // @ts-ignore
        render: (action: string) => (
          <span style={{ textTransform: "capitalize" }}>{(action || DEFAULT_EMPTY_DATA).split("_").join(" ")}</span>
        ),
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
        name: "Job Status",
        sortable: false,
        truncateText: false,
        width: "150px",
        render: (index: string, item: ManagedIndexItem) => {
          const { managedIndexMetaData } = item;
          if (!managedIndexMetaData) return "Initializing";
          const { policyCompleted, retryInfo, action } = managedIndexMetaData;
          if (policyCompleted) return "Completed";
          if (retryInfo && retryInfo.failed) return "Failed";
          if (action && action.failed) return "Failed";
          return "Running";
        },
      },
    ];
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.POLICY_MANAGED_INDICES]);
    await this.getManagedIndices();
  }

  async componentDidUpdate(prevProps: ManagedIndicesProps, prevState: ManagedIndicesState) {
    const prevQuery = ManagedIndices.getQueryObjectFromState(prevState);
    const currQuery = ManagedIndices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getManagedIndices();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection }: ManagedIndicesState) {
    return { from, size, search, sortField, sortDirection };
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
      const { managedIndexService, history } = this.props;
      const queryObject = ManagedIndices.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getManagedIndicesResponse = await managedIndexService.getManagedIndices(queryObject);
      if (getManagedIndicesResponse.ok) {
        const {
          response: { managedIndices, totalManagedIndices },
        } = getManagedIndicesResponse;
        this.setState({ managedIndices, totalManagedIndices });
      } else {
        this.context.notifications.toasts.addDanger(getManagedIndicesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the managed indices"));
    }
    this.setState({ loadingManagedIndices: false });
  };

  onClickRemovePolicy = async (indices: string[]): Promise<void> => {
    try {
      if (!indices.length) return;
      const { managedIndexService } = this.props;
      const removePolicyResponse = await managedIndexService.removePolicy(indices);
      if (removePolicyResponse.ok) {
        const { updatedIndices, failedIndices, failures } = removePolicyResponse.response;
        if (updatedIndices) {
          this.context.notifications.toasts.addSuccess(`Removed policy from ${updatedIndices} managed indices`);
        }
        if (failures) {
          this.context.notifications.toasts.addDanger(
            `Failed to remove policy from ${failedIndices
              .map((failedIndex) => `[${failedIndex.indexName}, ${failedIndex.reason}]`)
              .join(", ")}`
          );
        }
      } else {
        this.context.notifications.toasts.addDanger(removePolicyResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem removing the policies"));
    }
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedIndexItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ManagedIndexItem[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ from: 0, search: e.target.value });
  };

  onPageClick = (page: number): void => {
    const { size } = this.state;
    this.setState({ from: page * size });
  };

  onClickModalEdit = (item: ManagedIndexItem, onClose: () => void): void => {
    onClose();
    if (!item || !item.policyId) return;
    this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${item.policyId}`);
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  };

  render() {
    const {
      totalManagedIndices,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      managedIndices,
      loadingManagedIndices,
    } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalManagedIndices,
    };

    const sorting: EuiTableSortingType<ManagedIndexItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ManagedIndexItem> = {
      onSelectionChange: this.onSelectionChange,
    };

    const isRetryDisabled =
      !selectedItems.length ||
      selectedItems.some((item): boolean => {
        if (!item.managedIndexMetaData) return true;
        const { retryInfo, action } = item.managedIndexMetaData;
        return !(retryInfo && retryInfo.failed) && !(action && action.failed);
      });

    const actions = [
      {
        text: "Edit rollover alias",
        buttonProps: { disabled: selectedItems.length !== 1 },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(RolloverAliasModal, {
              index: selectedItems[0].index,
              core: this.context,
            }),
        },
      },
      {
        text: "Remove policy",
        buttonProps: { disabled: !selectedItems.length },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(ConfirmationModal, {
              title: `Remove ${
                selectedItems.length === 1 ? `policy from ${selectedItems[0].index}` : `policies from ${selectedItems.length} indices`
              }`,
              bodyMessage: `Remove ${
                selectedItems.length === 1 ? `policy from ${selectedItems[0].index}` : `policies from ${selectedItems.length} indices`
              } permanently? This action cannot be undone.`,
              actionMessage: "Remove",
              onAction: () => this.onClickRemovePolicy(selectedItems.map((item) => item.index)),
            }),
        },
      },
      {
        text: "Retry policy",
        buttonProps: { disabled: isRetryDisabled },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(RetryModal, {
              retryItems: _.cloneDeep(selectedItems),
            }),
        },
      },
    ];

    return (
      <div style={{ padding: "0px 25px" }}>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem></EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton iconType="refresh" onClick={this.getManagedIndices} data-test-subj="refreshButton">
              Refresh
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton href={`${PLUGIN_NAME}#/change-policy`} data-test-subj="changePolicyButton">
              Change policy
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <ContentPanel
          actions={<ContentPanelActions actions={actions} />}
          bodyStyles={{ padding: "initial" }}
          title={"Policy managed indices" + " (" + `${totalManagedIndices}` + ")"}
        >
          <ManagedIndexControls
            activePage={page}
            pageCount={Math.ceil(totalManagedIndices / size) || 1}
            search={search}
            onSearchChange={this.onSearchChange}
            onPageClick={this.onPageClick}
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
            tableLayout="auto"
          />
        </ContentPanel>
      </div>
    );
  }
}
