---
id: webchat-compatibility
title: Browser Compatibility
---

## Supported Browsers

Botonic supports the following browsers:

| Browser               | Version                                                               |
| --------------------- | --------------------------------------------------------------------- |
| Chrome                | 61 and later                                                          |
| Mozilla Firefox       | 56 and later                                                          |
| Opera                 | 41 and later                                                          |
| Safari                | 11 and later                                                          |
| Safari (iOS versions) | 11.3 and later                                                        |
| Edge                  | 79 and later                                                          |
| Internet Explorer     | **[11 (with polyfills)](#how-to-make-your-bot-compatible-with-ie11)** |



## IE 11 Compatibility

To make a bot compatible with IE11, its javascript code must be compliant with ES5. To do so, babel is used to transpile all the code.


To make the bot work in IE11:

1. Add the following meta in the bot's integration code:

```javascript
&lt;meta http-equiv="X-UA-Compatible" content="IE=11" /&gt;
```

2. If style rendering issues occur, disable webchat animations:

```javascript
theme: {
  animations: {
    enable: false,
  },
}
```

### Add polyfills

Some functionalities supported by most browsers are not implemented in IE11. To use them, polyfills are needed.

Here is a list of polyfills used in some of the bots:

- Basic polyfills: **[core-js](https://www.npmjs.com/package/core-js)**
- Style issues: **[@webcomponents/webcomponentsjs](https://www.npmjs.com/package/@webcomponents/webcomponentsjs)**
- scrollTo feature: **[element-scroll-polyfill](https://www.npmjs.com/package/element-scroll-polyfill)**
- normalize: **[unorm](https://www.npmjs.com/package/unorm)**

To add polyfills:

1. Open the `webpack.config.js` file.

2. Add all the polyfills that are currently used in the entry property within the `botonicWebchatConfig`.

```javascript
entry: [
  'core-js/stable/',
  'regenerator-runtime/runtime',
  '@webcomponents/webcomponentsjs',
  'element-scroll-polyfill',
  'unorm',
  path.resolve('src', 'webchat-entry.ts'),
],
```

**Note:** `core-js/stable`, `regenerator-runtime/runtime`, `@webcomponents/webcomponentsjs` and `element-scroll-polyfill` are mandatory.

### Configure the Babel loader

When configuring the Babel loader to transpile code to ES5 compliance, some options must be added/configured.

1. Set `sourceType` to 'unambiguous' (cf. issue: https://github.com/babel/babel/issues/8900 )

2. Add plugins to transform some new functionalities from ES6 to ES5. For example: [the arrow functions](https://www.npmjs.com/package/@babel/plugin-transform-arrow-functions)

```javascript
options: {
  sourceType: 'unambiguous',
  cacheDirectory: true,
  presets: [
    '@babel/react',
    [
      '@babel/env',
      {
        targets: {
          ie: '11',
        },
        useBuiltIns: 'entry',
        corejs: 3,
        modules: false, // Needed for tree shaking to work.
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    require('@babel/plugin-proposal-object-rest-spread'),
    require('@babel/plugin-proposal-class-properties'),
    require('babel-plugin-add-module-exports'),
    require('@babel/plugin-transform-runtime'),
    require('@babel/plugin-transform-object-assign'),
    require('@babel/plugin-transform-arrow-functions'),
    require('@babel/plugin-transform-classes'),
  ],
}
```

### Load the bot and correct the dependencies

You can now load the bot in IE11. If an error still occurs despite the correct configuration in `webpack.config.js`, you can solve it by finding the error and the dependency that produces the error.

To do so:

1. Open the developer tool (F12).
2. Click on the error messages line to display the exact part of the code where the error occurs.
3. Search for parts of the code that are unique/exclusive of a package. E.g. function names, class names, text messages, etc.
4. Look for these parts in the `node_modules` folder to see which dependency contains that piece of code.
5. Once the dependency that produces the error is found, add it to babel to transpile its code to ES5.
6. Add the name of the dependency in the exclude option (regexp) to include it.

Example with babel transpiling the dependency "axios":

Before: `exclude: /node_modules[\/\\](?!(styled-components|@emotion|@rehooks|@botonic\/(core|react|plugin-google-analytics))[\/\\])/,`

After: `exclude: /node_modules[\/\\](?!(axios|styled-components|@emotion|@rehooks|@botonic\/(core|react|plugin-google-analytics))[\/\\])/,`

## Known IE11 issues

- **SCRIPT445: Object doesn't support this action:** This error may appear due to the use of the `babel-plugin-add-module-exports` plugin. If the bot is using this plugin try to remove it and see if the error disappears"
- **Parameter properties (typescript):** If [parameter properties](https://www.typescriptlang.org/docs/handbook/classes.html#parameter-properties) are used in the bot's implementation, they must be removed. All the attributes must be explicitly initialized in the constructor itself to work properly in IE11.
  For now, [it seems there is no proper solution](https://github.com/babel/babel/issues/7074) that can mantain the parameter properties from constructors and keep compatibility with IE11: when the code is transpiled to ES5, the attributes are not correctly initialized and the implementation fails to work.
  You can enable the option `'@typescript-eslint/no-parameter-properties': 'error'` in eslint to detect all the autoassigned attributes in constructors (parameter properties implementations).
- **Style issue - Blank space after messages:** IE11 seems to have a spacing issue when a `&lt;p&gt;` element is inside a `&lt;div&gt;` element, adding some blank space in the bottom of the `&lt;p&gt;` element. To fix this spacing issue, you can add these specific styles in a scss file (imported in `src/webchat/index.js`) that will be applied only for IE11:

  ```scss
  @media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {
  /* IE10+ specific styles go here **/
  /**
  .hwaLqT is the parent div of every message. Check the correct class name generated for each bot and replace this one with the correct one.
  The option "white-space: normal" here in conjunction with "white-space: normal" in .text-user and .text-bot removes the blank space after the text message.
  **/
  .hwaLqT {
  	white-space: normal !important;
  	&gt; div {
  		/** Added this overflow in order to fix height issues (blank spaces) with some of the bot messages. */
  		overflow: auto;
  	}
  }
  .text-user {
  	&gt; div {
  		white-space: normal !important;
  	}
  }
  .text-bot {
  	&gt; div {
  		white-space: normal !important;
  	}
  }
  ```

- **SCRIPT5009**: 'Proxy' is not defined: `framer-motion` doesn't have IE11 support in newer versions ^2.6.6 so an older version has to be installed (^1.11.1 for example) in the project itself and aliased in `resolveConfig`: `'framer-motion': path.resolve(__dirname, 'node_modules', 'framer-motion'),`
