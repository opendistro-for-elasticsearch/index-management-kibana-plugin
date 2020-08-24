# raw note for file_path means to copy down draft release content generated by Github workflow
# this script helps add the URLs to all PR and have the right release note filename
# run by `python create-release-notes.py`, then input date, file_path ... as requested

import os
import sys
import fileinput
import re

link_prefix = "https://github.com/opendistro-for-elasticsearch/index-management-kibana-plugin/pull/"
searchExp = re.compile("([\(\[]).*?([\)\]])")

current_date = raw_input("what day is today (e.g. 2020-06-29): ")
file_path = raw_input("Path to raw note file (e.g., note.md): ")
plugin_name = "index-management-kibana-plugin"
plugin_version = raw_input('Plugin version (x.x.x.x): ')

app_num = int(
    raw_input('Elasticsearch plugin (enter 1) or Kibana plugin (enter 2)? '))
app = 'Elasticsearch'
if app_num is 2:
    app = 'Kibana'

app_version = raw_input(app + ' compatibility version (x.x.x): ')

for line in fileinput.input(file_path, inplace=True):
    # Add title and ES/Kibana compatibility
    if fileinput.isfirstline():
        line = "## Version " + plugin_version + " " + current_date + "\n\n" \
            "Compatible with " + app + " " + app_version + "\n"

    # Add link to PRs
    if '*' in line:
        start = line.find('#') + 1
        end = line.find(')', start)
        pr_num = line[start:end]
        line = re.sub(searchExp, "([#" + pr_num +
                      "](" + link_prefix + pr_num + "))", line)
    sys.stdout.write(line)

# Rename file to be consistent with ODFE standards
new_file_path = "opendistro-for-elasticsearch-" + plugin_name + ".release-notes-" + \
    plugin_version + ".md"
os.rename(file_path, new_file_path)

print('\n\nDone!\n')
