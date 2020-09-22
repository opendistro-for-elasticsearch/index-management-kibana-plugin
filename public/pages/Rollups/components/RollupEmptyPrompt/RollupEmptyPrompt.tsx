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
import { PLUGIN_NAME, ROUTES } from "../../../../utils/constants";

export const TEXT = {
  RESET_FILTERS: "There are no rollup jobs matching your applied filters. Reset your filters to view your rollup jobs.",
  NO_ROLLUPS: "There are no existing rollup jobs. Create a rollup job.",
  LOADING: "Loading rollup jobs...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: RollupEmptyPromptProps) => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_ROLLUPS;
};

const getActions: React.SFC<RollupEmptyPromptProps> = ({ filterIsApplied, loading, resetFilters }) => {
  if (loading) {
    return null;
  }
  if (filterIsApplied) {
    return (
      <EuiButton fill onClick={resetFilters} data-test-subj="policyEmptyPromptRestFilters">
        Reset Filters
      </EuiButton>
    );
  }

  return (
    <EuiButton fill href={`${PLUGIN_NAME}#${ROUTES.CREATE_ROLLUP}`}>
      Create rollup
    </EuiButton>
  );
};

interface RollupEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
}

const RollupEmptyPrompt: React.SFC<RollupEmptyPromptProps> = (props) => (
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

export default RollupEmptyPrompt;
