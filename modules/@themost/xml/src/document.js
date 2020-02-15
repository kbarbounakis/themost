/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import {XmlCommon} from './common';
import {XmlUtil} from './util';
import {select, ExprContext} from './xpath';

function xmlResolveEntities(s) {
    const parts = XmlUtil.stringSplit(s, '&');
    let ret = parts[0];
    for ( let i = 1; i < parts.length; ++i) {
        const rp = parts[i].indexOf(';');
        if (rp === -1) {
            // no entity reference: just a & but no ;
            ret += parts[i];
            continue;
        }

        const entityName = parts[i].substring(0, rp);
        const remainderText = parts[i].substring(rp + 1);

        let ch;
        switch (entityName) {
            case 'lt':
                ch = '<';
                break;
            case 'gt':
                ch = '>';
                break;
            case 'amp':
                ch = '&';
                break;
            case 'quot':
                ch = '"';
                break;
            case 'apos':
                ch = '\'';
                break;
            case 'nbsp':
                ch = String.fromCharCode(160);
                break;
            default:
                // Cool trick: let the DOM do the entity decoding. We assign
                // the entity text through non-W3C DOM properties and read it
                // through the W3C DOM. W3C DOM access is specified to resolve
                // entities.
                // var span = domCreateElement(window.document, 'span');
                let span;
                if (typeof window === 'undefined') {
                    const doc = new XDocument();
                    span = doc.createTextNode('&' + entityName + '; ');
                    ch = span.nodeValue;
                }
                else {
                    span = window.document.createElement('span');
                    span.innerHTML = '&' + entityName + '; ';
                    ch = span.childNodes[0].nodeValue.charAt(0);
                }
        }
        ret += ch + remainderText;
    }

    return ret;
}
// Parses the given XML string with our custom, JavaScript XML parser.
function xmlParse(xml) {
    const regex_empty = /\/$/;
    let regex_tagname = XmlCommon.XML10_TAGNAME_REGEXP;
    let regex_attribute = XmlCommon.XML10_ATTRIBUTE_REGEXP;
    if (xml.match(/^<\?xml/)) {
        // When an XML document begins with an XML declaration
        // VersionInfo must appear.
        if (xml.search(new RegExp(XmlCommon.XML10_VERSION_INFO)) === 5) {
            regex_tagname = XmlCommon.XML10_TAGNAME_REGEXP;
            regex_attribute = XmlCommon.XML10_ATTRIBUTE_REGEXP;
        } else if (xml.search(new RegExp(XmlCommon.XML11_VERSION_INFO)) === 5) {
            regex_tagname = XmlCommon.XML11_TAGNAME_REGEXP;
            regex_attribute = XmlCommon.XML11_ATTRIBUTE_REGEXP;
        } else {
            // VersionInfo is missing, or unknown version number.
            // Fall back to XML 1.0 or XML 1.1, or just return null?
            regex_tagname = XmlCommon.XML10_TAGNAME_REGEXP;
            regex_attribute = XmlCommon.XML10_ATTRIBUTE_REGEXP;
        }
    } else {
        // When an XML declaration is missing it's an XML 1.0 document.
        regex_tagname = XmlCommon.XML10_TAGNAME_REGEXP;
        regex_attribute = XmlCommon.XML10_ATTRIBUTE_REGEXP;
    }

    const xmldoc = new XDocument();
    const root = xmldoc;

    // For the record: in Safari, we would create native DOM nodes, but
    // in Opera that is not possible, because the DOM only allows HTML
    // element nodes to be created, so we have to do our own DOM nodes.

    // xmldoc = document.implementation.createDocument('','',null);
    // root = xmldoc; // .createDocumentFragment();
    // NOTE(mesch): using the DocumentFragment instead of the Document
    // crashes my Safari 1.2.4 (v125.12).
    const stack = [];

    let parent = root;
    stack.push(parent);

    // The token that delimits a section that contains markup as
    // content: CDATA or comments.
    let slurp = '';
    let start, end, data, node;
    const x = XmlUtil.stringSplit(xml, '<');
    for ( let i = 1; i < x.length; ++i) {
        const xx = XmlUtil.stringSplit(x[i], '>');
        const tag = xx[0];
        let text = xmlResolveEntities(xx[1] || '');

        if (slurp) {
            // In a "slurp" section (CDATA or comment): only check for the
            // end of the section, otherwise append the whole text.
            end = x[i].indexOf(slurp);
            if (end !== -1) {
                data = x[i].substring(0, end);
                parent.nodeValue += '<' + data;
                stack.pop();
                parent = stack[stack.length - 1];
                text = x[i].substring(end + slurp.length);
                slurp = '';
            } else {
                parent.nodeValue += '<' + x[i];
                text = null;
            }

        } else if (tag.indexOf('![CDATA[') === 0) {
            start = '![CDATA['.length;
            end = x[i].indexOf(']]>');
            if (end !== -1) {
                data = x[i].substring(start, end);
                node = xmldoc.createCDATASection(data);
                parent.appendChild(node);
            } else {
                data = x[i].substring(start);
                text = null;
                node = xmldoc.createCDATASection(data);
                parent.appendChild(node);
                parent = node;
                stack.push(node);
                slurp = ']]>';
            }

        } else if (tag.indexOf('!--') === 0) {
            start = '!--'.length;
            end = x[i].indexOf('-->');
            if (end !== -1) {
                data = x[i].substring(start, end);
                node = xmldoc.createComment(data);
                parent.appendChild(node);
            } else {
                data = x[i].substring(start);
                text = null;
                node = xmldoc.createComment(data);
                parent.appendChild(node);
                parent = node;
                stack.push(node);
                slurp = '-->';
            }

        } else if (tag.charAt(0) === '/') {
            stack.pop();
            parent = stack[stack.length - 1];

        } else if (tag.charAt(0) === '?') {
            // Ignore XML declaration and processing instructions
        } else if (tag.charAt(0) === '!') {
            // Ignore notation and comments
        } else {
            const empty = tag.match(regex_empty);
            const tagname = regex_tagname.exec(tag)[1];
            node = xmldoc.createElement(tagname);

            let att = regex_attribute.exec(tag);
            while (att) {
                const val = xmlResolveEntities(att[5] || att[7] || '');
                node.setAttribute(att[1], val);
                att = regex_attribute.exec(tag);
            }

            parent.appendChild(node);
            if (!empty) {
                parent = node;
                stack.push(node);
            }
        }

        if (text && parent !== root) {
            parent.appendChild(xmldoc.createTextNode(text));
        }
    }

    return root;
}

// Based on <http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/
// core.html#ID-1950641247>

// Traverses the element nodes in the DOM section underneath the given
// node and invokes the given callbacks as methods on every element
// node encountered. Function opt_pre is invoked before a node's
// children are traversed; opt_post is invoked after they are
// traversed. Traversal will not be continued if a callback function
// returns boolean false. NOTE(mesch): copied from
// <//google3/maps/webmaps/javascript/dom.js>.
function domTraverseElements(node, opt_pre, opt_post) {
    let ret;
    if (opt_pre) {
        ret = opt_pre.call(null, node);
        if (typeof ret === 'boolean' && !ret) {
            return false;
        }
    }

    for ( let c = node.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === XmlCommon.DOM_ELEMENT_NODE) {
            ret = arguments.callee.call(this, c, opt_pre, opt_post);
            if (typeof ret === 'boolean' && !ret) {
                return false;
            }
        }
    }

    if (opt_post) {
        ret = opt_post.call(null, node);
        if (typeof ret === 'boolean' && !ret) {
            return false;
        }
    }
}

/**
 * @enum
 * @constructor
 */
class XNodeType {

    static DOM_ELEMENT_NODE = 1;
    static DOM_ATTRIBUTE_NODE = 2;
    static DOM_TEXT_NODE = 3;
    static DOM_CDATA_SECTION_NODE = 4;
    static DOM_ENTITY_REFERENCE_NODE = 5;
    static DOM_ENTITY_NODE = 6;
    static DOM_PROCESSING_INSTRUCTION_NODE = 7;
    static DOM_COMMENT_NODE = 8;
    static DOM_DOCUMENT_NODE = 9;
    static DOM_DOCUMENT_TYPE_NODE = 10;
    static DOM_DOCUMENT_FRAGMENT_NODE = 11;
    static DOM_NOTATION_NODE = 12;

}


/**
 * @class
 * @param type
 * @param name
 * @param opt_value
 * @param opt_owner
 * @constructor
 */
class XNode {
    constructor(type, name, opt_value, opt_owner) {
        this.attributes = [];
        this.childNodes = [];
        XNode.init.bind(this)(type, name, opt_value, opt_owner);
        Object.defineProperty(this, 'nodeTypedValue', {
           get: function() {
               return XSerializer.unescape(this);
           },
            set: function(value) {

                const s = this.ownerDocument.createTextNode(value).innerText();
                //Xml Attribute
                if (this.nodeType===2) {
                    this.nodeValue = s;
                }
                //Xml Node
                else if (this.nodeType===1) {
                    this.innerText(s);
                }
                else {
                    throw new Error('Node typed value cannot be set for this type of node.')
                }
            }, enumerable:false, configurable:false
        });

    }

    appendChild(node) {

        //first node
        if (this.childNodes.length === 0)
            this.firstChild = node;

        // previousSibling
        node.previousSibling = this.lastChild;

        // nextSibling
        node.nextSibling = null;
        if (this.lastChild) {
            this.lastChild.nextSibling = node;
        }

        // parentNode
        node.parentNode = this;

        // lastChild
        this.lastChild = node;

        // childNodes
        this.childNodes.push(node);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Replaces the child node oldNode with newNode node.
     * @param newNode {XNode} The new node we want to insert.
     * @param oldNode {XNode} The node we want to replace.
     */
    replaceChild(newNode, oldNode) {
        if (oldNode === newNode) {
            return;
        }

        for ( let i = 0; i < this.childNodes.length; ++i) {
            if (this.childNodes[i] === oldNode) {
                this.childNodes[i] = newNode;

                let p = oldNode.parentNode;
                oldNode.parentNode = null;
                newNode.parentNode = p;

                p = oldNode.previousSibling;
                oldNode.previousSibling = null;
                newNode.previousSibling = p;
                if (newNode.previousSibling) {
                    newNode.previousSibling.nextSibling = newNode;
                }

                p = oldNode.nextSibling;
                oldNode.nextSibling = null;
                newNode.nextSibling = p;
                if (newNode.nextSibling) {
                    newNode.nextSibling.previousSibling = newNode;
                }

                if (this.firstChild === oldNode) {
                    this.firstChild = newNode;
                }

                if (this.lastChild === oldNode) {
                    this.lastChild = newNode;
                }

                break;
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    insertBefore(newNode, oldNode) {
        if (oldNode === newNode) {
            return;
        }

        if (oldNode.parentNode !== this) {
            return;
        }

        if (newNode.parentNode) {
            newNode.parentNode.removeChild(newNode);
        }

        const newChildren = [];
        for ( let i = 0; i < this.childNodes.length; ++i) {
            const c = this.childNodes[i];
            if (c === oldNode) {
                newChildren.push(newNode);

                newNode.parentNode = this;

                newNode.previousSibling = oldNode.previousSibling;
                oldNode.previousSibling = newNode;
                if (newNode.previousSibling) {
                    newNode.previousSibling.nextSibling = newNode;
                }

                newNode.nextSibling = oldNode;

                if (this.firstChild === oldNode) {
                    this.firstChild = newNode;
                }
            }
            newChildren.push(c);
        }
        this.childNodes = newChildren;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Adds the specified node to the beginning of the list of child nodes for this node.
     * @param newNode {XNode} The node to add.
     * */
    prependChild(newNode) {
        if (this.childNodes.length===0) {
            this.appendChild(newNode);
        }
    }

    removeChild(node) {
        const newChildren = [];
        for ( let i = 0; i < this.childNodes.length; ++i) {
            const c = this.childNodes[i];
            if (c !== node) {
                newChildren.push(c);
            } else {
                if (c.previousSibling) {
                    c.previousSibling.nextSibling = c.nextSibling;
                }
                if (c.nextSibling) {
                    c.nextSibling.previousSibling = c.previousSibling;
                }
                if (this.firstChild === c) {
                    this.firstChild = c.nextSibling;
                }
                if (this.lastChild === c) {
                    this.lastChild = c.previousSibling;
                }
            }
        }
        this.childNodes = newChildren;
    }

    /**
     * Gets a value indicating whether this node has any attributes.
     *
     * @returns Boolean
     */
    hasAttributes() {
        if (this.attributes === null)
            return false;
        return (this.attributes.length > 0);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasAttribute(name) {
        if (typeof name!=='string')
            return false;
        if (this.attributes === null)
            return false;
        return (this.selectSingleNode('@'.concat(name))!==null);
    }

    setAttribute(name, value) {
        for ( let i = 0; i < this.attributes.length; ++i) {
            if (this.attributes[i].nodeName === name) {
                this.attributes[i].nodeValue = '' + value;
                return;
            }
        }
        this.attributes.push(XNode.create(XmlCommon.DOM_ATTRIBUTE_NODE, name, value,
            this));
    }

    getAttribute(name) {
        for ( let i = 0; i < this.attributes.length; ++i) {
            if (this.attributes[i].nodeName === name) {
                return this.attributes[i].nodeValue;
            }
        }
        return null;
    }

    // noinspection JSUnusedGlobalSymbols
    removeAttribute(name) {
        const a = [];
        for ( let i = 0; i < this.attributes.length; ++i) {
            if (this.attributes[i].nodeName !== name) {
                a.push(this.attributes[i]);
            }
        }
        this.attributes = a;
    }

    getElementsByTagName(name) {
        const ret = [];
        const self = this;
        if ("*" === name) {
            domTraverseElements(this, function(node) {
                if (self === node)
                    return;
                ret.push(node);
            }, null);
        } else {
            domTraverseElements(this, function(node) {
                if (self === node)
                    return;
                if (node.nodeName === name) {
                    ret.push(node);
                }
            }, null);
        }
        return ret;
    }

    getElementById(id) {
        let ret = null;
        domTraverseElements(this, function(node) {
            if (node.getAttribute('id') === id) {
                ret = node;
                return false;
            }
        }, null);
        return ret;
    }

    /*
     * Gets a string that represents the value of the current XNode instance. If
     * XNode is empty then returns an empty string @return String
     */
    value() {
        let ret = '';
        if (this.nodeType === XmlCommon.DOM_TEXT_NODE
            || this.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE) {
            ret += this.nodeValue;

        } else if (this.nodeType === XmlCommon.DOM_ATTRIBUTE_NODE) {
            ret += this.nodeValue;
        } else if (this.nodeType === XmlCommon.DOM_ELEMENT_NODE
            || this.nodeType === XmlCommon.DOM_DOCUMENT_NODE
            || this.nodeType === XmlCommon.DOM_DOCUMENT_FRAGMENT_NODE) {
            for ( let i = 0; i < this.childNodes.length; ++i) {
                ret += arguments.callee(this.childNodes[i]);
            }
        }
        return ret;
    }

    /**
     * Gets a value indicating whether this node has any child nodes.
     *
     * @returns Boolean
     */
    hasChildNodes() {
        if (this.childNodes === null)
            return false;
        return (this.childNodes.length > 0);
    }

    /**
     * Gets or sets the concatenated values of the node and all its child nodes.
     *
     * @param {string=} s
     * @return {string|*}
     */
    innerText(s) {
        if (s === undefined) {
            // return innerText
            // validating node type
            if ((this.nodeType === XmlCommon.DOM_TEXT_NODE)
                || (this.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE)
                || (this.nodeType === XmlCommon.DOM_COMMENT_NODE)
                || (this.nodeType === XmlCommon.DOM_ATTRIBUTE_NODE))
            // and return node values for text nodes
                return this.nodeValue ? this.nodeValue : '';
            let result = '';
            if (this.hasChildNodes()) {
                for ( let i = 0; i < this.childNodes.length; i++) {
                    result += this.childNodes[i].innerText();
                }
            }
            return result;
        } else {
            // set innerText of this node
            if ((this.nodeType === XmlCommon.DOM_TEXT_NODE)
                || (this.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE)
                || (this.nodeType === XmlCommon.DOM_COMMENT_NODE)
                || (this.nodeType === XmlCommon.DOM_ATTRIBUTE_NODE)
                || (this.nodeType === XmlCommon.DOM_ELEMENT_NODE)) {
                // remove child nodes if any
                while (this.childNodes.length > 0) {
                    this.removeChild(this.childNodes[0]);
                }
                const value = s ? XmlCommon.escapeText(s) : '';
                /**
                 * @type XNode
                 */
                const textNode = this.ownerDocument.createTextNode(value);
                this.appendChild(textNode);
                return;
            }
            throw new Error("Invalid property set operation");
        }
    }

    /**
     * Gets a value that represents the inner XML equivalent of the current XNode.
     *
     * @return String
     */
    innerXML() {
        // validating node type
        if ((this.nodeType === XmlCommon.DOM_TEXT_NODE)
            || (this.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE)
            || (this.nodeType === XmlCommon.DOM_COMMENT_NODE))
        // and return empty string for text nodes
            return '';
        // if this node is an attribute node return attribute value
        if (this.nodeType === XmlCommon.DOM_ATTRIBUTE_NODE)
            return this.nodeValue ? this.nodeValue : '';

        if (this.hasChildNodes()) {
            let s = '';
            for ( let i = 0; i < this.childNodes.length; i++) {
                s += this.childNodes[i].outerXML();
            }
            return s;
        }
    }

    /**
     * Gets a value that represents the outer xml equivalent of the current XNode.
     *
     * @return String
     */
    outerXML() {

        let s = '';

        switch (this.nodeType) {
            // 1. Xml Attribute Node
            case XmlCommon.DOM_ATTRIBUTE_NODE:
                s += this.name();
                s += '="';
                s += this.nodeValue ? XmlCommon.escapeText(this.nodeValue) : '';
                s += '"';
                return s;
            // 2. Xml Document Node
            case XmlCommon.DOM_DOCUMENT_NODE:
                return this.innerXML();
            // 3. Xml Text Node
            case XmlCommon.DOM_TEXT_NODE:
                return this.nodeValue ? XmlCommon.escapeText(this.nodeValue) : '';
            // 4. Xml CDATA Section Node
            case XmlCommon.DOM_CDATA_SECTION_NODE:
                s += '<![CDATA[';
                s += this.nodeValue ? this.nodeValue : '';
                s += ']]>';
                // and finally return
                return s;
            // 5. Xml Comment Node
            case XmlCommon.DOM_COMMENT_NODE:
                s += '<!--';
                s += this.nodeValue ? this.nodeValue : '';
                s += '-->';
                return s;
            default:
                break;
        }

        // write starting tag
        s += '<' + this.name();
        // write attributes (if any)
        if (this.hasAttributes()) {
            for ( let i = 0; i < this.attributes.length; i++) {
                s += ' ' + this.attributes[i].outerXML();
            }
        }

        if (this.hasChildNodes()) {
            // close tag
            s += '>';
            for ( let k = 0; k < this.childNodes.length; k++) {
                s += this.childNodes[k].outerXML();
            }
            // write closing tag
            s += '</' + this.name() + '>';
        }
        else {
            s += " />"
        }

        return s;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Selects a node set matching the XPath expression.
     * @param {String} expr - A string value that represents the XPath expression we want to match.
     * @param {Array=} ns - An Array of namespaces
     * @returns {Array} An array of nodes that matching the specified XPath expression.
     */
    selectNodes(expr, ns) {
        //format expression
        const nsExpr = (typeof ns === 'undefined' || ns === null) ? expr : this.prepare(expr, ns);
        //execute xpath expression
        const nodes = select(nsExpr, this);
        //return node set
        return nodes.value;
    }

    /**
     * Selects the first XNode that matches the XPath expression.
     *
     * @param {string} expr - A string value that represents the XPath expression we
     *            want to match.
     * @param {Array=} ns - An Array of namespaces
     * @returns {XNode} An XNode object that matching the specified XPath
     *          expression.
     */
    selectSingleNode(expr, ns) {
        //format expression
        const expr0 = ns===undefined ? expr : this.prepare(expr, ns);
        //execute xpath expression
        const nodes = select('(' + expr0 + ')[1]', this);
        //return result (if any)
        if (nodes.value.length > 0)
            return nodes.value[0];
        else
            return null;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {ExprContext|*}
     */
    createContext() {
        return new ExprContext(this);
    }

    /**
     *
     * @param {string} expr - A string that represents an XPATH expression.
     * @param {Array=} ns - An array of namespaces used in the specified expression
     * @returns {string} - A string that represents the prepared expression based on the namespaces declared on the document.
     */
    prepare(expr, ns) {
        if (ns===undefined)
            return expr;
        let expr0 = expr;
        for (let i = 0; i < ns.length; i++) {
            /**
             * @type {XNamespace}
             */
            const ns0 = ns[i];
            if (ns0) {
                if ((ns0.prefix)&&
                    (ns0.uri)) {
                    //try to replace namespace prefix in expression
                    if (expr0.indexOf(ns0.prefix)>=0) {
                        //lookup namespace in document
                        let prefix = null;
                        if (this.nodeName==='#document')
                            prefix = this.documentElement.lookupPrefix(ns0.uri);
                        else
                            prefix = this.lookupPrefix(ns0.uri);
                        if (prefix) {
                            //replace namespace prefix
                            const pattern = new RegExp('\\b' + ns0.prefix + '\\b:', 'g');
                            expr0  =expr0.replace(pattern, prefix + ":");
                        }
                    }
                }
            }
        }
        return expr0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Removes all the child nodes and/or attributes of the current node.
     */
    removeAll() {
        while (this.childNodes.length > 0) {
            this.removeChild(this.childNodes[0]);
        }
        while (this.attributes.length > 0)
            this.attributes.pop();
    }

    name() {
        if (this.prefix && this.nodeName.indexOf(this.prefix + ':') !== 0) {
            return this.prefix + ':' + this.nodeName;
        } else {
            return this.nodeName;
        }
    }

    /**
     * Gets the prefix defined for the specified namespace URI.
     @param {string} namespaceURI
     @return {string}
     */
    lookupPrefix(namespaceURI) {
        //enumerate xmlns:* attributes for the given namespace URI
        let i = 0;
        if (this.nodeName)
            while(i<this.attributes.length) {
                if (this.attributes[i].prefix==='xmlns')
                    if (this.attributes[i].nodeValue===namespaceURI)
                        return this.attributes[i].localName;
                i++;
            }
        //search parent (if ant)
        if (this.parentNode!==null) {
            return this.parentNode.lookupPrefix(namespaceURI);
        }
    }

    // Don't call as method, use apply() or call().
    static init(type, name, value, owner) {
        this.nodeType = type - 0;
        this.nodeName = '' + name;
        this.prefix = '';
        this.localName = this.nodeName;
        const ix = this.nodeName.indexOf(':');
        if (ix>0) {
            this.localName = this.nodeName.substr(ix+1);
            this.prefix = this.nodeName.substr(0,ix)
        }

        this.nodeValue = '' + value;
        /**
         * @type XDocument
         */
        this.ownerDocument = owner;
        this.firstChild = null;
        this.lastChild = null;
        this.nextSibling = null;
        this.previousSibling = null;
        this.parentNode = null;
    }

    static recycle(node) {
        if (!node) {
            return;
        }

        if (node.constructor === XDocument) {
            XNode.recycle(node.documentElement);
            return;
        }

        if (node.constructor !== this) {
            return;
        }

        XNode.unused_.push(node);
        for ( let a = 0; a < node.attributes.length; ++a) {
            XNode.recycle(node.attributes[a]);
        }
        for ( let c = 0; c < node.childNodes.length; ++c) {
            XNode.recycle(node.childNodes[c]);
        }
        node.attributes.length = 0;
        node.childNodes.length = 0;
        XNode.init.call(node, 0, '', '', null);
    }

    static create(type, name, value, owner) {
        if (XNode.unused_.length > 0) {
            const node = XNode.unused_.pop();
            XNode.init.call(node, type, name, value, owner);
            return node;
        } else {
            return new XNode(type, name, value, owner);
        }
    }
}

XNode.unused_ = [];

/**
 * @class
 * @constructor
 */
class XDocument extends XNode {
    constructor() {
        // According to the DOM Spec, ownerDocument of a
        // document node is null.
        super(XmlCommon.DOM_DOCUMENT_NODE, '#document', null, null);
        /**
         * @type XNode
         */
        this.documentElement = null;
    }

    // noinspection JSUnusedGlobalSymbols
    clear() {
        XNode.recycle(this.documentElement);
        this.documentElement = null;
    }

    appendChild(node) {
        super.appendChild(node);
        this.documentElement = this.childNodes[0];
    }

    /**
     * @return XNode
     */
    createElement(name) {
        return XNode.create(XmlCommon.DOM_ELEMENT_NODE, name, null, this);
    }

    // noinspection JSUnusedGlobalSymbols
    createDocumentFragment() {
        return XNode.create(XmlCommon.DOM_DOCUMENT_FRAGMENT_NODE,
            '#document-fragment', null, this);
    }

    createTextNode(value) {
        return XNode.create(XmlCommon.DOM_TEXT_NODE, '#text', value, this);
    }

    // noinspection JSUnusedGlobalSymbols
    createAttribute(name) {
        return XNode.create(XmlCommon.DOM_ATTRIBUTE_NODE, name, null, this);
    }

    createComment(data) {
        return XNode.create(XmlCommon.DOM_COMMENT_NODE, '#comment', data, this);
    }

    createCDATASection(data) {
        return XNode.create(XmlCommon.DOM_CDATA_SECTION_NODE, '#cdata-section', data,
            this);
    }

    /**
     * @return XDocument
     */
    static loadXML(xml) {
        return xmlParse(xml);
    }

   
    importNode(node) {
        const self = this;
        if (node.nodeType === XmlCommon.DOM_TEXT_NODE) {
            return this.createTextNode(node.nodeValue);

        } else if (node.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE) {
            return this.createCDATASection(node.nodeValue);

        } else if (node.nodeType === XmlCommon.DOM_ELEMENT_NODE) {
            const newNode = this.createElement(node.nodeName);
            for ( let i = 0; i < node.attributes.length; ++i) {
                const an = node.attributes[i];
                const name = an.nodeName;
                const value = an.nodeValue;
                newNode.setAttribute(name, value);
            }


            for ( let c = node.firstChild; c; c = c.nextSibling) {
                //var cn = arguments.callee(self, c);
                const cn = self.importNode(c);
                newNode.appendChild(cn);
            }

            return newNode;

        } else {
            return self.createComment(node.nodeName);
        }
    }
}

if (typeof Date.prototype.toXMLString === 'undefined') {
    /**
     * @returns {string}
     */
    const toXMLString = function()
    {
        const localeDate = new Date(this.getTime() - this.getTimezoneOffset() * 60000);
        const hours = Math.floor(Math.abs(this.getTimezoneOffset()/60)).toString(), minutes = Math.abs(this.getTimezoneOffset()%60).toString();
        const timeZoneString =   (this.getTimezoneOffset()<0 ? '+' : '-').concat(hours.length===1 ? '0'+hours : hours, ':', minutes.length===1 ? '0'+minutes : minutes);
        let localeDateString = localeDate.toISOString();
        if (localeDateString.indexOf('.')>0)
            localeDateString = localeDateString.substr(0, localeDateString.indexOf('.'));
        return localeDateString.concat(timeZoneString);
    };
    if (Object.defineProperty) {
        Object.defineProperty(Date.prototype, 'toXMLString', {
            value: toXMLString, configurable: true, enumerable: false, writable: true
        });
    }
    if (!Date.prototype.toXMLString) { Date.prototype.toXMLString = toXMLString; }

}



/**
 * @param {XDocument|XNode} parent
 */
Date.prototype.writeXml = function(parent) {
    if (typeof parent === 'undefined' || parent===null)
        return;
    if (parent.nodeType===1) {
        parent.appendChild(parent.ownerDocument.createTextNode(this.toXMLString()));
    }
    else if (parent.nodeType===9) {
        const node = parent.createElement('Date');
        node.appendChild(parent.createTextNode(this.toXMLString()));
        parent.appendChild(node);
    }
    else
        throw new Error('Parent node is of invalid type.');
};

if (typeof Date.prototype.writeXml === 'undefined') {
    /**
     * @param {XDocument|XNode} parent
     * @param {*=} options
     */
// eslint-disable-next-line no-unused-vars
    const dateWriteXml = function(parent, options) {
        if (typeof parent === 'undefined' || parent===null)
            return;
        if (parent.nodeType===1) {
            parent.appendChild(parent.ownerDocument.createTextNode(this.toXMLString()));
        }
        else
            throw new Error('Parent node is of invalid type.');
    };
    if (Object.defineProperty) {
        Object.defineProperty(Date.prototype, 'writeXml', {
            value: dateWriteXml, configurable: true, enumerable: false, writable: true
        });
    }
    if (!Date.prototype.writeXml) { Date.prototype.writeXml = dateWriteXml; }
}


if (typeof Array.prototype.writeXml === 'undefined') {
    /**
     * @param {XDocument|XNode} parent
     * @param {*=} options
     */
    const writeXml = function(parent, options) {
        if (typeof parent === 'undefined' || parent===null)
            return;
        options = options || { item:'Item' };
        for (let i = 0; i < this.length; i++) {
            const o = this[i];
            if (typeof o!=='undefined' && o!==null) {
                const name = options.item ? options.item : XSerializer.getClassName(o);
                XSerializer.writeXmlElement(parent, name, o, options);
            }
        }
    };
    if (Object.defineProperty) {
        Object.defineProperty(Array.prototype, 'writeXml', {
            value: writeXml, configurable: true, enumerable: false, writable: true
        });
    }
    if (!Array.prototype.writeXml) { Array.prototype.writeXml = writeXml; }
}


class XConverter {
    static toInteger(value) {
        if (value && /\d/.test(value)) {
            const result = parseInt(value);
            if (result>=-2147483648 && result<=2147483647)
                return result;
        }
        return 0;
    }

    static toFloat(value) {
        if (value && /\d/.test(value))
            return parseFloat(value);
        return 0;
    }

    static toLong(value) {
        if (value && /\d/.test(value))
            return parseInt(value);
        return 0;
    }
}

XConverter.DateTimeRegex = /^(\\d{4})-(\\d{1,2})-(\\d{1,2})T(\\d{1,22}):(\\d{2})(?::(\\d{2})(?:\\.(\\d{7}))?)?$/g;

XConverter.types = {
    boolean: {
        parse: function(value) {
            if (/true|TRUE/.test(value))
                return true;
            else if (/false|FALSE/.test(value))
                return false;
            else if (/\d/.test(value))
                return (parseInt(value)!==0);
            return false;
        }
    },
    byte: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=-128 && value<=127)
                    return value;
            }
            return 0;
        }
    },
    date: {
        parse: function(value) {
            if (typeof value === 'undefined' || value===null)
                return null;
            const match = value.match(XSerializer.DateTimeRegex);
            if (match!==null)
            {
                const year = parseInt(match[1]), month = parseInt(match[2]), day = parseInt(match[3]);
                return new Date(year, month, day);
            }
            else
            {
                throw new Error('Datetime format is invalid');
            }
        }
    },
    dateTime: {
        parse: function(value) {
            if (typeof value === 'undefined' || value===null)
                return null;
            const match = value.match(XConverter.DateTimeRegex);
            if (match!==null)
            {
                const year = parseInt(match[1]), month = parseInt(match[2]), day = parseInt(match[3]), hour = parseInt(match[4]), minute = parseInt(match[5]), second = match[6].length > 0 ? parseInt(match[6]) : 0;
                return new Date(year, month, day, hour, minute, second);
            }
            else
            {
                throw new Error('Datetime format is invalid');
            }
        }
    },
    decimal: {
        parse: XConverter.toFloat
    },
    double: {
        parse: XConverter.toFloat
    },
    gYear: {
        parse: function(value) {
            if (value && /^(18|20)\d{2}$/.test(value))
                return parseInt(value) > 0 ? parseInt(value) : 1899;
            return 1899;
        }
    },
    float: {
        parse: XConverter.toFloat
    },
    int: {
        parse: XConverter.toInteger
    },
    integer: {
        parse: XConverter.toInteger
    },
    long: {
        parse: XConverter.toLong
    },
    negativeInteger: {
        parse: function(value) {
            if (value && /\d/.test(value))
                return parseInt(value) < 0 ? parseInt(value) : -1;
            return -1;
        }
    },
    nonNegativeInteger: {
        parse: function(value) {
            if (value && /\d/.test(value))
                return parseInt(value) >= 0 ? parseInt(value) : 0;
            return 0;
        }
    },
    nonPositiveInteger : {
        parse: function(value) {
            if (value && /\d/.test(value))
                return parseInt(value) <= 0 ? parseInt(value) : 0;
            return 0;
        }
    },
    positiveInteger : {
        parse: function(value) {
            if (value && /\d/.test(value))
                return parseInt(value) > 0 ? parseInt(value) : 1;
            return 1;
        }
    },
    short: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=-32768 && value<=32767)
                    return value;
            }
            return 0;
        }
    },
    string: {
        parse: function(value) {
            if (typeof value === 'undefined' || value===null)
                return null;
            return value.toString();
        }
    },
    unsignedByte: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=0 && value<=255)
                    return value;
            }
            return 0;
        }
    },
    unsignedInt: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=0 && value<=4294967295)
                    return value;
            }
            return 0;
        }
    },
    unsignedLong: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=0 && value<=18446744073709551615)
                    return value;
            }
            return 0;
        }
    },
    unsignedShort: {
        parse: function(value) {
            if (value && /\d/.test(value)) {
                value = parseInt(value);
                if (value>=0 && value<=65535)
                    return value;
            }
            return 0;
        }
    }
};

/**
 * @class
 * @constructor
 */
class XSerializer {
    /**
     * Serializes any object in an equivalent XDocument instance
     * @param {*} obj
     * @param {*} options The serialization options
     * @returns {XNode}
     */
    static serialize(obj, options) {
        if (typeof obj === 'undefined' || obj===null)
            return null;
        options = options || { };
        XmlUtil._extend(options, { serializeNull:true } );
        const doc = new XDocument();
        const docName = options.root ? options.root :  XSerializer.getClassName(obj);
        //append child
        doc.appendChild(doc.createElement(docName));
        if (typeof obj.writeXml === 'function') {
            //call write xml
            obj.writeXml(doc.documentElement, options);
        }
        else {
            //add properties
            for (const prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    //do not serialize JS private properties e.g. _property, __property
                    if (!/^_/.test(prop)) {
                        XSerializer.writeXmlElement(doc.documentElement, prop, obj[prop], options);
                    }
                }
            }
        }
        return doc.documentElement;
    }

    /**
     * @param {XNode} parentNode The parent node
     * @param {String} propertyName The property name to be serialized
     * @param {*} propertyValue The property value to be serialized
     * @param {*} options The serialization options
     */
    static writeXmlElement(parentNode, propertyName, propertyValue, options) {
        if (typeof propertyName !== 'string')
            return;
        options = options || { serializeNull:true };
        const node = parentNode.ownerDocument.createElement(propertyName);
        if (typeof propertyValue === 'undefined' || propertyValue===null) {
            if (options.serializeNull) {
                parentNode.appendChild(node);
            }
            return;
        }
        if (typeof propertyValue === 'object') {
            if (typeof propertyValue.writeXml === 'function') {
                //call write xml
                propertyValue.writeXml(node);
            }
            else {
                //add properties
                for (const prop in propertyValue) {
                    if (propertyValue.hasOwnProperty(prop)) {
                        //do not serialize JS private properties e.g. _property, __property
                        if (!/^_/.test(prop)) {
                            XSerializer.writeXmlElement(node, prop, propertyValue[prop], options);
                        }
                    }
                }
            }
        }
        else {
            node.appendChild(node.ownerDocument.createTextNode(propertyValue));
        }
        parentNode.appendChild(node);
    }

    /**
     * @param {*} obj
     * @returns {string}
     */
    static getClassName(obj) {
        let name = XSerializer.SR_DEFAULT_ROOT;
        if (typeof obj === 'undefined' || obj === null)
            return name;
        //add document element
        if (obj.__proto__)
            if (obj.__proto__.constructor)
                name=obj.__proto__.constructor.name || XSerializer.SR_DEFAULT_ROOT;
        return name;
    }

    /**
     * @param {XNode} node
     */
    static unescape(node) {
        let type = null, value = null;
        //Xml Node
        if (node.nodeType===1) {
            //get type attribute
            const xsd = node.lookupPrefix(XSerializer.XmlSchema);
            type = xsd ? node.getAttribute(xsd.concat(':type')) : node.getAttribute('type') ;
            //get node inner text
            value = node.innerText();
        }
        //Xml Attribute
        else if (node.nodeType===2) {
            //get attribute value
            value = node.nodeValue;
        }
        if (type) {
            if (XConverter.types[type])
                return XConverter.types[type].parse(value);
            return XConverter.types.string.parse(value);
        }
        else {
            if (/^\d*\.?\d*$/.test(value))
                return XConverter.types.float.parse(value);
            return XConverter.types.string.parse(value);
        }
    }

    /**
     * Deserializes an XNode instance and returns the equivalent object or an instance of the class defined by the constructor provided.
     * @param {XNode} obj
     * @param {Function=} ctor
     */
    static deserialize(obj, ctor) {
        let result = {};
        if (typeof ctor === 'function') {
            result = new ctor();
            if (typeof result.readXml === 'function') {
                result.readXml(obj);
                return result;
            }
        }
        if (obj.nodeName==='Array' || obj.getAttribute('type')==='array') {
            result = [];
        }
        const nodes = obj.childNodes.filter(function(x) { return x.nodeType===1; });
        let first;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const childs = node.childNodes.filter(function(x) { return x.nodeType===1; });
            if (childs.length===0) {
                if (result[node.nodeName]) {
                    if (XmlUtil.isArray(result[node.nodeName])) {
                        //push item to array
                        result[node.nodeName].push(XSerializer.unescape(node));
                    }
                    else {
                        //create array of objects
                        first = result[node.nodeName];
                        result[node.nodeName] = [ first, XSerializer.unescape(node) ];
                    }
                }
                else {
                    //set single valued property
                    result[node.nodeName] = XSerializer.unescape(node);
                }
            }
            else {
                //deserialize object
                if (XmlUtil.isArray(result)) {
                    result.push(XSerializer.deserialize(node))
                }
                else {
                    const child = XSerializer.deserialize(node);
                    if (result[node.nodeName]) {
                        if (XmlUtil.isArray(result[node.nodeName])) {
                            //push item to array
                            result[node.nodeName].push(child);
                        }
                        else {
                            //create array of objects
                            first = result[node.nodeName];
                            result[node.nodeName] = [ first, child ];
                        }
                    }
                    else
                    {
                        result[node.nodeName] = child;
                    }
                }

            }
        }
        return result;
    }
}

XSerializer.SR_DEFAULT_ROOT = 'Object';


XSerializer.XmlSchema = 'http://www.w3.org/2001/XMLSchema';

class XNamespace {
    constructor(prefix, uri) {
        this.prefix = prefix;
        this.uri = uri;
    }
}

export {XDocument};
export {XNode};
export {XNodeType};
export {XSerializer};
export {XNamespace};