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

const { API, INDEX } = require("./constants");

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("deleteAllIndices", () => {
  cy.request("DELETE", `${Cypress.env("elasticsearch")}/*`);
  cy.request("DELETE", `${Cypress.env("elasticsearch")}/.opendistro-ism*?expand_wildcards=all`);
});

Cypress.Commands.add("createPolicy", (policyId, policyJSON) => {
  cy.request("PUT", `${Cypress.env("elasticsearch")}${API.POLICY_BASE}/${policyId}`, policyJSON);
});

Cypress.Commands.add("getIndexSettings", (index) => {
  cy.request("GET", `${Cypress.env("elasticsearch")}/${index}/_settings`);
});

Cypress.Commands.add("updateManagedIndexConfigStartTime", (index) => {
  // Creating closure over startTime so it's not calculated until actual update_by_query call
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000).then(() => {
    const FIVE_MINUTES_MILLIS = 5 * 60 * 1000; // Default ISM job interval
    const THREE_SECONDS_MILLIS = 3000; // Subtract 3 seconds to account for buffer of updating doc, descheduling, rescheduling
    const startTime = new Date().getTime() - (FIVE_MINUTES_MILLIS - THREE_SECONDS_MILLIS);
    const body = {
      query: { term: { "managed_index.index": index } },
      script: {
        lang: "painless",
        source: `ctx._source['managed_index']['schedule']['interval']['start_time'] = ${startTime}L`,
      },
    };
    cy.request("POST", `${Cypress.env("elasticsearch")}/${INDEX.OPENDISTRO_ISM_CONFIG}/_update_by_query`, body);
  });
});

Cypress.Commands.add("createIndex", (index, settings = {}) => {
  cy.request("PUT", `${Cypress.env("elasticsearch")}/${index}`, settings);
});

Cypress.Commands.add("createRollup", (rollupId, rollupJSON) => {
  cy.request("PUT", `${Cypress.env("elasticsearch")}${API.ROLLUP_JOBS_BASE}/${rollupId}`, rollupJSON);
});
