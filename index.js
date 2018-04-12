const Plugin = require('broccoli-plugin');
const walkSync = require('walk-sync');
const _ = require('lodash');
const RSS = require('rss');

const {
  readFileSync,
  writeFileSync,
} = require('fs');

const {
  join,
} = require('path');


class BroccoliStaticSiteJsonXML extends Plugin {
  constructor(inputNodes, options) {
    // tell broccoli which "nodes" we're watching
    super([inputNodes], options);

    this.options = _.assign({}, options);

    Plugin.call(this, [inputNodes], {
      annotation: this.options.annotation,
    });
  }

  build() {
    const rssConfig = {
      title: this.options.title,
      generator: 'ember-casper-template',
      feed_url: `${this.options.host}/rss.xml`,
      site_url: `${this.options.host}/rss.xml`,
    };

    if (this.options.icon) {
      rssConfig.image_url = `${this.options.host}${this.options.icon}`;
    }

    const content = walkSync(this.inputPaths[0]);

    const jsonData = _.chain(content)
      .filter(file => file.match(/.*\.json$/))
      .map(file => readFileSync(join(this.inputPaths[0], file), 'utf8'))
      .map(fileContents => JSON.parse(fileContents))
      .value();

    const feed = new RSS(rssConfig);

    jsonData.forEach((item) => {
      // ignore data collections
      if (Array.isArray(item.data)) {
        return;
      }

      feed.item({
        title: item.data.attributes.title,
        description: item.data.attributes.html,
        url: `${this.options.host}/${item.data.id}`,
        author: item.data.attributes.author,
        date: item.data.attributes.date,
      });
    });

    writeFileSync(
      join(this.outputPath, 'rss.xml'),
      feed.xml()
    );
  }
}

module.exports = BroccoliStaticSiteJsonXML;
