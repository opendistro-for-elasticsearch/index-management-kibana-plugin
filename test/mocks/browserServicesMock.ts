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

import { IndexService, ManagedIndexService, PolicyService, RollupService } from "../../public/services";
import httpClientMock from "./httpClientMock";

const indexService = new IndexService(httpClientMock);
const managedIndexService = new ManagedIndexService(httpClientMock);
const policyService = new PolicyService(httpClientMock);
const rollupService = new RollupService(httpClientMock);

export default { indexService, managedIndexService, policyService, rollupService };
