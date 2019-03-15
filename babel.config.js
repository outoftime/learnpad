const fs = require('fs');
const path = require('path');

let targets;
if (process.env.DEBUG === 'true') {
  targets = {browsers: 'last 1 Chrome version'};
} else {
  targets = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'config/browsers.json')),
  );
}

module.exports = {
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {targets, modules: false}],
  ],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  compact: false,
  overrides: [
    {
      include: './node_modules/parse5-sax-parser/lib/index.js',
    },
  ],
};
