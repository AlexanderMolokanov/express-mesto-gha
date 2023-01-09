module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'es2021': true
    },

    
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },

        'rules': {
      'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
    'no-console': 'off',
    'quotes': [2, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }]
    }
}
