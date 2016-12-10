module.exports = {
    root: true,
    env: {
        browser: true,
        amd: true
    },
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    // required to lint *.vue files
    // tpl
    // http://info.meteor.com/blog/set-up-sublime-text-for-meteor-es6-es2015-and-jsx-syntax-and-linting
    rules: {
        semi: [1, 'always'],
        // http://eslint.org/docs/rules
        quotes: [
            2, 'single', 'avoid-escape'    // http://eslint.org/docs/rules/quotes
        ],
        // http://eslint.org/docs/rules/no-unused-vars
        'no-unused-vars': [
            1, { vars: 'local', args: 'after-used' }
        ],
        'eol-last': 1,
        'no-debugger': 1,
        'padded-blocks': [1, 'never'],
        'brace-style': [2, 'stroustrup'],
        'comma-dangle': [2, 'only-multiline'],
        'space-before-function-paren': [2, 'never'],
        'no-multiple-empty-lines': [2, { max: 3 }],
        'keyword-spacing': [
            2, {
                before: true,
                after: true,
                overrides: {
                    'catch': {
                        after: false
                    },
                    'if': {
                        after: false
                    }
                }
            }
        ],
        indent: [2, 4],
        eqeqeq: 2,
        curly: 1
    }
};
