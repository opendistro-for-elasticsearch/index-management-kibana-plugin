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

import "@testing-library/react/cleanup-after-each";
import "@testing-library/jest-dom/extend-expect";
import { configure } from "@testing-library/react";

configure({ testIdAttribute: "data-test-subj" });

jest.mock("@elastic/eui/lib/components/form/form_row/make_id", () => () => "some_make_id");

jest.mock("@elastic/eui/lib/services/accessibility/html_id_generator", () => ({
  htmlIdGenerator: () => {
    return () => "some_html_id";
  },
}));

// @ts-ignore
window.Worker = function() {
  this.postMessage = () => {};
  // @ts-ignore
  this.terminate = () => {};
};

// @ts-ignore
window.URL = {
  createObjectURL: () => {
    return "";
  },
};

jest.mock("ui/notify", () => ({
  toastNotifications: {
    addDanger: jest.fn().mockName("addDanger"),
    addSuccess: jest.fn().mockName("addSuccess"),
  },
}));

jest.mock("ui/chrome", () => ({
  breadcrumbs: (() => {
    const breadcrumbs = () => {};
    // @ts-ignore
    breadcrumbs.set = jest.fn();
    // @ts-ignore
    breadcrumbs.push = jest.fn();
    return breadcrumbs;
  })(),
}));
