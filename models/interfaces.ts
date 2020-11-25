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

// TODO: Backend has PR out to change this model, this needs to be updated once that goes through

export interface ManagedIndexMetaData {
  index: string;
  indexUuid: string;
  policyId: string;
  policySeqNo?: number;
  policyPrimaryTerm?: number;
  policyCompleted?: boolean;
  rolledOver?: boolean;
  transitionTo?: string;
  state?: { name: string; startTime: number };
  action?: { name: string; startTime: number; index: number; failed: boolean; consumedRetries: number };
  retryInfo?: { failed: boolean; consumedRetries: number };
  info?: object;
}

/**
 * ManagedIndex item shown in the Managed Indices table
 */
export interface ManagedIndexItem {
  index: string;
  indexUuid: string;
  policyId: string;
  policySeqNo: number;
  policyPrimaryTerm: number;
  policy: Policy | null;
  enabled: boolean;
  managedIndexMetaData: ManagedIndexMetaData | null;
}

export interface IndexItem {
  index: string;
}

/**
 * Interface what the Policy Elasticsearch Document
 */
export interface DocumentPolicy {
  id: string;
  primaryTerm: number;
  seqNo: number;
  policy: Policy;
}

//Data model that contains both rollup item and metadata of rollup job
export interface DocumentRollup {
  _id: string;
  _seqNo: number;
  _primaryTerm: number;
  rollup: Rollup;
  metadata: any;
  //   {
  //   rollup_id: string;
  //   enabled: boolean;
  //   schedule: {
  //     interval?: {
  //       start_time?: number;
  //       period: number;
  //       unit: string;
  //     };
  //     cron?: {
  //       expression: string;
  //       timezone: string;
  //     };
  //   };
  //   last_updated_time: number;
  //   enabled_time: number | null;
  //   description: string;
  //   schema_version: number;
  //   source_index: string;
  //   target_index: string;
  //   metadata_id: number | null;
  //   roles: string[];
  //   page_size: number;
  //   delay: number | null;
  //   continuous: boolean;
  //   dimensions: RollupDimensionItem[];
  //   metrics: RollupMetricItem[];
  // };
}

// TODO: Fill out when needed
// TODO: separate a frontend Policy from backendPolicy
export interface Policy {
  description: string;
  default_state: string;
  states: State[];
}

export interface State {
  name: string;
  actions: object[];
  transitions: object[];
}

export interface Rollup {
  continuous: boolean;
  delay: number | null;
  description: string;
  dimensions: (DateHistogramItem | TermsItem | HistogramItem)[];
  enabled: boolean;
  enabledTime: number | null;
  lastUpdatedTime: number;
  metadata_id: string | null;
  metrics: MetricItem[];
  page_size: number;
  schedule: IntervalSchedule | CronSchedule;
  schemaVersion: number;
  source_index: string;
  target_index: string;
}

export interface RollupMetadata {
  metadata_id: string;
  rollup_metadata: {
    id: string;
    seq_no: number;
    primary_term: number;
    rollup_id: string;
    after_key: Map<String, any> | null;
    last_updated_time: number;
    continuous: {
      next_window_start_time: number;
      next_window_end_time: number;
    } | null;
    status: string;
    failure_reason: string | null;
    stats: {
      pages_processed: number | null;
      documents_processed: number | null;
      rollups_indexed: number | null;
      index_time_in_millis: number | null;
      search_time_in_millis: number | null;
    };
  };
}

export interface IntervalSchedule {
  startTime: number | null;
  period: number;
  unit: string;
}

export interface CronSchedule {
  expression: string;
  timezone: string;
}

//Frontend dimension data model
export interface DimensionItem {
  sequence: number;
  field: FieldItem;
  aggregationMethod: string;
  interval?: number;
}

//Frontend metric data model
export interface MetricItem {
  source_field: FieldItem;
  all: boolean;
  min: boolean;
  max: boolean;
  sum: boolean;
  avg: boolean;
  value_count: boolean;
}

export interface FieldItem {
  label: string;
  type?: string;
}

interface DateHistogramItem {
  sourceField: string;
  fixed_interval: string | null;
  calendar_interval: string | null;
  timezone: string;
}

interface TermsItem {
  terms: {
    source_field: string;
    target_field: string;
  };
}

interface HistogramItem {
  histogram: {
    source_field: string;
    target_field: string;
    interval: number;
  };
}

//Backend dimension data model
export type RollupDimensionItem = DateHistogramItem | TermsItem | HistogramItem;

//Backend metric data model
export interface RollupMetricItem {
  source_field: string;
  metrics: [
    {
      min?: Object;
      max?: Object;
      sum?: Object;
      avg?: Object;
      value_count?: Object;
    }
  ];
}
