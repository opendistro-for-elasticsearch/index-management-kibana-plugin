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
const POLICY_ID_2 = "test_policy_id_2";
const SAMPLE_INDEX = "sample_index";

describe("Managed indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Kibana
    cy.visit(`${Cypress.env("kibana")}/app/${PLUGIN_NAME}#/managed-indices`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains("Rows per page", { timeout: 20000 });
  });

  describe("can have policies removed", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createIndex(SAMPLE_INDEX, { settings: { "opendistro.index_state_management.policy_id": POLICY_ID } });
    });

    it("successfully", () => {
      // Confirm we have initial policy
      cy.contains(POLICY_ID);

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      // Click Remove policy button
      cy.get(`[data-test-subj="Remove policyButton"]`).click({ force: true });

      // Click confirmation modal button
      cy.get(`[data-test-subj="confirmationModalActionButton"]`).click({ force: true });

      // Confirm we got a remove policy toaster
      cy.contains("Removed policy from 1 managed indices");

      // Reload the page
      cy.reload();

      // Confirm we are back to empty loading state, give 20 seconds as Kibana takes a while to load
      cy.contains("There are no existing managed indices.", { timeout: 20000 });
    });
  });

  describe("can have policies retried", () => {
    before(() => {
      cy.deleteAllIndices();
      // Add a non-existent policy to the index
      cy.createIndex(SAMPLE_INDEX, { settings: { "opendistro.index_state_management.policy_id": POLICY_ID } });
      // Speed up execution time to happen in a few seconds
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have initial policy
      cy.contains(POLICY_ID);

      // Wait up to 5 seconds for the managed index to execute
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();

      // Confirm we have a Failed execution, wait up to 20 seconds as Kibana takes a while to load
      cy.contains("Failed", { timeout: 20000 });

      // Create the policy we were missing
      cy.createPolicy(POLICY_ID, samplePolicy);

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      // Click the retry policy button
      cy.get(`[data-test-subj="Retry policyButton"]`).click({ force: true });

      // Click the retry modal button
      cy.get(`[data-test-subj="retryModalRetryButton"]`).click({ force: true });

      // Confirm we got retry toaster
      cy.contains("Retried 1 managed indices");

      // Reload the page
      cy.reload();

      // Confirm we see managed index attempting to retry, give 20 seconds for Kibana load
      cy.contains("Attempting to retry", { timeout: 20000 });

      // Speed up next execution of managed index
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX);

      // Wait up to 5 seconds for managed index to execute
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();

      // Confirm managed index successfully initialized the policy
      cy.contains("Successfully initialized", { timeout: 20000 });
    });
  });

  describe("can edit rollover_alias", () => {
    const FIRST_ALIAS = "FIRST";
    const SECOND_ALIAS = "SECOND";

    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
      // Create index with rollover_alias
      cy.createIndex(SAMPLE_INDEX, {
        settings: { opendistro: { index_state_management: { policy_id: POLICY_ID, rollover_alias: FIRST_ALIAS } } },
      });
    });

    it("successfully", () => {
      // Confirm we have initial policy loaded
      cy.contains(POLICY_ID);

      // Get current index settings for index
      cy.getIndexSettings(SAMPLE_INDEX).then(res => {
        // Confirm the current rollover_alias is the first one we set
        expect(res.body).to.have.nested.property(
          "sample_index.settings.index.opendistro.index_state_management.rollover_alias",
          FIRST_ALIAS
        );
      });

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      // Click edit rollover alias button
      cy.get(`[data-test-subj="Edit rollover aliasButton"]`).click({ force: true });

      // Type in second rollover alias in input
      cy.get(`input[placeholder="Rollover alias"]`)
        .focus()
        .type(SECOND_ALIAS);

      // Click rollover alias modal confirmation button
      cy.get(`[data-test-subj="editRolloverAliasModalAddButton"]`).click({ force: true });

      // Confirm we got rollover alias toaster
      cy.contains("Edited rollover alias on sample_index");

      // Get updated index settings for index
      cy.getIndexSettings(SAMPLE_INDEX).then(res => {
        // Confirm the rollover_alias setting is set to second alias
        expect(res.body).to.have.nested.property(
          "sample_index.settings.index.opendistro.index_state_management.rollover_alias",
          SECOND_ALIAS
        );
      });
    });
  });

  describe("can change policies", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createPolicy(POLICY_ID_2, samplePolicy);
      cy.createIndex(SAMPLE_INDEX, { settings: { "opendistro.index_state_management.policy_id": POLICY_ID } });
    });

    it("successfully", () => {
      // Confirm we have our initial policy loaded
      cy.contains(POLICY_ID);

      // Click the change policy button to move to new page
      cy.get(`[data-test-subj="changePolicyButton"]`).click({ force: true });

      // Get the first combo search input box which should be index input
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .first()
        .focus()
        .type(SAMPLE_INDEX, { parseSpecialCharSequences: false, delay: 1 });

      // Click the index option
      cy.get(`button[role="option"]`)
        .eq(1)
        .click({ force: true });

      // Get the third combo search input box which should be the policy input
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .eq(2)
        .focus()
        .type(POLICY_ID_2, { parseSpecialCharSequences: false, delay: 1 });

      // Click the policy option
      cy.get(`button[role="option"]`)
        .first()
        .click({ force: true });

      // Click the Change Policy button
      cy.get(`[data-test-subj="changePolicyChangeButton"]`).click({ force: true });

      // Confirm we got the change policy toaster
      cy.contains("Changed policy on 1 indices");

      // Click back to Managed Indices page
      cy.contains("Managed Indices").click();

      // Speed up execution of managed index
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX);

      // Wait 5 seconds for next execution and then reload page
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();

      // Confirm we have successfully initialized the policy
      cy.contains("Successfully initialized");
      // Confirm the policy initialized was the second policy we changed to
      cy.contains(POLICY_ID_2);
    });
  });
});
