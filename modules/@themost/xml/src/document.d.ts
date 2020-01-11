/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare class XNamespace {
    constructor(prefix: string, uri: string);
    prefix: string;
    uri: string;
}

export declare interface XSerializerOptions {
    root: string;
}

export declare class XSerializer {
    static serialize(obj: any, options?: XSerializerOptions): XNode;
    static deserialize(obj: XNode, ctor?: Function): any;
}

export declare class XNodeType {
    static DOM_ELEMENT_NODE: number;
    static DOM_ATTRIBUTE_NODE: number;
    static DOM_TEXT_NODE: number;
    static DOM_CDATA_SECTION_NODE: number;
    static DOM_ENTITY_REFERENCE_NODE: number;
    static DOM_ENTITY_NODE: number;
    static DOM_PROCESSING_INSTRUCTION_NODE: number;
    static DOM_COMMENT_NODE: number;
    static DOM_DOCUMENT_NODE: number;
    static DOM_DOCUMENT_TYPE_NODE: number;
    static DOM_DOCUMENT_FRAGMENT_NODE: number;
    static DOM_NOTATION_NODE: number;
}

export declare class XNode {
    constructor(type: string, name: string, opt_value?: any, opt_owner?: any);
    nodeName: string;
    nodeType: number;
    appendChild(node: XNode): XNode;
    replaceChild(newNode: XNode, oldNode: XNode): XNode;
    insertBefore(newNode: XNode, oldNode: XNode): XNode;
    prependChild(newNode: XNode): XNode;
    removeChild(node: XNode): XNode;
    hasAttributes(): boolean;
    hasAttribute(name: string): boolean;
    setAttribute(name: string, value: any): void;
    getAttribute(name: string): string;
    removeAttribute(name: string): void;
    getElementsByTagName(name: string):Array<XNode>;
    getElementById(id: string): XNode;
    value(): any;
    hasChildNodes(): boolean;
    innerText(s: string): string;
    innerXML(xml: string): string;
    outerXML(): string;
    selectNodes(expr: string, ns?:Array<XNamespace>):Array<XNode>;
    selectSingleNode(expr: string, ns?:Array<XNamespace>):XNode;
    removeAll(): void;
    name(): string;
    lookupPrefix(namespaceURI: string): string;

}

export declare class XDocument extends XNode {
    constructor();
    static loadXML(xml: string): XDocument;
    documentElement: XNode;
    clear(): void;
    appendChild(node: any): void;
    createElement(name: string): XNode;
    createDocumentFragment(): XNode;
    createTextNode(value: any): XNode;
    createAttribute(name: string): XNode;
    createComment(data: string): XNode;
    createCDATASection(data: string): XNode;
    importNode(node: XNode): XNode;

}
