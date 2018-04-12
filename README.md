# Broccoli Static Site JSON XML

A very simple [Broccoli](https://github.com/broccolijs/broccoli) plugin that takes trees generated
from [broccoli-statis-site-json](https://github.com/stonecircle/broccoli-static-site-json) and outputs
a single `rss.xml` file.

## Basic Usage

`const rssTree = new StaticSiteJsonXml(tree, { host: 'https://blog.stonecircle.io', 'title': 'My blog Title'})`
