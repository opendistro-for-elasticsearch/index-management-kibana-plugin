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

import React, { useState } from "react";
import { EuiButton, EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiSpacer } from "@elastic/eui";

interface PercentilePanelProps {
  name: string;
  aggSelection: any;
  handleAggSelectionChange: () => void;
  closePopover: () => void;
}

export default function PercentilePanel({ name, aggSelection, handleAggSelectionChange, closePopover }: PercentilePanelProps) {
  const [percents, setPercents] = useState<{ label: string }[]>([]);
  const [isInvalid, setInvalid] = useState(false);

  const onChangePercents = (selectedPercent: { label: string }[]): void => {
    setPercents(selectedPercent);
    setInvalid(false);
  };

  const isValidPercent = (value: string) => {
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

  const onSearchChange = (searchValue: string) => {
    if (!searchValue) {
      setInvalid(false);

      return;
    }

    setInvalid(!isValidPercent(searchValue));
  };

  return (
    <EuiPanel>
      <EuiFlexGroup gutterSize={"none"}>
        <EuiFlexItem grow={false} style={{ width: 230 }}>
          <EuiFormRow
            fullWidth={true}
            label="Percents"
            helpText="Only numbers between 0-100 allowed."
            isInvalid={isInvalid}
            error={isInvalid ? "Invalid input" : undefined}
          >
            <EuiComboBox
              fullWidth={true}
              noSuggestions
              selectedOptions={percents}
              onChange={onChangePercents}
              onCreateOption={onCreateOption}
              isInvalid={isInvalid}
              onSearchChange={onSearchChange}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}></EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            fullWidth={false}
            onClick={() => {
              aggSelection[`percentiles_${name}`] = {
                percentiles: {
                  field: name,
                  percents: percents.map((value) => parseFloat(value.label)),
                },
              };
              handleAggSelectionChange();
            }}
            style={{ minWidth: 55 }}
          >
            OK
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
