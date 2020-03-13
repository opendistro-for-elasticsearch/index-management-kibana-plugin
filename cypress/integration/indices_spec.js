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

const samplePolicy = require("../fixtures/sample_policy");

const POLICY_ID = "test_policy_id";
const PLUGIN_NAME = "opendistro_index_management_kibana";
const SAMPLE_INDEX = "sample_index";

describe("Indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Kibana
    cy.visit(`${Cypress.env("kibana")}/app/${PLUGIN_NAME}#/indices`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains("Rows per page", { timeout: 20000 });
  });

  describe("searching", () => {
    before(() => {
      cy.deleteAllIndices();
      for (let i = 97; i < 123; i++) {
        const char = String.fromCharCode(i);
        cy.request("PUT", `${Cypress.env("elasticsearch")}/index_${char}`);
      }
    });

    it("works", () => {
      cy.get("thead > tr > th")
        .contains("Index")
        .click({ force: true });

      cy.contains("index_a");
      cy.contains("index_z").should("not.exist");

      cy.get(`input[type="search"]`)
        .focus()
        .type("index_z");

      cy.get("tbody > tr").should($tr => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("index_z");
      });
    });
  });

  describe("applying policy", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
      cy.request("PUT", `${Cypress.env("elasticsearch")}/${SAMPLE_INDEX}`);
    });

    it("works", () => {
      cy.contains("sample_index");

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-sample_index"]`).check({ force: true });

      cy.get(`[data-test-subj="Apply policyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type(POLICY_ID, { parseSpecialCharSequences: false, delay: 1 })
        .wait(500)
        .type("{downarrow}")
        .type("{enter}");

      // cy.contains("test_policy_id").click({ force: true });

      cy.contains("A simple description");

      cy.get(`[data-test-subj="applyPolicyModalEditButton"]`).click({ force: true });

      cy.reload();

      cy.contains(SAMPLE_INDEX, { timeout: 20000 });

      cy.get(`tbody > tr:contains("sample_index") > td`)
        .filter(`:nth-child(4)`)
        .contains("Yes");
    });
  });
});
