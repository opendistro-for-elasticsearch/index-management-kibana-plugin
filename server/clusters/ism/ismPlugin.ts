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

import { API } from "../../utils/constants";

/*
 * Types are not available until 7.2
 * https://github.com/elastic/kibana/blob/v7.2.0/src/core/server/elasticsearch/elasticsearch_client_config.ts
 * */
export default function ismPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.ism = components.clientAction.namespaceFactory();
  const ism = Client.prototype.ism.prototype;

  ism.getPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.createPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.deletePolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.putPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?if_seq_no=<%=ifSeqNo%>&if_primary_term=<%=ifPrimaryTerm%>&refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
        ifSeqNo: {
          type: "string",
          required: true,
        },
        ifPrimaryTerm: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.explain = ca({
    url: {
      fmt: `${API.EXPLAIN_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.retry = ca({
    url: {
      fmt: `${API.RETRY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: false,
    method: "POST",
  });

  // TODO add new APIs as they are being implemented: add, remove, change, status, stop, start
}
