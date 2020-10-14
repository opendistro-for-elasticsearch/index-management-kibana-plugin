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

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiComboBoxOptionOption } from "@elastic/eui";
import chrome from "ui/chrome";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { toastNotifications } from "ui/notify";
import queryString from "query-string";
import { getErrorMessage } from "../../../../utils/helpers";
import { EMPTY_ROLLUP } from "../../../CreateRollup/utils/constants";
import GeneralInformation from "../../Components/GeneralInformation/GeneralInformation";

interface RollupDetailsProps extends RouteComponentProps {
  rollupService: RollupService;
  submitError: string;

  timestamp: EuiComboBoxOptionOption<String>[];
  intervalValue: number;
  timezone: string;
  timeunit: string;

  jobEnabledByDefault: boolean;
  recurringJob: string;
  recurringDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
}

interface RollupDetailsState {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  roles: string[];
  rollupJSON: string;
}

export default class RollupDetails extends Component<RollupDetailsProps, RollupDetailsState> {
  constructor(props: RollupDetailsProps) {
    super(props);

    this.state = {
      rollupId: "",
      description: "",
      sourceIndex: "",
      targetIndex: "",
      roles: [],
      rollupJSON: EMPTY_ROLLUP,
    };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
    const { id } = queryString.parse(this.props.location.search);
    console.log(id);
    if (typeof id === "string" && !!id) {
      chrome.breadcrumbs.push(BREADCRUMBS.ROLLUP_DETAILS);
      chrome.breadcrumbs.push({ text: id });

      await this.getRollup(id);
    } else {
      toastNotifications.addDanger(`Invalid rollup id: ${id}`);
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  getRollup = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);

      if (response.ok) {
        let newJSON = JSON.parse(this.state.rollupJSON);
        newJSON.rollup = response.response.rollup;
        // let roles: EuiComboBoxOptionOption<String>[] = [];
        // var i;
        // for (i = 0; i < response.response.rollup.roles.length; i++) {
        //   roles.push({ label: response.response.rollup.roles[i] });
        // }

        this.setState({
          rollupId: response.response.id,
          description: response.response.rollup.description,
          // roles: roles,
          rollupJSON: newJSON,
        });
        // jobEnabledByDefault: response.response.rollup.enabled,
        // pageSize: response.response.rollup.page_size,
        // delayTime: response.response.rollup.delay,
        // if (response.response.rollup.schedule.cron == undefined) {
        //   this.setState({
        //     interval: response.response.rollup.schedule.interval.period,
        //     intervalTimeunit: response.response.rollup.schedule.interval.unit,
        //   });
        // } else {
        //   this.setState({ cronExpression: response.response.rollup.schedule.cron.expression });
        // }
      } else {
        toastNotifications.addDanger(`Could not load the rollup job: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      toastNotifications.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  onEdit = (): void => {
    const { rollupId } = this.state;
    if (rollupId) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${rollupId}`);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    // const {
    //   intervalValue,
    //   timestamp,
    //   timezone,
    //   timeunit,
    //   jobEnabledByDefault,
    //   recurringJob,
    //   recurringDefinition,
    //   interval,
    //   intervalTimeunit,
    //   cronExpression,
    //   pageSize,
    //   delayTime,
    //   delayTimeunit,
    // } = this.props;

    const { rollupId, description, sourceIndex, targetIndex, roles } = this.state;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiTitle size="l">
          <h1>Review and create</h1>
        </EuiTitle>
        <EuiSpacer />
        <GeneralInformation
          rollupId={rollupId}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          roles={roles}
          onEdit={this.onEdit}
        />
        <EuiSpacer />
        {/*<HistogramAndMetrics*/}
        {/*  rollupId={rollupId}*/}
        {/*  intervalValue={intervalValue}*/}
        {/*  timestamp={timestamp}*/}
        {/*  timeunit={timeunit}*/}
        {/*  timezone={timezone}*/}
        {/*/>*/}
        <EuiSpacer />
        {/*<ScheduleRolesAndNotifications*/}
        {/*  rollupId={rollupId}*/}
        {/*  jobEnabledByDefault={jobEnabledByDefault}*/}
        {/*  recurringJob={recurringJob}*/}
        {/*  recurringDefinition={recurringDefinition}*/}
        {/*  interval={interval}*/}
        {/*  intervalTimeunit={intervalTimeunit}*/}
        {/*  cronExpression={cronExpression}*/}
        {/*  pageSize={pageSize}*/}
        {/*  delayTime={delayTime}*/}
        {/*  delayTimeunit={delayTimeunit}*/}
        {/*/>*/}
        <EuiSpacer />
      </div>
    );
  }
}
