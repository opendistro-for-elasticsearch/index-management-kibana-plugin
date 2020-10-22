/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import queryString from "query-string";
// @ts-ignore
import moment from "moment";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { RollupQueryParams } from "../models/interfaces";

export function getURLQueryParams(location: { search: string }): RollupQueryParams {
  const { from, size, search, sortField, sortDirection } = queryString.parse(location.search);

  return <RollupQueryParams>{
    // @ts-ignores
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? DEFAULT_QUERY_PARAMS.sortField : sortField,
    sortDirection: typeof sortDirection !== "string" ? DEFAULT_QUERY_PARAMS.sortDirection : sortDirection,
  };
}

export const renderTime = (time: number): string => {
  const momentTime = moment(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};

export const renderEnabled = (isEnabled: boolean): string => {
  return isEnabled ? "Enabled" : "Disabled";
};

export const renderContinuous = (continuous: boolean): string => {
  return continuous ? "Yes" : "No";
};
