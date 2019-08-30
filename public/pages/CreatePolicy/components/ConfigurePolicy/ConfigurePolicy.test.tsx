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
import { render } from "@testing-library/react";
import ConfigurePolicy from "./ConfigurePolicy";

describe("<ConfigurePolicy /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<ConfigurePolicy policyId="some_id" policyIdError="" isEdit={false} onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
