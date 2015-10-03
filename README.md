Simple Router
=============

Define your routes as string or regex patterns that map to functions to call. Not middleware for an express app, 

Installation
------------

`npm i @bockit/simple-router`

Usage
-----

```javascript
import SimpleRouter from '@bockit/simple-router'

var router = new SimpleRouter()

router
    .get('/hello-world', (req) => {
        console.log('hello!')
    })
    .get('/goodbye-world', (req) => {
        console.log('goodbye!')
    })

router.process('/hello-world')
```