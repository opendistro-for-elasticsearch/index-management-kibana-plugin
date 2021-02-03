/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
  DefinedSections,
  IndexManagementSectionId,
  IndicesSection,
  MainSectionsServiceSetup,
  MainSectionsServiceStartDeps,
  MainSectionsStartPrivate,
  RollupJobsSection,
  StateManagementPoliciesSection,
  TransformJobsSection,
} from "../pages/Main/utils/constants";
import { IndexManagementSection, RegisterIndexManagementSectionArgs } from "../pages/Main/components/IndexManagementSection";
import { createGetterSetter } from "../../../../src/plugins/kibana_utils/common";

const [getMainSectionsServiceStartPrivate, setMainSectionsServiceStartPrivate] = createGetterSetter<MainSectionsStartPrivate>(
  "MainSectionsServiceStartPrivate"
);

export { getMainSectionsServiceStartPrivate };

export class MainSectionsService {
  definedSections: DefinedSections;

  constructor() {
    this.definedSections = {
      rollupJobs: this.registerSection(RollupJobsSection),
      transformJobs: this.registerSection(TransformJobsSection),
      stateManagementPolicies: this.registerSection(StateManagementPoliciesSection),
      indices: this.registerSection(IndicesSection),
    };
  }
  private sections: Map<IndexManagementSectionId | string, IndexManagementSection> = new Map();

  private getAllSections = () => [...this.sections.values()];

  private registerSection = (section: RegisterIndexManagementSectionArgs) => {
    if (this.sections.has(section.id)) {
      throw Error(`IndexManagementSection '${section.id}' already registered`);
    }

    const newSection = new IndexManagementSection(section);

    this.sections.set(section.id, newSection);
    return newSection;
  };

  setup(): MainSectionsServiceSetup {
    return {
      register: this.registerSection,
      section: {
        ...this.definedSections,
      },
    };
  }

  // TODO: Check for necessity of using capabilities

  start({ capabilities }: MainSectionsServiceStartDeps) {
    this.getAllSections().forEach((section) => {
      if (capabilities.management.hasOwnProperty(section.id)) {
        const sectionCapabilities = capabilities.management[section.id];
        section.apps.forEach((app) => {
          if (sectionCapabilities.hasOwnProperty(app.id) && sectionCapabilities[app.id] !== true) {
            app.disable();
          }
        });
      }
    });

    setMainSectionsServiceStartPrivate({
      getSectionsEnabled: () => this.getAllSections().filter((section) => !section.isDisabled()),
    });

    return {};
  }
}
