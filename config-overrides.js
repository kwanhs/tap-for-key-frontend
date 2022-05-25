const { 
    override,
    fixBabelImports,
    addLessLoader,
    addBabelPlugins,
    addDecoratorsLegacy,
    disableEsLint
} = require('customize-cra');

module.exports = override(
    disableEsLint(),
    ...addBabelPlugins(
        ["react-intl", {
            "messagesDir": "./src/i18n/messages/"
        }],
        "babel-plugin-root-import"
    ),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            '@layout-header-height': '40px',
            '@border-radius-base': '4px',
            '@table-padding-vertical': '8px',
            '@table-padding-horizontal': '8px'
        },
    }),
    addDecoratorsLegacy()
);