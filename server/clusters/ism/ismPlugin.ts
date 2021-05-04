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

  ism.getPolicies = ca({
    url: {
      fmt: `${API.POLICY_BASE}`,
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

  ism.explainAll = ca({
    url: {
      fmt: `${API.EXPLAIN_BASE}`,
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

  ism.add = ca({
    url: {
      fmt: `${API.ADD_POLICY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "POST",
  });

  ism.remove = ca({
    url: {
      fmt: `${API.REMOVE_POLICY_BASE}/<%=index%>`,
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

  ism.change = ca({
    url: {
      fmt: `${API.CHANGE_POLICY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "POST",
  });

  // TODO add new APIs as they are being implemented: status, stop, start

  ism.getRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getRollups = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}`,
    },
    method: "GET",
  });

  ism.createRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>?refresh=wait_for`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.deleteRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>?refresh=wait_for`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.putRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "PUT",
  });

  ism.startRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_start`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.stopRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_stop`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.explainRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_explain`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getTransforms = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/`,
    },
    method: "GET",
  });

  ism.explainTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_explain`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.startTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_start`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.stopTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_stop`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.deleteTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.createTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>?refresh=wait_for`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.putTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "PUT",
  });
}
