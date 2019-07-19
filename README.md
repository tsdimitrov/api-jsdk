# JavaScript SDK

## Installation

## Usage
```js
import Jsdk from "api-js-sdk";      
const jsdk = new Jsdk({ 
    apiCode: "JQq5BzW7a7d", 
    baseURL: "https://<api-url>/v1/",
    authURL: "https://<auth-url>/v1/"
}); 
```
## Filters
```js
let filters = {
          fields: ['id', 'name', 'activity'],
          with: ['activity']
        }
```
## Methods available
Methods available, separated by module:

### Authentication
* `userLogin()`
* `getToken()`

### Resources
* `get()`
* `post()`
* `put()`
* `delete()`

1. Use any of these gulp tasks to:
  1. `npm run watch` - Start development mode.
  2. `npm run lint` - Run lint check for src/*.js.
  3. `npm run docs:build` - Create a 'doc' folder with automatically generated documentation for the source code.
  4. `npm run build` - Build production ready package.
