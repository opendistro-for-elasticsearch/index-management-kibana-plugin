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

import { FieldItem } from "../models/interfaces";

export const parseTimeunit = (timeunit: string): string => {
  if (timeunit == "MINUTES" || timeunit == "m" || timeunit == "Minutes") return "minute(s)";
  else if (timeunit == "HOURS" || timeunit == "h" || timeunit == "Hours") return "hour(s)";
  else if (timeunit == "SECONDS" || timeunit == "s" || timeunit == "Seconds") return "second(s)";
  else if (timeunit == "DAYS" || timeunit == "d" || timeunit == "Days") return "day(s)";
  else if (timeunit == "ms" || timeunit == "Milliseconds") return "millisecond(s)";

  return timeunit;
};

export const parseTimezone = (timezone: string): string => {
  let text;
  switch (timezone) {
    case "Pacific/Apia":
      text = "UTC +13 / +14 - Pacific/Apia";
      break;
    case "Pacific/Auckland":
      text = "UTC +12 / +13 - Pacific/Auckland";
      break;
    case "Pacific/Guadalcanal":
      text = "UTC +11 - Pacific/Guadalcanal";
      break;
    case "Australia/Sydney":
      text = "UTC +10:00 / +11:00 - Australia/Sydney";
      break;
    case "Australia/Darwin":
      text = "UTC +9:30 / +10:30 - Australia/Darwin";
      break;
    case "Asia/Tokyo":
      text = "UTC +9 - Asia/Tokyo";
      break;
    case "Asia/Shanghai":
      text = "UTC +8 - Asia/Shanghai";
      break;
    case "Asia/Ho_Chi_Minh":
      text = "UTC +7 - Asia/Ho Chi Minh";
      break;
    case "Asia/Dhaka":
      text = "UTC +6 - Asia/Dhaka";
      break;
    case "Asia/Kolkata":
      text = "UTC +5:30 - Asia/Kolkata";
      break;
    case "Asia/Karachi":
      text = "UTC +5 - Asia/Karachi";
      break;
    case "Asia/Yerevan":
      text = "UTC +4 Asia/Yerevan";
      break;
    case "Africa/Addis_Ababa":
      text = "UTC +3 - Africa/Addis Ababa";
      break;
    case "Africa/Cairo":
      text = "UTC +2 - Africa/Cairo";
      break;
    case "Europe/Paris":
      text = "UTC +1 / +2 - Europe/Paris";
      break;
    case "UTC +0":
      text = "UTC +0 - Europe/London";
      break;
    case "America/St_Johns":
      text = "UTC -2:30 / -3:30 - America/St Johns";
      break;
    case "America/Sao_Paulo":
      text = "UTC -3 - America/Sao Paulo";
      break;
    case "America/Puerto_Rico":
      text = "UTC -4 - America/Puerto Rico";
      break;
    case "America/Indiana/Indianapolis":
      text = "UTC -4 /-5 - America/Indiana/Indianapolis";
      break;
    case "-05:00":
      text = "UTC -5";
      break;
    case "America/Chicago":
      text = "UTC -5/ -6 - America/Chicago";
      break;
    case "America/Phoenix":
      text = "UTC -7 - America/Phoenix";
      break;
    case "-07:00":
      text = "UTC -7";
      break;
    case "America/Los_Angeles":
      text = "UTC -7 / -8 - America/Los Angeles";
      break;
    case "America/Anchorage":
      text = "UTC -8 / -9 - America/Anchorage";
      break;
    case "-10:00":
      text = "UTC -10";
      break;
    default:
      text = timezone;
  }
  return text;
};

//Returns true if field type is numeric
export const isNumericMapping = (fieldType: string | null): boolean => {
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
