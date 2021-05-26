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

import React from "react";
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";
import {PLUGIN_NAME, ROUTES} from "../../../../utils/constants";

interface TransformEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
}

export const TEXT = {
  RESET_FILTERS: "There are no transform jobs matching your applied filters. Reset your filters to view your transform jobs.",
  NO_TRANSFORMS:
    "Transform jobs help you create a materialized view on top of existing data.",
  LOADING: "Loading transform jobs...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: TransformEmptyPromptProps) => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_TRANSFORMS;
};

const getActions: React.SFC<TransformEmptyPromptProps> = ({ filterIsApplied, loading, resetFilters }) => {
  if (loading) {
    return null;
  }

  if (filterIsApplied) {
    return (
      <EuiButton fill onClick={resetFilters} data-test-subj="transformEmptyPromptRestFilters">
        Reset Filters
      </EuiButton>
    );
  }

  return (
    <EuiButton href={`${PLUGIN_NAME}#${ROUTES.CREATE_TRANSFORM}`} data-test-subj="emptyPromptCreateTransformButton">
      Create transform
    </EuiButton>
  );
};

const TransformEmptyPrompt: React.SFC<TransformEmptyPromptProps> = (props) => (
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

export default TransformEmptyPrompt;
