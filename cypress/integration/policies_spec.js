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

//const PLUGIN_NAME = require("../../public/utils/constants");
import { PLUGIN_NAME } from "../../public/utils/constants";

const samplePolicy = require("../fixtures/sample_policy");
const POLICY_ID = "test_policy_id";

describe("Policies", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Kibana
    cy.visit(`${Cypress.env("kibana")}/app/${PLUGIN_NAME}`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains("Rows per page", { timeout: 20000 });
  });

  describe("Create policies", () => {
    before(() => {
      cy.deleteAllIndices();
    });

    it("works", () => {
      cy.contains("There are no existing policies");
      cy.contains("Create policy").click({ force: true });
      cy.contains("Policy ID");
      cy.get(`input[placeholder="hot_cold_workflow"]`).type(POLICY_ID, { force: true });
      // Wait until policy JSON completely loads
      cy.contains("A simple default policy that changes the replica count between hot and cold states.");

      // Focus JSON input area and clear
      cy.get(".ace_text-input")
        .first()
        .focus()
        .clear();

      // Focus JSON input area and type in new policy
      cy.get(".ace_text-input")
        .first()
        .focus()
        .type(JSON.stringify(samplePolicy), { parseSpecialCharSequences: false, delay: 1, timeout: 20000 });
      cy.get("button")
        .contains("Create")
        .click({ force: true });
      cy.contains(`Created policy: ${POLICY_ID}`);
      cy.contains("Loading policies...").should("not.exist");
      cy.get("table > tbody > tr").contains("A simple description");
    });
  });

  describe("Edit policies", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
    });

    it("works", () => {
      // Make changes to policy JSON for editing
      const newPolicy = { policy: { ...samplePolicy.policy, description: "A new description" } };

      // // Visit ISM page directly
      // cy.visit("localhost:5601/app/opendistro_index_management_kibana");
      //
      // // Confirm we have our initial policy, wait extra long because this is Kibana's first load
      cy.contains("A simple description");

      // Select checkbox for our policy
      cy.get("#_selection_column_test_policy_id-checkbox").check({ force: true });

      //Click Edit button
      cy.get("button")
        .contains("Edit")
        .click({ force: true });

      // Wait until policy JSON completely loads
      cy.contains("A simple description");

      // Focus JSON input area and clear
      cy.get(".ace_text-input")
        .first()
        .focus()
        .clear();

      // Focus JSON input area and type in new policy
      cy.get(".ace_text-input")
        .first()
        .focus()
        .type(JSON.stringify(newPolicy), { parseSpecialCharSequences: false, delay: 1, timeout: 20000 });

      // Click Update button
      cy.get("button")
        .contains("Update")
        .click({ force: true });

      // Confirm we get toaster saying updated
      cy.contains(`Updated policy: ${POLICY_ID}`);

      // Confirm new description shows in table
      cy.contains(`A new description`);
    });
  });

  describe("Delete policies", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
    });

    it("works", () => {
      // Visit ISM page directly
      // cy.visit("localhost:5601/app/opendistro_index_management_kibana");

      // Confirm we have our initial policy, wait extra long because this is Kibana's first load
      // cy.contains("A simple description", { timeout: 20000 });

      cy.contains("A simple description");

      // Select checkbox for our policy
      cy.get("#_selection_column_test_policy_id-checkbox").check({ force: true });

      //Click Delete button
      cy.get("button")
        .contains("Delete")
        .click({ force: true });

      // Wait for delete modal
      cy.contains("Delete test_policy_id");

      cy.get(`button[data-test-subj="confirmationModalActionButton"]`)
        .contains("Delete")
        .click();

      cy.contains(`Deleted the policy: ${POLICY_ID}`);
    });
  });

  describe("Search policies", () => {
    before(() => {
      cy.deleteAllIndices();
      for (let i = 97; i < 123; i++) {
        const char = String.fromCharCode(i);
        cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}_${char}`, samplePolicy);
      }
    });

    it("works", () => {
      cy.contains("A simple description");

      cy.get("thead > tr > th")
        .contains("Policy")
        .click({ force: true });

      cy.contains("test_policy_id_z").should("not.exist");

      cy.get(`input[type="search"]`)
        .focus()
        .type("test_policy_id_z");

      // cy.contains("test_policy_id_z");

      cy.get("tbody > tr").should($tr => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("test_policy_id_z");
      });
    });
  });
});
