import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';
import {QueryCollection} from './QueryCollection';
import {SqlFormatter2 as SqlFormatter} from './SqlFormatter2';

describe('SqlFormatter', () => {

    it('should create instance', ()=> {
        const formatter = new SqlFormatter();
        expect(formatter).toBeTruthy();
    });

    it('should use SqlFormatter.formatSelect()', ()=> {
        const formatter = new SqlFormatter();
        let query = {
            $collection: {
                'UserData': 1
            },
            $select: {},
        }
        let sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT * FROM `UserData`');
        formatter.settings.forceAlias = true;
        sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `UserData`.* FROM `UserData`');
        query = {
            $collection: {
                'Users': '$UserData'
            },
            $select: {},
        };
        sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `Users`.* FROM `UserData` AS `Users`');

    });

    it('should use SqlFormatter.escapeName()', ()=> {
        const formatter = new SqlFormatter();
        expect(formatter.escapeName('actionStatus')).toBe('`actionStatus`');
        expect(formatter.escapeName('$actionStatus')).toBe('`actionStatus`');
        expect(formatter.escapeName('ActionData.actionStatus')).toBe('`ActionData`.`actionStatus`');
        expect(formatter.escapeName('value1')).toBe('`value1`');
        expect(formatter.escapeName('value_100')).toBe('`value_100`');
        expect(formatter.escapeName('family_name')).toBe('`family_name`');
    });

    it('should use SqlFormatter.$eq()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.$eq({
            "actionStatus": {  "$eq" : 1 }
        });
        expect(sql).toBe('`actionStatus` = 1');
        sql = formatter.$eq({
            "$eq": [ "$actionStatus", 1 ]
        });
        expect(sql).toBe('`actionStatus` = 1');
        sql = formatter.$eq({
            "givenName": {  "$eq" : "John" }
        });
        expect(sql).toBe('`givenName` = \'John\'');
    });

    it('should use SqlFormatter.formatField()', ()=> {
        const formatter = new SqlFormatter();
        let query = {
            $collection: {
                'Users': '$UserData'
            },
            $select: {
                "id": 1,
                "name": 1
            }
        };
        let sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `id`, `name` FROM `UserData` AS `Users`');
    });

});