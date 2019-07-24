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
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import { PLUGIN_NAME } from "../../../../utils/constants";

const filterText = "There are no managed indices matching your applied filters. Reset your filters to view your managed indices.";
const emptyPolicyText = "There are no existing managed indices. Create a policy to add to an index.";
const loadingText = "Loading policies...";
const createPolicyButton = (
  <EuiButton fill href={`${PLUGIN_NAME}#/create-policy`}>
    Create policy
  </EuiButton>
);
const resetFiltersButton = (resetFilters: () => void) => (
  <EuiButton fill onClick={resetFilters}>
    Reset Filters
  </EuiButton>
);

const getMessagePrompt = ({ filterIsApplied, loading }: { filterIsApplied: boolean; loading: boolean }) => {
  if (loading) return loadingText;
  if (filterIsApplied) return filterText;
  return emptyPolicyText;
};

const getActions = ({
  filterIsApplied,
  loading,
  resetFilters,
}: {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
}) => {
  if (loading) return null;
  if (filterIsApplied) return resetFiltersButton(resetFilters);
  return createPolicyButton;
};

const ManagedIndexEmptyPrompt = (props: { filterIsApplied: boolean; loading: boolean; resetFilters: () => void }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: "45em" }}
    body={
      <EuiText>
        <p>{getMessagePrompt(props)}</p>
      </EuiText>
    }
    actions={getActions(props)}
  />
);

export default ManagedIndexEmptyPrompt;
