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
const OPENDISTRO_ISM_CONFIG_INDEX = ".opendistro-ism-config";

const updateManagedIndexConfigStartTime = (index, startTime = new Date().getTime() - (5 * 60 * 1000 - 3000)) => {
  const body = {
    query: {
      term: {
        "managed_index.index": index,
      },
    },
    script: {
      lang: "painless",
      source: `ctx._source['managed_index']['schedule']['interval']['start_time'] = ${startTime}L`,
    },
  };
  return cy.request("POST", `${Cypress.env("elasticsearch")}/${OPENDISTRO_ISM_CONFIG_INDEX}/_update_by_query`, body);
};

const getManagedIndexConfig = index => {
  const body = {
    query: {
      term: {
        "managed_index.index": index,
      },
    },
  };
  return cy.request("GET", `${Cypress.env("elasticsearch")}/${OPENDISTRO_ISM_CONFIG_INDEX}/_search`, body);
};

const getIndexSettings = index => {
  return cy.request("GET", `${Cypress.env("elasticsearch")}/${index}/_settings`);
};

describe("Managed indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Kibana
    cy.visit(`${Cypress.env("kibana")}/app/${PLUGIN_NAME}#/managed-indices`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains("Rows per page", { timeout: 20000 });
  });

  describe("Removing policy", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
      cy.request("PUT", `${Cypress.env("elasticsearch")}/${SAMPLE_INDEX}`, {
        settings: { "opendistro.index_state_management.policy_id": POLICY_ID },
      });
    });

    it("works", () => {
      // cy.contains("Create policy").click({ force: true  });
      cy.contains(POLICY_ID);

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-sample_index"]`).check({ force: true });

      cy.get(`[data-test-subj="Remove policyButton"]`).click({ force: true });

      cy.contains(`Remove policy from ${SAMPLE_INDEX}`);

      cy.get(`[data-test-subj="confirmationModalActionButton"]`).click({ force: true });

      cy.contains("Removed policy from 1 managed indices");

      cy.reload();

      cy.contains("There are no existing managed indices.", { timeout: 20000 });
    });
  });

  describe("Retrying policy", () => {
    before(() => {
      cy.deleteAllIndices();

      cy.request("PUT", `${Cypress.env("elasticsearch")}/${SAMPLE_INDEX}`, {
        settings: { "opendistro.index_state_management.policy_id": POLICY_ID },
      });

      cy.wait(1000).then(() => {
        updateManagedIndexConfigStartTime(SAMPLE_INDEX);
      });
    });

    it("works", () => {
      cy.contains(POLICY_ID);

      cy.wait(4000);

      cy.reload();

      cy.contains("Failed", { timeout: 20000 });

      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);

      // // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-sample_index"]`).check({ force: true });

      cy.get(`[data-test-subj="Retry policyButton"]`).click({ force: true });

      cy.contains(`Retry policy from current action`);

      cy.get(`[data-test-subj="retryModalRetryButton"]`).click({ force: true });

      cy.contains("Retried 1 managed indices");

      cy.reload();

      cy.contains("Attempting to retry", { timeout: 20000 }).then(() => {
        updateManagedIndexConfigStartTime(SAMPLE_INDEX);
      });

      cy.wait(5000);

      cy.reload();

      cy.contains("Successfully initialized", { timeout: 20000 });
    });
  });

  describe("Editing rollover alias", () => {
    const FIRST_ALIAS = "FIRST";
    const SECOND_ALIAS = "SECOND";

    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
      cy.request("PUT", `${Cypress.env("elasticsearch")}/${SAMPLE_INDEX}`, {
        settings: { opendistro: { index_state_management: { policy_id: POLICY_ID, rollover_alias: FIRST_ALIAS } } },
      });
    });

    it("works", () => {
      cy.contains(POLICY_ID);

      // // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-sample_index"]`).check({ force: true });

      cy.get(`[data-test-subj="Edit rollover aliasButton"]`).click({ force: true });

      getIndexSettings(SAMPLE_INDEX).then(res => {
        expect(res.body).to.have.nested.property(
          "sample_index.settings.index.opendistro.index_state_management.rollover_alias",
          FIRST_ALIAS
        );
      });

      cy.get(`input[placeholder="Rollover alias"]`)
        .focus()
        .type("second");

      cy.get(`[data-test-subj="editRolloverAliasModalAddButton"]`).click({ force: true });

      cy.contains("Edited rollover alias on sample_index");

      getIndexSettings(SAMPLE_INDEX).then(res => {
        expect(res.body).to.have.nested.property(
          "sample_index.settings.index.opendistro.index_state_management.rollover_alias",
          SECOND_ALIAS
        );
      });
    });
  });

  describe("Changing policy", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}`, samplePolicy);
      cy.request("PUT", `${Cypress.env("elasticsearch")}/_opendistro/_ism/policies/${POLICY_ID}_2`, samplePolicy);
      cy.request("PUT", `${Cypress.env("elasticsearch")}/${SAMPLE_INDEX}`, {
        settings: { opendistro: { index_state_management: { policy_id: POLICY_ID } } },
      });
    });

    it("works", () => {
      cy.contains(POLICY_ID, { timeout: 20000 });

      cy.get(`[data-test-subj="changePolicyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .first()
        .focus()
        .type(SAMPLE_INDEX, { parseSpecialCharSequences: false, delay: 1 })
        .wait(500)
        .type("{downarrow}")
        .type("{downarrow}")
        .type("{enter}");

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .eq(2)
        .focus()
        .type(POLICY_ID + "_2", { parseSpecialCharSequences: false, delay: 1 });

      cy.get(`button[role="option"]`)
        .first()
        .click({ force: true });

      cy.get(`[data-test-subj="changePolicyChangeButton"]`).click({ force: true });

      cy.contains("Changed policy on 1 indices");

      cy.contains("Managed Indices").click();

      cy.wait(1000).then(() => {
        updateManagedIndexConfigStartTime(SAMPLE_INDEX);
      });

      cy.wait(5000).reload();

      cy.contains("Successfully initialized");
      cy.contains(POLICY_ID + "_2");
    });
  });
});
