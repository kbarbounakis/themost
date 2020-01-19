/**
 * @classdesc Represents a privilege which is defined in a data model and it may be given in users and groups
 * @class
 * @constructor
 * @property {PermissionMask} mask - Gets or sets the set of permissions which may be given with this privilege.
 * @property {PrivilegeType|string} type - Gets or sets the type of this privilege (global|parent|item|self).
 * @property {string} filter - Gets or sets a filter expression which is going to be used for self privileges.
 * The defined set of permissions are automatically assigned if the requested objects fulfill filter criteria.
 * (e.g. read-write permissions for a user's associated person through the following expression:"user eq me()")
 * @property {string} account - Gets or sets a wildcard (*) expression for global privileges only.
 * The defined set of permissions are automatically assigned to all users (e.g. read permissions for all users)
 */
function DataModelPrivilege() {
}
export {DataModelPrivilege};

