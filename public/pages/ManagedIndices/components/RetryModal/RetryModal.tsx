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
import _ from "lodash";
import { IHttpResponse, IHttpService } from "angular";
import { toastNotifications } from "ui/notify";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiRadioGroup,
  EuiSelect,
  EuiText,
  EuiSpacer,
} from "@elastic/eui";
import { ManagedIndexItem, State } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { RetryManagedIndexResponse } from "../../../../../server/models/interfaces";

interface RetryModalProps {
  httpClient: IHttpService;
  retryItems: ManagedIndexItem[];
  onClose: () => void;
}

interface RetryModalState {
  radioIdSelected: string;
  stateSelected: string;
}

type RadioItem = { id: string; label: string };
const FROM_CURRENT_RADIO: RadioItem = { id: "from-current", label: "Retry policy from current action" };
const FROM_STATE_RADIO: RadioItem = { id: "from-state", label: "Retry policy from selected state" };
const RADIOS: RadioItem[] = [FROM_CURRENT_RADIO, FROM_STATE_RADIO];

export default class RetryModal extends Component<RetryModalProps, RetryModalState> {
  constructor(props: RetryModalProps) {
    super(props);

    this.state = {
      radioIdSelected: FROM_CURRENT_RADIO.id,
      stateSelected: "",
    };
  }

  onRetry = async (): Promise<void> => {
    const { radioIdSelected, stateSelected } = this.state;
    const { retryItems, onClose } = this.props;
    try {
      const body = { index: retryItems.map(item => item.index), state: radioIdSelected == FROM_STATE_RADIO.id ? stateSelected : null };
      const response = (await this.props.httpClient.post("../api/ism/retry", body)) as IHttpResponse<
        ServerResponse<RetryManagedIndexResponse>
      >;
      if (response.data.ok) {
        const {
          data: {
            response: { updatedIndices, failedIndices, failures },
          },
        } = response;
        if (failures) {
          toastNotifications.addDanger(
            `Failed to retry: ${failedIndices.map(failedIndex => `[${failedIndex.indexName}, ${failedIndex.reason}]`).join(", ")}`
          );
        }
        // TODO: backend should always return updated_indices
        if (updatedIndices) {
          toastNotifications.addSuccess(`Retried ${updatedIndices} managed indices`);
        }
      } else {
        toastNotifications.addDanger(response.data.error);
      }
      onClose();
    } catch (err) {
      toastNotifications.addDanger(err.message || err.data.message || "There was a problem retrying managed indices");
    }
  };

  onChange = (optionId: string) => {
    this.setState({ radioIdSelected: optionId });
  };

  onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ stateSelected: e.target.value });
  };

  render() {
    const { radioIdSelected, stateSelected } = this.state;
    const { retryItems, onClose } = this.props;

    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Retry policy</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiRadioGroup options={RADIOS} idSelected={radioIdSelected} onChange={this.onChange} />

            <EuiSpacer size="s" />

            <EuiText size="xs">
              <strong>Start state</strong>
            </EuiText>
            <EuiSelect
              disabled={radioIdSelected !== "from-state"}
              // @ts-ignore
              options={_.uniqBy(
                _.flatten(
                  retryItems.map(item => {
                    if (!item.policy || !item.policy.states) return [];
                    return item.policy.states.map((state: State) => ({ value: state.name, text: state.name }));
                  })
                ),
                "value"
              )}
              value={stateSelected}
              onChange={this.onSelectChange}
              aria-label="Use aria labels when no actual label is in use"
            />
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={onClose}>Close</EuiButtonEmpty>

            <EuiButton onClick={this.onRetry} fill>
              Retry
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
