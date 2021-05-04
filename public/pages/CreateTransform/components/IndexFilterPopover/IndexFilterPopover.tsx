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

import React, { ChangeEvent, useState } from "react";
import { EuiForm, EuiFlexItem, EuiFormRow, EuiSelect, EuiPopoverTitle, EuiSpacer, EuiFlexGroup } from "@elastic/eui";
import { FieldItem } from "../../../../../models/interfaces";

interface IndexFilterPopoverProps {
  fields: FieldItem[];
  selectedField: string;
  setSelectedField: () => void;
}

export default function IndexFilterPopover({ fields }: IndexFilterPopoverProps) {
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const onChangeSelectedField = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedField(e.target.value);
  };
  const onChangeSelectedOperator = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedOperator(e.target.value);
  };
  const onChangeSelectedValue = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedValue(e.target.value);
  };

  return (
    <div>
      <EuiPopoverTitle>
        {/*<EuiFlexGroup alignItems='baseline' responsive={false}>*/}
        {/*<EuiFlexItem>*/}
        Add data filter
        {/*</EuiFlexItem>*/}
        {/*<EuiFlexItem grow={false} />*/}
        {/*<EuiFlexItem grow={false}>*/}
        {/*TODO:Add custom expression editor*/}
        {/*<EuiButtonEmpty*/}
        {/*  size="xs"*/}
        {/*  data-test-subj="customExpressionDSL"*/}
        {/*  onClick={this.toggleCustomEditor}*/}
        {/*>*/}
        {/*  {this.state.isCustomEditorOpen ? (*/}
        {/*    <FormattedMessage*/}
        {/*      id="data.filter.filterEditor.editFilterValuesButtonLabel"*/}
        {/*      defaultMessage="Edit filter values"*/}
        {/*    />*/}
        {/*  ) : (*/}
        {/*    <FormattedMessage*/}
        {/*      id="data.filter.filterEditor.editQueryDslButtonLabel"*/}
        {/*      defaultMessage="Edit as Query DSL"*/}
        {/*    />*/}
        {/*  )}*/}
        {/*</EuiButtonEmpty>*/}
        {/*</EuiFlexItem>*/}
        {/*</EuiFlexGroup>*/}
      </EuiPopoverTitle>
      <EuiForm>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Field">
              <EuiSelect
                id="selectField"
                options={fields.map((item) => {
                  return {
                    value: item.label,
                    text: item.label,
                  };
                })}
                value={selectedField}
                onChange={onChangeSelectedField}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Operator">
              <EuiSelect
                id="selectOperator"
                options={[]}
                // {getOperators(selectedField?.type)}
                value={selectedOperator}
                onChange={onChangeSelectedOperator}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Value">
            <EuiSelect id="selectValue" options={[]} value={selectedValue} onChange={onChangeSelectedValue} />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiForm>
    </div>
  );
}
