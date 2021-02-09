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

import { IndexManagementSection, RegisterIndexManagementSectionArgs } from "../components/IndexManagementSection";
import { Capabilities } from "../../../../../../src/core/types";

export interface MainSectionsStartPrivate {
  getSectionsEnabled: () => IndexManagementSection[];
}

export interface MainSectionsServiceStartDeps {
  capabilities: Capabilities;
}

export interface MainSectionsServiceSetup {
  register: (args: Omit<RegisterIndexManagementSectionArgs, "capabilities">) => IndexManagementSection;
  section: DefinedSections;
}

export interface MainSectionsServiceStart {
  getSectionsEnabled: () => IndexManagementSection[];
}

export enum Navigation {
  IndexManagement = "Index Management",
  RollupJobs = "Rollup Jobs",
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

export enum IndexManagementSectionId {
  RollupJobs = "rollupJobs",
  TransformJobs = "transformJobs",
  StateManagementPolicies = "stateManagementPolicies",
  Indices = "indices",
}

export interface DefinedSections {
  rollupJobs: IndexManagementSection;
  transformJobs: IndexManagementSection;
  stateManagementPolicies: IndexManagementSection;
  indices: IndexManagementSection;
}

export const RollupJobsSection = {
  id: IndexManagementSectionId.RollupJobs,
  title: Navigation.RollupJobs,
  order: 1,
  // href: `#${Pathname.RollupJobs}`,
};

export const TransformJobsSection = {
  id: IndexManagementSectionId.TransformJobs,
  title: Navigation.TransformJobs,
  order: 2,
  href: `#${Pathname.TransformJobs}`,
};

export const StateManagementPoliciesSection = {
  id: IndexManagementSectionId.StateManagementPolicies,
  title: Navigation.StateManagementPolicies,
  order: 3,
  href: `#${Pathname.StateManagementPolicies}`,
};

export const IndicesSection = {
  id: IndexManagementSectionId.Indices,
  title: Navigation.Indices,
  order: 4,
};

export const PolicyManagedIndicesSection = {
  id: "policyManagedIndices",
  title: Navigation.PolicyManagedIndices,
  order: 4,
  href: `#${Pathname.PolicyManagedIndices}`,
};

export const IndexManagementSections = [RollupJobsSection, TransformJobsSection, StateManagementPoliciesSection, IndicesSection];
