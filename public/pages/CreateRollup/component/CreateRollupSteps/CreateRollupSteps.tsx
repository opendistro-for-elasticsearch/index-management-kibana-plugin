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
import React, { ChangeEvent } from "react";
import { EuiSteps, EuiText, EuiCode, EuiSpacer } from "@elastic/eui";

interface CreateRollupStepsProps {
  rollupId: string;
  rollupIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}
const setOfSteps = [
  {
    title: "Choose indices",
    children: "",
  },
  {
    title: "Define histogram and metrics",
    children: "",
  },
  {
    title: "Specify schedule, roles, and notifications",
    children: "",
  },
  {
    title: "Review and create",
    children: "",
  },
];

const CreateRollupSteps = ({ isEdit, rollupId, rollupIdError, onChange }: CreateRollupStepsProps) => (
  <div style={{ paddingLeft: "10px" }}>
    <EuiSteps steps={setOfSteps} headingElement="h4" />
  </div>
);

export default CreateRollupSteps;
