# Validate Syntax Webpack Plugin

A Webpack plugin to validate the syntax in your bundles. Uses
[Acorn](https://github.com/acornjs/acorn) internally.

## Why?

The motivation for writing this plugin was that we had an issue in our front-end
React app where some ES6 code was making its way into the app bundle, which
broke the site in Internet Explorer. Upon investigation we discovered that the
code in question was coming from one of the third-party packages we were using
that was written in ES6 but was not transpiled before shipping. We wanted our
build process to throw an error if any invalid code makes it into the compiled
bundle but we couldn't find a plugin to do that, so we created one.

## Requirements

- Node >= 6.4.0
- Webpack 2 or 3

## Install

```sh
// via yarn
yarn add -D validate-syntax-webpack-plugin

// via npm
npm install -D validate-syntax-webpack-plugin
```

## Usage

**webpack.config.js**

```js
const ValidateSyntaxWebpackPlugin = require('validate-syntax-webpack-plugin');

module.exports = {
  plugins: [
    new ValidateSyntaxWebpackPlugin({ /* plugin options */ }),
  ],
};
```

### Options

The plugin currently takes the following options:

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`ecmaVersion`**|`number`|`5`|The ECMAScript version to validate against|
|**`sourceType`**|`string`|`"script"`|Set to `"module"` if you're compiling to ES modules instead of CommonJS|
|**`test`**|`RegExp \| Array<RegExp>`|`/\\.js$/i`|Test to match files against|
|**`include`**|`RegExp \| Array<RegExp>`|`null`|Files to include|
|**`exclude`**|`RegExp \| Array<RegExp>`|`null`|Files to exclude|
