/**
 * These tests are just basic to test that things are *mostly*
 * working on all versions of NodeJS. All other tests in this
 * repo will be making use of async await so will be disabled
 * on older versions of Node.
 */

const util = require('util');
const { parseString } = require('xml2js');

const parseStringPromise = util.promisify(parseString);

const { createBuilder, createTempDir } = require('broccoli-test-helper');
const { expect } = require('chai');

const StaticSiteJsonXml = require('../index');

describe('basic tests', function () {
  it('should output an XML file', function () {
    return createTempDir()
      .then((input) => {
        const subject = new StaticSiteJsonXml(input.path(), {
          title: 'a test blog',
          host: 'https://blog.stonecircle.io',
          icon: '/images/logo.png',
        });
        const output = createBuilder(subject);

        input.write({
          content: {
            'my-post.json': `{
              "data": [{
                "type": "contents",
                "id": "my-post",
                "attributes": {
                  "content": "# Hello World",
                  "html": "<h1>Hello World</h1>",
                  "title": "My Post Title",
                  "image": "/images/face.jpg",
                  "imageMeta": {
                    "attribution": "by My Face",
                    "attributionLink": "https://blog.stonecircle.io"
                  },
                  "featured": true,
                  "metaTitle": null,
                  "metaDescription": null,
                  "date": "Tue Apr 10 2018 10:03:26 GMT+0100 (IST)",
                  "tags": ["business", "new"]
                },
                "relationships": {
                  "author": {
                    "data": {
                      "type": "authors",
                      "id": "chris"
                    }
                  }
                }
              }]
            }`,
          },
        });

        return output.build()
          .then(() => {
            const folderOutput = output.read();

            expect(folderOutput).to.have.property('rss.xml');

            return Promise.all([
              parseStringPromise(folderOutput['rss.xml']),
              parseStringPromise(`
                <?xml version="1.0" encoding="UTF-8"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><channel><title><![CDATA[a test blog]]></title><description><![CDATA[a test blog]]></description><link>https://blog.stonecircle.io/rss.xml</link><image><url>https://blog.stonecircle.io/images/logo.png</url><title>a test blog</title><link>https://blog.stonecircle.io/rss.xml</link></image><generator>ember-casper-template</generator><atom:link href="https://blog.stonecircle.io/rss.xml" rel="self" type="application/rss+xml"/><item><title><![CDATA[My Post Title]]></title><description><![CDATA[<h1>Hello World</h1>]]></description><link>https://blog.stonecircle.io/my-post</link><guid isPermaLink="true">https://blog.stonecircle.io/my-post</guid><pubDate>Tue, 10 Apr 2018 09:03:26 GMT</pubDate></item></channel></rss>`),
            ]).then((parsedOutput) => {
              // remove build data to make the tests pass
              // eslint-disable-next-line no-param-reassign
              delete parsedOutput[0].rss.channel[0].lastBuildDate;

              expect(parsedOutput[0]).to.deep.include(parsedOutput[1]);
            });
          })
          .finally(() => {
            return Promise.all([
              output.dispose(),
              input.dispose(),
            ]);
          });
      });
  });
});
