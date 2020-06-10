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
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiFormRow,
  EuiFieldText,
} from "@elastic/eui";
import { BrowserServices } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreStart } from "kibana/public";

interface RolloverAliasModalProps {
  onClose: () => void;
  services: BrowserServices;
  index: string;
  core: CoreStart;
}

interface RolloverAliasModalState {
  rolloverAlias: string;
}

export default class RolloverAliasModal extends Component<RolloverAliasModalProps, RolloverAliasModalState> {
  state: RolloverAliasModalState = {
    rolloverAlias: "",
  };

  onEditRolloverAlias = async (): Promise<void> => {
    const {
      onClose,
      index,
      services: { indexService },
    } = this.props;
    const { rolloverAlias } = this.state;
    try {
      const response = await indexService.editRolloverAlias(index, rolloverAlias);
      if (response.ok) {
        if (response.response.acknowledged) {
          this.props.core.notifications.toasts.addSuccess(`Edited rollover alias on ${index}`);
        } else {
          this.props.core.notifications.toasts.addDanger(`Failed to edit rollover alias on ${index}`);
        }
      } else {
        this.props.core.notifications.toasts.addDanger(response.error);
      }
      onClose();
    } catch (err) {
      this.props.core.notifications.toasts.addDanger(getErrorMessage(err, `There was a problem editing rollover alias on ${index}`));
    }
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ rolloverAlias: e.target.value });
  };

  render() {
    const { rolloverAlias } = this.state;
    const { onClose } = this.props;
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Edit rollover alias</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiFormRow label="Rollover alias" helpText="A rollover alias is required when using the rollover action.">
              <EuiFieldText placeholder="Rollover alias" value={rolloverAlias} onChange={this.onChange} />
            </EuiFormRow>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={onClose} data-test-subj="editRolloverAliasModalCloseButton">
              Close
            </EuiButtonEmpty>

            <EuiButton onClick={this.onEditRolloverAlias} disabled={!rolloverAlias} fill data-test-subj="editRolloverAliasModalAddButton">
              Edit
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
