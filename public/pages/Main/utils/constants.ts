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

export enum Navigation {
  IndexManagement = "Index Management",
  IndexStateManagement = "Index state management",
  IndexPolicies = "Index Policies",
  ManagedIndices = "Managed Indices",
  Indices = "Indices",
  Rollups = "Rollup Jobs",
  Policies = "Policies",
  All = "All",
  HotIndices = "Hot indices",
  UltraWarmIndices = "UltraWarm indices",
  ColdIndices = "Cold indices",
  PolicyManagedIndices = "Policy managed indices",
  Console = "Console",
  SecurityPOC = "Security POC",
}

export enum Pathname {
  IndexPolicies = "/index-policies",
  ManagedIndices = "/managed-indices",
  Indices = "/indices",
  Rollups = "/rollups",
  Console = "/console",
  SecurityPOC = "/security-poc",
}
