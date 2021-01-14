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

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Deletes all indices in cluster
     * @example
     * cy.wipeCluster()
     */
    deleteAllIndices(): Chainable<any>;
    /**
     * Creates a policy
     * @example
     * cy.createPolicy("some_policy", { "policy": { ... } })
     */
    createPolicy(policyId: string, policyJSON: object): Chainable<any>;
    /**
     * Gets settings for index
     * @example
     * cy.getIndexSettings("some_index")
     */
    getIndexSettings(index: string): Chainable<any>;
    /**
     * Updated the managed index config's start time to
     * make it run in 3 seconds after calling this
     * @example
     * cy.updateManagedIndexConfigStartTime("some_index")
     */
    updateManagedIndexConfigStartTime(index: string): Chainable<any>;
    /**
     * Creates index with policy
     * @example
     * cy.createIndex("some_index", "some_policy")
     */
    createIndex(index: string, settings?: object): Chainable<any>;
    /**
     * Creates a rollup
     * @example
     * cy.createRollup("some_rollup", { "rollup": { ... } })
     */
    createRollup(policyId: string, policyJSON: object): Chainable<any>;
  }
}
