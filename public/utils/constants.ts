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

export const PLUGIN_NAME = "opendistro_index_management_kibana";

export const DEFAULT_EMPTY_DATA = "-";

export const DOCUMENTATION_URL = "https://opendistro.github.io/for-elasticsearch-docs/docs/ism/";

export const ROUTES = Object.freeze({
  CHANGE_POLICY: "/change-policy",
  CREATE_POLICY: "/create-policy",
  EDIT_POLICY: "/edit-policy",
  MANAGED_INDICES: "/managed-indices",
  INDEX_POLICIES: "/index-policies",
  INDICES: "/indices",
  ROLLUPS: "/rollups",
  CREATE_ROLLUP: "/create-rollup",
  EDIT_ROLLUP: "/edit-rollup",
  ROLLUP_DETAILS: "/rollup-details",
  TRANSFORMS: "/transforms",
  CREATE_TRANSFORM: "/create-transform",
  EDIT_TRANSFORM: "/edit-transform",
  TRANSFORM_DETAILS: "/transform-details",
});

export const BREADCRUMBS = Object.freeze({
  INDEX_MANAGEMENT: { text: "Index Management", href: "#/" },
  INDICES: { text: "Indices", href: `#${ROUTES.INDICES}` },
  INDEX_POLICIES: { text: "Index policies", href: `#${ROUTES.INDEX_POLICIES}` },
  MANAGED_INDICES: { text: "Managed indices", href: `#${ROUTES.MANAGED_INDICES}` },
  EDIT_POLICY: { text: "Edit policy" },
  CREATE_POLICY: { text: "Create policy" },
  CHANGE_POLICY: { text: "Change policy" },
  ROLLUPS: { text: "Rollup jobs", href: `#${ROUTES.ROLLUPS}` },
  CREATE_ROLLUP: { text: "Create rollup job" },
  EDIT_ROLLUP: { text: "Edit rollup job" },
  ROLLUP_DETAILS: { text: "Rollup details" },
  TRANSFORMS: { text: "Transform jobs", href: `#${ROUTES.TRANSFORMS}` },
  CREATE_TRANSFORM: { text: "Create transform job" },
  EDIT_TRANSFORM: { text: "Edit transform job" },
  TRANSFORM_DETAILS: { text: "Transform details" },
});

// TODO: Kibana EUI has a SortDirection already
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}
