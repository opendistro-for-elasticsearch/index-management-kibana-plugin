# Open Distro for Elasticsearch Index Management Kibana

The Open Distro for Elasticsearch Index Management Kibana plugin lets you manage your [Open Distro for Elasticsearch Index Management plugin](https://github.com/opendistro-for-elasticsearch/index-management) to view, monitor, and manage your indices directly from Kibana.

## Under Active Development

This plugin is currently under active development.

## Documentation

Please see our [documentation](https://opendistro.github.io/for-elasticsearch-docs/).

## Contributing to Open Distro for Elasticsearch Index Management Kibana

- Refer to [CONTRIBUTING.md](./CONTRIBUTING.md).
- Since this is a Kibana plugin, it can be useful to review the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) alongside the documentation around [Kibana plugins](https://www.elastic.co/guide/en/kibana/master/kibana-plugins.html) and [plugin development](https://www.elastic.co/guide/en/kibana/master/plugin-development.html).

  - `yarn kbn bootstrap`

    Install dependencies and crosslink Kibana and all projects/plugins.

    > ***IMPORTANT:*** Use this script instead of `yarn` to install dependencies when switching branches, and re-run it whenever your dependencies change.

  - `yarn start`

    Start kibana and have it include this plugin. You can pass any arguments that you would normally send to `bin/kibana`

      ```
      yarn start --elasticsearch.hosts http://localhost:9220
      ```

  - `yarn build`

    Build a distributable archive of your plugin.

  - `yarn test:browser`

    Run the browser tests in a real web browser.

  - `yarn test:server`

    Run the server tests using mocha.

For more information about any of these commands run `yarn ${task} --help`. For a full list of tasks checkout the `package.json` file, or run `yarn run`.


## Get Started and Contribute!

You can get started by:
- [Reporting](https://github.com/opendistro-for-elasticsearch/index-management-kibana-plugin/issues) a bug
- [Proposing](https://github.com/opendistro-for-elasticsearch/index-management-kibana-plugin/issues) new ideas to enhance the plugin
- [Contribute](https://github.com/opendistro-for-elasticsearch/index-management-kibana-plugin/issues) documentation and sample code
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for more details to get involved in the project.

## Questions

Please feel free to come ask questions on the Open Distro community discussion forum.

## License

This code is licensed under the Apache 2.0 License. 

## Copyright

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.


