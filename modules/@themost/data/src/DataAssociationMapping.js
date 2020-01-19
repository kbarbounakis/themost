import _ from 'lodash';
/**
 * @classdesc DataAssociationMapping class describes the association between two models.
 * <p>
 *     An association between two models is described in field attributes. For example
 *     model Order may have an association with model Party (Person or Organization) through the field Order.customer:
 * </p>
 <pre class="prettyprint"><code>
   { "name": "Order",
     "fields": [
    ...
   {
        "name": "customer",
        "title": "Customer",
        "description": "Party placing the order.",
        "type": "Party"
    }
    ...]
    }
 </code></pre>
 <p>
      This association is equivalent with the following DataAssociationMapping instance:
 </p>
 <pre class="prettyprint"><code>
 "mapping": {
    "cascade": "null",
    "associationType": "association",
    "select": [],
    "childField": "customer",
    "childModel": "Order",
    "parentField": "id",
    "parentModel": "Party"
}
 </code></pre>
  <p>
 The above association mapping was auto-generated from the field definition of Order.customer where the field type (Party)
 actually defines the association between these models.
 </p>
 <p>
 Another example of an association between two models is a many-to-many association. User model has a many-to-many association (for user groups) with Group model:
 </p>
 <pre class="prettyprint"><code>
 { "name": "User",
   "fields": [
  ...
 {
    "name": "groups",
    "title": "User Groups",
    "description": "A collection of groups where user belongs.",
    "type": "Group",
    "expandable": true,
    "mapping": {
        "associationAdapter": "GroupMembers",
        "parentModel": "Group",
        "parentField": "id",
        "childModel": "User",
        "childField": "id",
        "associationType": "junction",
        "cascade": "delete"
    }
}
  ...]
  }
 </code></pre>
 <p>This association may also be defined in Group model:</p>
 <pre class="prettyprint"><code>
 { "name": "Group",
   "fields": [
  ...
 {
    "name": "members",
    "title": "Group Members",
    "description": "Contains the collection of group members (users or groups).",
    "type": "Account",
    "many":true
}
  ...]
  }
 </code></pre>
 *
 * @class
 * @property {string} associationAdapter - Gets or sets the association database object
 * @property {string} parentModel - Gets or sets the parent model name
 * @property {string} childModel - Gets or sets the child model name
 * @property {string} parentField - Gets or sets the parent field name
 * @property {string} childField - Gets or sets the child field name
 * @property {string} associationObjectField - Gets or sets the name of the parent field as it is defined in association adapter. This attribute is optional but it is required for many-to-many associations where parent and child model are the same.
 * @property {string} associationValueField - Gets or sets the name of the child field as it is defined in association adapter. This attribute is optional but it is required for many-to-many associations where parent and child model are the same.
 * @property {string} refersTo - Gets or sets the parent property where this association refers to
 * @property {string} parentLabel - Gets or sets the parent field that is going to be used as label for this association
 * @property {string} cascade - Gets or sets the action that occurs when parent item is going to be deleted (all|none|null|delete). The default value is 'none'.
 * @property {string} associationType - Gets or sets the type of this association (junction|association). The default value is 'association'.
 * @property {Array<DataModelPrivilege>} privilege - Gets or sets a collection of privileges which are going to be attached in a many-to-many association
 * @property {string[]} select - Gets or sets an array of fields to select from associated model. If this property is empty then all associated model fields will be selected.
 * @property {*} options - Gets or sets a set of default options which are going to be used while expanding results based on this data association.
 * @param {*=} obj - An object that contains relation mapping attributes
 * @constructor
 */
class DataAssociationMapping {
    constructor(obj) {
        this.cascade = 'none';
        this.associationType = 'association';
        //this.select = [];
        if (typeof obj === 'object') {
            _.assign(this, obj);
        }
    }
}
export {DataAssociationMapping};