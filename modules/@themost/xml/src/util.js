/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {XmlCommon} from './common';

// @constructor
class Set {
    constructor() {
        this.keys = [];
    }

    // noinspection JSUnusedGlobalSymbols
    size() {
        return this.keys.length;
    }

    // Adds the entry to the set, ignoring if it is present.
    // noinspection JSUnusedGlobalSymbols
    add(key, opt_value) {
        const value = opt_value || 1;
        if (!this.contains(key)) {
            this[':' + key] = value;
            this.keys.push(key);
        }
    }

    // Sets the entry in the set, adding if it is not yet present.
    // noinspection JSUnusedGlobalSymbols
    set(key, opt_value) {
        const value = opt_value || 1;
        if (!this.contains(key)) {
            this[':' + key] = value;
            this.keys.push(key);
        } else {
            this[':' + key] = value;
        }
    }

    // Increments the key's value by 1. This works around the fact that
    // numbers are always passed by value, never by reference, so that we
    // can't increment the value returned by get(), or the iterator
    // argument. Sets the key's value to 1 if it doesn't exist yet.
    // noinspection JSUnusedGlobalSymbols
    inc(key) {
        if (!this.contains(key)) {
            this[':' + key] = 1;
            this.keys.push(key);
        } else {
            this[':' + key]++;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    get(key) {
        if (this.contains(key)) {
            return this[':' + key];
        } else {
            return null;
        }
    }

    // Removes the entry from the set.
    // noinspection JSUnusedGlobalSymbols
    remove(key) {
        if (this.contains(key)) {
            delete this[':' + key];
            removeFromArray(this.keys, key, true);
        }
    }

    // Tests if an entry is in the set.
    contains(entry) {
        return typeof this[':' + entry] !== 'undefined';
    }

    // noinspection JSUnusedGlobalSymbols
    items() {
        const list = [];
        for (let i = 0; i < this.keys.length; ++i) {
            const k = this.keys[i];
            const v = this[':' + k];
            list.push(v);
        }
        return list;
    }

    // Invokes function f for every key value pair in the set as a method
    // of the set.
    // noinspection JSUnusedGlobalSymbols
    map(f) {
        for (let i = 0; i < this.keys.length; ++i) {
            const k = this.keys[i];
            f.call(this, k, this[':' + k]);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    clear() {
        for (let i = 0; i < this.keys.length; ++i) {
            delete this[':' + this.keys[i]];
        }
        this.keys.length = 0;
    }
}

/**
 * Removes value from array. Returns the number of instances of value
 * that were removed from array.
 */
function removeFromArray(array, value, opt_notype) {
    let shift = 0;
    for (let i = 0; i < array.length; ++i) {
        if (array[i] === value || (opt_notype && array[i] === value)) {
            array.splice(i--, 1);
            shift++;
        }
    }
    return shift;
}


class XmlUtil {
    // Splits a string s at all occurrences of character c. This is like
    // the split() method of the string object, but IE omits empty
    // strings, which violates the invariant (s.split(x).join(x) === s).
    // @param {String} s
    // @param {String} c
    // @returns Array
    static stringSplit(s, c) {
        let a = s.indexOf(c);
        if (a === -1) {
            return [s];
        }
        const parts = [];
        parts.push(s.substr(0, a));
        while (a !== -1) {
            const a1 = s.indexOf(c, a + 1);
            if (a1 !== -1) {
                parts.push(s.substr(a + 1, a1 - a - 1));
            } else {
                parts.push(s.substr(a + 1));
            }
            a = a1;
        }
        return parts;
    }

    // Applies the given function to each element of the array, preserving
    // this, and passing the index.
    static mapExec(array, func) {
        for (let i = 0; i < array.length; ++i) {
            func.call(this, array[i], i);
        }
    }

    // Returns an array that contains the return value of the given
    // function applied to every element of the input array.
    static mapExpr(array, func) {
        const ret = [];
        for (let i = 0; i < array.length; ++i) {
            ret.push(func(array[i]));
        }
        return ret;
    }

    // Returns the representation of a node as XML text.
    // noinspection JSUnusedGlobalSymbols
    static xmlText(node, opt_cdata) {
        const buf = [];
        this.xmlTextR(node, buf, opt_cdata);
        return buf.join('');
    }

    static xmlTextR(node, buf, cdata) {
        if (node.nodeType === XmlCommon.DOM_TEXT_NODE) {
            buf.push(this.xmlEscapeText(node.nodeValue));

        } else if (node.nodeType === XmlCommon.DOM_CDATA_SECTION_NODE) {
            if (cdata) {
                buf.push(node.nodeValue);
            } else {
                buf.push('<![CDATA[' + node.nodeValue + ']]>');
            }

        } else if (node.nodeType === XmlCommon.DOM_COMMENT_NODE) {
            buf.push('<!--' + node.nodeValue + '-->');

        } else if (node.nodeType === XmlCommon.DOM_ELEMENT_NODE) {
            var i;
            buf.push('<' + this.xmlFullNodeName(node));
            for (i = 0; i < node.attributes.length; ++i) {
                const a = node.attributes[i];
                if (a && a.nodeName && a.nodeValue) {
                    buf.push(' ' + this.xmlFullNodeName(a) + '="' +
                        this.xmlEscapeAttr(a.nodeValue) + '"');
                }
            }
            if (node.childNodes.length === 0) {
                buf.push('/>');
            } else {
                buf.push('>');
                for (i = 0; i < node.childNodes.length; ++i) {
                    arguments.callee(node.childNodes[i], buf, cdata);
                }
                buf.push('</' + this.xmlFullNodeName(node) + '>');
            }

        } else if (node.nodeType === XmlCommon.DOM_DOCUMENT_NODE ||
            node.nodeType === XmlCommon.DOM_DOCUMENT_FRAGMENT_NODE) {
            for (i = 0; i < node.childNodes.length; ++i) {
                arguments.callee(node.childNodes[i], buf, cdata);
            }
        }
    }

    static xmlFullNodeName(n) {
        if (n.prefix && n.nodeName.indexOf(n.prefix + ':') !== 0) {
            return n.prefix + ':' + n.nodeName;
        } else {
            return n.nodeName;
        }
    }

    static isArray(ar) {
        return Array.isArray(ar) ||
            (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated XmlUtl.format() function was deprecated
     * @param {*} f
     */
    // eslint-disable-next-line no-unused-vars
    static format(f) {
        throw new Error("XmlUtl.format() function was deprecated");
    }

    static _extend(origin, add) {
        // Don't do anything if add isn't an object
        if (!add || typeof add !== 'object') return origin;

        const keys = Object.keys(add);
        let i = keys.length;
        while (i--) {
            origin[keys[i]] = add[keys[i]];
        }
        return origin;
    }

    // Escape XML special markup characters: tag delimiter < > and entity
    // reference start delimiter &. The escaped string can be used in XML
    // text portions (i.e. between tags).
    static xmlEscapeText(s) {
        return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Escape XML special markup characters: tag delimiter < > entity
    // reference start delimiter & and quotes ". The escaped string can be
    // used in double quoted XML attribute value portions (i.e. in
    // attributes within start tags).
    static xmlEscapeAttr(s) {
        return this.xmlEscapeText(s).replace(/"/g, '&quot;');
    }

    /**
     * Escape markup in XML text, but don't touch entity references.
     * The escaped string can be used as XML text (i.e. between tags).
     * @param {string} s
     * @returns {XML|string}
     */
    // noinspection JSUnusedGlobalSymbols
    static xmlEscapeTags(s) {
        return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

export {XmlUtil};
