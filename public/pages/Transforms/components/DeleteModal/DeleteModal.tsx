/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { ChangeEvent, Component, Fragment } from "react";
import { EuiConfirmModal, EuiForm, EuiFormRow, EuiFieldText, EuiOverlayMask, EuiSpacer } from "@elastic/eui";

// TODO: Merge with Rollup to create generic component
interface DeleteModalProps {
  item: string;
  closeDeleteModal: (event?: any) => void;
  onClickDelete: (event?: any) => void;
}

interface DeleteModalState {
  confirmDeleteText: string;
}

export default class DeleteModal extends Component<DeleteModalProps, DeleteModalState> {
  state = { confirmDeleteText: "" };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ confirmDeleteText: e.target.value });
  };

  render() {
    const { item, closeDeleteModal, onClickDelete } = this.props;
    const { confirmDeleteText } = this.state;

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title="Delete job(s)"
          onCancel={closeDeleteModal}
          onConfirm={onClickDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText != "delete"}
        >
          <EuiForm>
            <Fragment>
              By deleting <strong>{item}</strong>, all future scheduled executions will be canceled. However, your target index
              and data in it will remain intact.
            </Fragment>
            <EuiSpacer size="s" />
            <EuiFormRow helpText="To confirm deletion, enter delete in the text field">
              <EuiFieldText value={confirmDeleteText} placeholder="delete" onChange={this.onChange} data-test-subj="deleteTextField" />
            </EuiFormRow>
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
