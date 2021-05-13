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

import { GROUP_TYPES, TransformGroupItem } from "../../../../../../../models/interfaces";
import React, { useState } from "react";
import { EuiButton, EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel } from "@elastic/eui";

interface PercentilePanelProps {
  name: string;
  handleAggSelectionChange: () => void;
  closePopover: () => void;
}

export default function PercentilePanel({ name, handleAggSelectionChange, closePopover }: PercentilePanelProps) {
  const [percents, setPercents] = useState<{ label: string }[]>([]);
  const [isInvalid, setInvalid] = useState(false);

  const onChangePercents = (selectedPercent: { label: string }[]): void => {
    setPercents(selectedPercent);
    setInvalid(false);
  };

  const isValidPercent = (value) => {
    // Only numbers between 0-100 including decimals. No spaces, numbers, or special characters.
    const numericValue = parseFloat(value);
    return numericValue >= 0.0 && numericValue <= 100.0;
  };

  const onCreateOption = (searchValue: string) => {
    if (!isValidPercent(searchValue)) {
      // Return false to explicitly reject the user's input.
      return false;
    }

    const newOption = {
      label: searchValue,
    };

    // Select the option.
    setPercents([...percents, newOption]);
  };

  const onSearchChange = (searchValue) => {
    if (!searchValue) {
      setInvalid(false);

      return;
    }

    setInvalid(!isValidPercent(searchValue));
  };

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiFormRow
            label="Percents"
            helpText="Only numbers between 0-100 allowed."
            isInvalid={isInvalid}
            error={isInvalid ? "Invalid input" : undefined}
          >
            <EuiComboBox
              noSuggestions
              selectedOptions={percents}
              onChange={onChangePercents}
              onCreateOption={onCreateOption}
              isInvalid={isInvalid}
              onSearchChange={onSearchChange}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}></EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton fullWidth={false} onClick={() => closePopover()}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            fullWidth={false}
            // onClick={() => {
            //   const targetFieldName = `${name} _${GROUP_TYPES.histogram}`;
            //   handleGroupSelectionChange({
            //     histogram: {
            //       source_field: name,
            //       target_field: targetFieldName,
            //       interval: histogramInterval,
            //     },
            //   });
            // }}
          >
            OK
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
