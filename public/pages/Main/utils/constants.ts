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
  RollupJobs = "Rollup jobs",
  TransformJobs = "Transform jobs",
  StateManagementPolicies = "State management policies",
  Indices = "Indices",
  HotIndices = "Hot indices",
  UltraWarmIndices = "UltraWarm indices",
  ColdIndices = "Cold indices",
  PolicyManagedIndices = "Policy managed indices",
  Console = "Console",
  SecurityPOC = "Security POC",
}

export enum Pathname {
  RollupJobs = "/rollup-jobs",
  TransformJobs = "/transform-jobs",
  StateManagementPolicies = "state-management-policies",
  Indices = "/indices",
  HotIndices = "hot-indices",
  UltraWarmIndices = "ultrawarm-indices",
  ColdIndices = "cold-indices",
  PolicyManagedIndices = "policy-managed-indices",
  Console = "/console",
  SecurityPOC = "/security-poc",
}
