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

import { PLUGIN_NAME } from "../support/constants";
import samplePolicy from "../fixtures/sample_policy";

const POLICY_ID = "test_policy_id";
const SAMPLE_INDEX = "sample_index";

describe("Indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    //Wait for a while to avoid 503 server unavailable error
    cy.wait(5000).reload();

    // Visit ISM Kibana
    cy.visit(`${Cypress.env("kibana")}/app/${PLUGIN_NAME}#/indices`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched", () => {
    before(() => {
      cy.deleteAllIndices();
      // Create 20+ indices that can be sorted alphabetically by using letters a-z
      for (let i = 97; i < 123; i++) {
        const char = String.fromCharCode(i);
        cy.createIndex(`index_${char}`);
      }
    });

    it("successfully", () => {
      // Get the index table header and click it to sort
      cy.get("thead > tr > th").contains("Index").click({ force: true });

      // Confirm we have index_a in view and not index_z
      cy.contains("index_a");
      cy.contains("index_z").should("not.exist");

      // Type in index_z in search input
      cy.get(`input[type="search"]`).focus().type("index_z");

      // Confirm we only see index_z in table
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("index_z");
      });
    });
  });

  describe("can have policies applied", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Confirm our initial index is not currently managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("No");

      // Select checkbox for our index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      // Click apply policy button
      cy.get(`[data-test-subj="Apply policyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).focus().type(POLICY_ID, { parseSpecialCharSequences: false, delay: 1 });

      // Click the policy option
      cy.get(`button[role="option"]`).first().click({ force: true });

      cy.contains("A simple description");

      cy.get(`[data-test-subj="applyPolicyModalEditButton"]`).click({ force: true });

      cy.reload();

      cy.contains(SAMPLE_INDEX, { timeout: 20000 });

      // Confirm our index is now being managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("Yes");
    });
  });
});
