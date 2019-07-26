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

import { ExplainAPIManagedIndexMetaData, QueryStringQuery } from "../models/interfaces";
import { MatchAllQuery } from "../models/types";
import { ManagedIndexMetaData } from "../../models/interfaces";

export function transformManagedIndexMetaData(metaData: ExplainAPIManagedIndexMetaData | undefined): ManagedIndexMetaData | null {
  if (!metaData) return null;
  // If this is not a managed index or we are still initializing we still return the
  // opendistro.index_state_management.policy_id setting, but nothing else from the explain API
  if (!metaData.index) return null;
  return {
    index: metaData.index,
    // We know indexUuid and policyName exist if index exists
    indexUuid: metaData.index_uuid as string,
    policyId: metaData.policy_id as string,
    policySeqNo: metaData.policy_seq_no,
    policyPrimaryTerm: metaData.policy_primary_term,
    policyCompleted: metaData.policy_completed,
    rolledOver: metaData.rolled_over,
    transitionTo: metaData.transition_to,
    state: metaData.state ? { name: metaData.state.name, startTime: metaData.state.start_time } : undefined,
    action: metaData.action
      ? {
          name: metaData.action.name,
          startTime: metaData.action.start_time,
          index: metaData.action.index,
          failed: metaData.action.failed,
          consumedRetries: metaData.action.consumed_retries,
        }
      : undefined,
    retryInfo: metaData.retry_info
      ? { failed: metaData.retry_info.failed, consumedRetries: metaData.retry_info.consumed_retries }
      : undefined,
    info: metaData.info,
  };
}

export function getMustQuery<T extends string>(field: T, search: string): MatchAllQuery | QueryStringQuery<T> {
  if (search.trim()) {
    return {
      query_string: {
        default_field: field,
        default_operator: "AND",
        query: `*${search
          .trim()
          .split(" ")
          .join("* *")}*`,
      },
    };
  }

  return { match_all: {} };
}
