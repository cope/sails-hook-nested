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

#### Getting started

* Add nested object with attribute rules

```js
module.exports = {

  nested: {
    arrayOfObjects: {
      type: 'array',
      of: {
        yo: {type: 'int', optional: true},
        wa: {type: 'int', optional: true},
        res: {type: 'int', optional: true},
        entry: {type: 'int', optional: true},
        correct: 'boolean'
      }
    },
    nestedAttributes: {
      ten: {type: 'int', min: 0, max: 10, optional: true},
      shoo: {type: 'int', optional: true},
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
