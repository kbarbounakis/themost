
import {XDocument, XNodeType} from './document';
describe('XDocument', () => {

    const DOC_BOOKSTORE = `
    <?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book category="cooking">
  <title lang="en">Everyday Italian</title>
  <author>Giada De Laurentiis</author>
  <year>2005</year>
  <price>30.00</price>
</book>
<book category="children">
  <title lang="en">Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>
<book category="web">
  <title lang="en">XQuery Kick Start</title>
  <author>James McGovern</author>
  <author>Per Bothner</author>
  <author>Kurt Cagle</author>
  <author>James Linn</author>
  <author>Vaidyanathan Nagarajan</author>
  <year>2003</year>
  <price>49.99</price>
</book>
<book category="web">
  <title lang="en">Learning XML</title>
  <author>Erik T. Ray</author>
  <year>2003</year>
  <price>39.95</price>
</book>
</bookstore>
            `;

    it('should use XDocument.loadXML()', () => {
        const doc = XDocument.loadXML(DOC_BOOKSTORE);
        expect(doc.documentElement).toBeTruthy();
        expect(doc.documentElement.nodeName).toBe('bookstore');
        expect(doc.documentElement.selectNodes('book')).toBeTruthy();
        expect(doc.documentElement.selectNodes('book').length).toBeTruthy();
    });

    it('should use XDocument.selectNodes()', () => {
        const doc = XDocument.loadXML(DOC_BOOKSTORE);
        expect(doc.documentElement.selectNodes('book/title')).toBeTruthy();
        expect(doc.documentElement.selectNodes('book/title')[0].nodeTypedValue).toBeTruthy();
    });

    it('should use XDocument.selectSingleNode()', () => {
        const doc = XDocument.loadXML(DOC_BOOKSTORE);
        const singleNode = doc.documentElement.selectSingleNode('book/title[.=\'Learning XML\']');
        expect(singleNode).toBeTruthy();
    });

    it('should use xpath select', () => {
        const doc = XDocument.loadXML(DOC_BOOKSTORE);
        // Selects the first book element that is the child of the bookstore element
        let singleNode = doc.selectSingleNode('/bookstore/book[1]');
        expect(singleNode).toBeTruthy();
        expect(singleNode.getAttribute('category')).toBe('cooking');
        // Selects the last book element that is the child of the bookstore element
        singleNode = doc.selectSingleNode('/bookstore/book[last()]');
        expect(singleNode).toBeTruthy();
        expect(singleNode.getAttribute('category')).toBe('web');
    });

    it('should use XDocument.createElement()', () => {
        const doc = new XDocument();
        // Selects the first book element that is the child of the bookstore element
        let element = doc.createElement('bookstore');
        expect(element).toBeTruthy();
        expect(element.nodeType === XNodeType.DOM_ELEMENT_NODE).toBeTruthy();
    });
    
    it('should use XDocument.createTextNode()', () => {
        const doc = new XDocument();
        // Selects the first book element that is the child of the bookstore element
        let element = doc.createTextNode('Hello World');
        expect(element).toBeTruthy();
        expect(element.nodeType === XNodeType.DOM_TEXT_NODE).toBeTruthy();
    });

});