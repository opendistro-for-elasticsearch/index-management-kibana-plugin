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
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ModalConsumer } from "../../../../components/Modal";
import RetryModal from "../RetryModal";
import { ManagedIndexItem } from "../../../../../models/interfaces";

interface ManagedIndexActionsProps {
  isRemoveDisabled: boolean;
  isRetryDisabled: boolean;
  isChangeDisabled: boolean;
  onClickRemove: () => void;
  onClickChange: () => void;
  selectedItems: ManagedIndexItem[];
}

export default class ManagedIndexActions extends Component<ManagedIndexActionsProps, object> {
  render() {
    const { isRemoveDisabled, isRetryDisabled, isChangeDisabled, onClickRemove, onClickChange, selectedItems } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isRemoveDisabled} onClick={onClickRemove} data-test-subj="removePolicyButton">
            Remove policy
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ModalConsumer>
            {({ onShow }) => (
              <EuiButton
                disabled={isRetryDisabled}
                // deep clone the selected items in case they have auto refresh turned on
                // this will only happen when they actually click retry so no performance concern
                onClick={() => onShow(RetryModal, { retryItems: _.cloneDeep(selectedItems) })}
                data-test-subj="retryPolicyButton"
              >
                Retry policy
              </EuiButton>
            )}
          </ModalConsumer>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={isChangeDisabled}
            onClick={onClickChange}
            // TODO change policy UI
            // href={`${PLUGIN_NAME}#/change-policy`}
            data-test-subj="changePolicyButton"
          >
            Change policy
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
