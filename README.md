<a href="http://stojadinovic.net">
  <img alt="Predrag Stojadinovic" src="https://en.stojadinovic.net/assets/images/logo-128x128-88.jpg" width="100">
</a>

## sails-hook-nested
[![build status](https://img.shields.io/travis/cope/sails-hook-nested.svg?branch=master)](https://travis-ci.org/cope/sails-hook-nested)
[![codacy](https://img.shields.io/codacy/grade/60322e02d8df469893dbb8c0a89e5cc8.svg)](https://www.codacy.com/project/cope/sails-hook-nested/dashboard)
[![coverage](https://img.shields.io/coveralls/github/cope/sails-hook-nested/master.svg)](https://coveralls.io/github/cope/sails-hook-nested?branch=master)
[![dependencies](https://david-dm.org/cope/sails-hook-nested.svg)](https://www.npmjs.com/package/sails-hook-nested)
[![npm](https://img.shields.io/npm/dt/sails-hook-nested.svg)](https://www.npmjs.com/package/sails-hook-nested)

Nested attributes for sails models.

---

### TODO
* Remove the nested object and add nested definitions directly in the attributes

### Getting started

Add a nested object to your model, with attribute rules. 

These rules **must** conform to the [forgJs](https://github.com/oussamahamdaoui/forgJs) syntax!

```js
module.exports = {

  nested: {
    arrayOfObjects: {
      type: 'array',
      of: {
        wa: {type: 'int', optional: true},
        res: {type: 'string'},
        entry: {type: 'int'},
        correct: 'boolean'
      }
    },
    nestedAttributes: {
      ten: {type: 'int', min: 0, max: 10, optional: true},
      shoo: {type: 'string', minLength: 6, maxLength: 22},
      maybe: 'boolean'
    }
  },

  attributes: {
    arrayOfObjects: {type: 'json', required: true},
    nestedAttributes: {type: 'json'},
    num: {type: 'int'}
  }

};
```
