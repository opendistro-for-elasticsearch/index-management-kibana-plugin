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

import React from "react";
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiText,
} from "@elastic/eui";
import { wrapQuotesAroundTransformId } from "../../../CreateTransform/utils/helpers";

interface ErrorModalProps {
  metadata: object;
  onClose: () => void;
}

const ErrorModal = ({ metadata, onClose }: ErrorModalProps) => (
  <EuiOverlayMask>
    {/*
      // @ts-ignore */}
    <EuiModal onCancel={onClose} onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText>
          {wrapQuotesAroundTransformId(metadata.transform_metadata.transform_id, metadata.transform_metadata.failure_reason)}
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton fill onClick={onClose} data-test-subj="errorModalCloseButton">
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export default ErrorModal;
