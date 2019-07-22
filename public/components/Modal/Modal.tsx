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

import React, { Component, createContext } from "react";

const ModalContext = createContext({
  component: null,
  props: {},
  onShow: (component: any, props: object) => {},
  onClose: () => {},
});

const ModalConsumer = ModalContext.Consumer;

class ModalProvider extends Component {
  state = { component: null, props: {} };

  onShow = (component: any, props: object): void => {
    this.setState({
      component,
      props,
    });
  };

  onClose = (): void => {
    this.setState({
      component: null,
      props: {},
    });
  };

  render() {
    return (
      <ModalContext.Provider value={{ ...this.state, onShow: this.onShow, onClose: this.onClose }}>
        {this.props.children}
      </ModalContext.Provider>
    );
  }
}

export { ModalConsumer, ModalProvider };
