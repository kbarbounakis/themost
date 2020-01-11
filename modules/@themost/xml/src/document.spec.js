
import {XDocument} from './document';
describe('XDocument', () => {

    it('should use XDocument.loadXML()', () => {
        const doc = XDocument.loadXML(`
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="children">
    <title>Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title>Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>
        `);

        expect(doc.documentElement).toBeTruthy();
        expect(doc.documentElement.nodeName).toBe('bookstore');
        
    });

});