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
import { EuiConfirmModal, EuiForm, EuiFormRow, EuiFieldText, EuiOverlayMask } from "@elastic/eui";

interface DeleteModalProps {
  rollupId: string;
  closeDeleteModal: (event?: any) => void;
}

const DeleteModal = ({ rollupId, closeDeleteModal }: DeleteModalProps) => (
  <EuiOverlayMask>
    <EuiConfirmModal
      title={`Delete job "${rollupId}"`}
      onCancel={closeDeleteModal}
      onConfirm={closeDeleteModal}
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      buttonColor="danger"
      defaultFocusedButton="confirm"
    >
      <EuiForm>
        <EuiFormRow helpText={"To confirm deletion, enter delete in the text field"}>
          <EuiFieldText></EuiFieldText>
        </EuiFormRow>
      </EuiForm>
    </EuiConfirmModal>
  </EuiOverlayMask>
);

export default DeleteModal;
