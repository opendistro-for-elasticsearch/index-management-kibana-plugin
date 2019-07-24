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

import React from "react";
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCodeBlock,
} from "@elastic/eui";

interface InfoModalProps {
  info: object;
  onClose: () => void;
}

const InfoModal = ({ info, onClose }: InfoModalProps) => (
  <EuiOverlayMask>
    {/*
      // @ts-ignore */}
    <EuiModal onCancel={onClose} onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Managed Index Info</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiCodeBlock language="json" fontSize="m">
          {JSON.stringify(info, null, 4)}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton fill onClick={onClose}>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export default InfoModal;
