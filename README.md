![awoo](https://i.imgur.com/dTuYvKG.jpg)
# wapi-core
The core module of all cute weeb apis

## How to use it:

1. Install via yarn (or npm if u are a pleb)
```
yarn add git+ssh://git@github.com:weeb-services/wapi-core.git

npm i git+ssh://git@github.com:weeb-services/wapi-core.git
```
2. Require the module and use its stuff
```js
const { BaseMiddleware, BaseRouter, Constants, GenericRouter, WildcardRouter } = require('wapi-core');
```

## How to develop with it

- When adding a new middleware extend the `BaseMiddleware`.
 To add your middleware to the app itself,
  add it via it's .middleware() function
- When adding a new router extend the `BaseRouter`,
to add your router to the app itself,
 add it via it's .router() function
