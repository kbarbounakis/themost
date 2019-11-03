import {Token} from "./Token";

/**
 * @class
 */
export class LiteralToken extends Token {

    static LiteralType =
        {
            Null: 'Null',
            String: 'String',
            Boolean: 'Boolean',
            Single: 'Single',
            Double: 'Double',
            Decimal: 'Decimal',
            Int: 'Int',
            Long: 'Long',
            Binary: 'Binary',
            DateTime: 'DateTime',
            Guid: 'Guid',
            Duration: 'Duration'
        };

    static StringType =
        {
            None: 'None',
            Binary: 'Binary',
            DateTime: 'DateTime',
            Guid: 'Guid',
            Time: 'Time',
            DateTimeOffset: 'DateTimeOffset'
        };

    static PositiveInfinity = new LiteralToken(NaN, LiteralToken.LiteralType.Double);
    static NegativeInfinity = new LiteralToken(NaN, LiteralToken.LiteralType.Double);
    static NaN = new LiteralToken(NaN, LiteralToken.LiteralType.Double);
    static True = new LiteralToken(true, LiteralToken.LiteralType.Boolean);
    static False = new LiteralToken(false, LiteralToken.LiteralType.Boolean);
    static Null = new LiteralToken(null, LiteralToken.LiteralType.Null);

    /**
     * @param {*} value
     * @param {String} literalType
     * @constructor
     */
    constructor(value, literalType) {
        super(Token.TokenType.Literal);
        this.value = value;
        this.literalType = literalType;
    }
}
