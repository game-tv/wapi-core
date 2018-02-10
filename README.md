![awoo](https://i.imgur.com/dTuYvKG.jpg)
# wapi-core
Utility module for weeb.sh apis

![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)

## How to use it:

1. Install via yarn (or npm if u are a pleb)
```
yarn add @weeb_services/wapi-core

npm i @weeb_services/wapi-core
```
2. Require the module and use its stuff
```js
const { BaseMiddleware, BaseRouter, Constants, GenericRouter, WildcardRouter } = require('@weeb_services/wapi-core');
```

## How to develop with it

- When adding a new middleware extend the `BaseMiddleware`.
 To add your middleware to the app itself,
  add it via it's .middleware() function
- When adding a new router extend the `BaseRouter`,
to add your router to the app itself,
 add it via it's .router() function
