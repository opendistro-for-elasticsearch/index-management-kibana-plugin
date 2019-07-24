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

import React, { ComponentType } from "react";
import { BrowserServices } from "../../models/interfaces";
import { ModalConsumer } from "./Modal";

interface ModalRootProps {
  services: BrowserServices;
}

// All modals will have access to the BrowserServices if they need it
const ModalRoot: React.SFC<ModalRootProps> = ({ services }) => (
  <ModalConsumer>
    {({
      component: Komponent,
      props,
      onClose,
    }: {
      component: ComponentType<{ onClose: () => void; services: BrowserServices }> | null;
      props: object;
      onClose: () => void;
    }) => (Komponent ? <Komponent {...props} onClose={onClose} services={services} /> : null)}
  </ModalConsumer>
);

export default ModalRoot;
