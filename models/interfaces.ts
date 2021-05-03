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

// Data model that contains both rollup item and metadata of rollup job
export interface DocumentRollup {
  _id: string;
  _seqNo: number;
  _primaryTerm: number;
  rollup: Rollup;
  metadata: any;
}

export interface DocumentTransform {
  _id: string;
  _seqNo: number;
  _primaryTerm: number;
  transform: Transform;
  metadata: any;
}

// TODO: Fill out when needed
// TODO: separate a frontend Policy from backendPolicy
export interface Policy {
  description: string;
  default_state: string;
  states: State[];
  ism_template: any;
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
  dimensions: RollupDimensionItem[];
  enabled: boolean;
  enabledTime: number | null;
  last_updated_time: number;
  metadata_id: string | null;
  metrics: MetricItem[];
  page_size: number;
  schedule: IntervalSchedule | CronSchedule;
  schema_version: number;
  source_index: string;
  target_index: string;
  roles: string[];
}

export interface RollupMetadata {
  metadata_id: string;
  rollup_metadata: {
    id: string;
    seq_no: number;
    primary_term: number;
    rollup_id: string;
    after_key: Map<string, any> | null;
    last_updated_time: number;
    continuous: {
      next_window_start_time: number | null;
      next_window_end_time: number | null;
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

export interface Transform {
  description: string;
  groups: RollupDimensionItem[];
  enabled: boolean;
  enabled_at: number | null;
  updated_at: number;
  metadata_id: string | null;
  aggregations: Map<String, any>;
  page_size: number;
  schedule: IntervalSchedule | CronSchedule;
  schema_version: number;
  source_index: string;
  target_index: string;
  roles: String[];
  data_selection_query: Map<String, any>;
}

export interface TransformMetadata {
  metadata_id: string;
  transform_metadata: {
    id: string;
    seq_no: number;
    primary_term: number;
    transform_id: string;
    after_key: Map<string, any> | null;
    last_updated_at: number;
    status: string;
    failure_reason: string | null;
    stats: {
      pages_processed: number | null;
      documents_processed: number | null;
      documents_indexed: number | null;
      index_time_in_millis: number | null;
      search_time_in_millis: number | null;
    };
  };
}

export interface IntervalSchedule {
  interval: {
    startTime: number | null;
    period: number;
    unit: string;
  };
}

export interface CronSchedule {
  cron: {
    expression: string;
    timezone: string;
  };
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
  type: string | undefined;
}

interface DateHistogramItem {
  date_histogram: {
    sourceField: string;
    fixed_interval: string | null;
    calendar_interval: string | null;
    timezone: string;
  };
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

export type TransformGroupItem = DateHistogramItem | TermsItem | HistogramItem;

export enum GROUP_TYPES {
  histogram = "histogram",
  dateHistogram = "date_histogram",
  terms = "terms",
}
