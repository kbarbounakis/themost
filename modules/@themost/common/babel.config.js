module.exports = function (api) {
    api.cache(false);
    return {
        "sourceMaps": "inline",
         "presets": [
            [
                "@babel/preset-env",
                {
                    "targets": {
                        "node": "6.9.0",
                        "browsers": "> 0.25%, not dead"
                    },
                     "modules": "false"
                }
            ]
        ],
        "plugins": [
            [
                "@babel/plugin-transform-async-to-generator"
            ],
            [
                "@babel/plugin-proposal-export-default-from"
            ],
            [
                "@babel/plugin-proposal-export-namespace-from"
            ],
            [
                "@babel/plugin-proposal-decorators",
                {
                    "legacy": true
                }
            ],
            [
                "@babel/plugin-proposal-class-properties",
                {
                    "loose": true
                }
            ]
        ]
    };
};
