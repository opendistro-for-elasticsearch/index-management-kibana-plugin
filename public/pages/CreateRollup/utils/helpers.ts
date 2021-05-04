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

import { FieldItem } from "../../../../models/interfaces";
import { COMPARISON_OPERATORS } from "./constants";

export const parseTimeunit = (timeunit: string): string => {
  if (timeunit == "ms" || timeunit == "Milliseconds") return "millisecond(s)";
  else if (timeunit == "SECONDS" || timeunit == "s" || timeunit == "Seconds") return "second(s)";
  else if (timeunit == "MINUTES" || timeunit == "m" || timeunit == "Minutes") return "minute(s)";
  else if (timeunit == "HOURS" || timeunit == "h" || timeunit == "Hours") return "hour(s)";
  else if (timeunit == "DAYS" || timeunit == "d" || timeunit == "Days") return "day(s)";
  else if (timeunit == "w") return "week";
  else if (timeunit == "M") return "month";
  else if (timeunit == "q") return "quarter";
  else if (timeunit == "y") return "year";

  return timeunit;
};

//Returns true if field type is numeric
export const isNumericMapping = (fieldType: string | undefined): boolean => {
  return (
    fieldType == "long" ||
    fieldType == "integer" ||
    fieldType == "short" ||
    fieldType == "byte" ||
    fieldType == "double" ||
    fieldType == "float" ||
    fieldType == "half_float" ||
    fieldType == "scaled_float"
  );
};

export const compareFieldItem = (itemA: FieldItem, itemB: FieldItem): boolean => {
  return itemB.label == itemA.label && itemA.type == itemB.type;
};

export const parseFieldOptions = (prefix: string, mappings: any): FieldItem[] => {
  let fieldsOption: FieldItem[] = [];
  for (let field in mappings) {
    if (mappings.hasOwnProperty(field)) {
      if (mappings[field].type != "object" && mappings[field].type != null && mappings[field].type != "nested")
        fieldsOption.push({ label: prefix + field, type: mappings[field].type });
      if (mappings[field].fields != null)
        fieldsOption = fieldsOption.concat(parseFieldOptions(prefix + field + ".", mappings[field].fields));
      if (mappings[field].properties != null)
        fieldsOption = fieldsOption.concat(parseFieldOptions(prefix + field + ".", mappings[field].properties));
    }
  }
  return fieldsOption;
};

export const getOperators = (fieldType) =>
  COMPARISON_OPERATORS.reduce(
    (acc, currentOperator) =>
      currentOperator.dataTypes.includes(fieldType) ? [...acc, { text: currentOperator.text, value: currentOperator.value }] : acc,
    []
  );
