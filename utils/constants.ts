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

export const BASE_API_PATH = "/api/ism";
export const NODE_API = Object.freeze({
  _SEARCH: `${BASE_API_PATH}/_search`,
  _INDICES: `${BASE_API_PATH}/_indices`,
  ADD_POLICY: `${BASE_API_PATH}/addPolicy`,
  POLICIES: `${BASE_API_PATH}/policies`,
  MANAGED_INDICES: `${BASE_API_PATH}/managedIndices`,
  RETRY: `${BASE_API_PATH}/retry`,
  CHANGE_POLICY: `${BASE_API_PATH}/changePolicy`,
  REMOVE_POLICY: `${BASE_API_PATH}/removePolicy`,
});

export const REQUEST = Object.freeze({
  PUT: "PUT",
  DELETE: "DELETE",
  GET: "GET",
  POST: "POST",
  HEAD: "HEAD",
});
