Simple Router
=============

Define your routes as string or regex patterns that map to functions to call.

Installation
------------

`npm i @bockit/simple-router`

Usage
-----

```javascript
import SimpleRouter from '@bockit/simple-router'

var router = new SimpleRouter()

router.route('/hello/:name', (req) => {
    console.log('hello ' + req.params.name + '!')
})

router.process('/hello/James') // 'hello James!'
```

API
---

### `new SimpleRouter()`

Instantiates a new router instance. Has public methods `route(pattern, handler)` and `process(uri)`.

### `route(pattern, handler)`

Set up a handler function for routes that match a pattern. The pattern can be a regex or a string. If it's a string, we use [backbone's route matching patterns.][backbone routes]

[backbone routes]: http://backbonejs.org/#Router-routes

`handler` is a function that takes one argument, the request object.

##### The request object

The request object has the following properties: 

* `uri`: The uri that was matched.
* `regex`: The regex used to match the route.
* `pattern`: The pattern for this route. If the pattern was a regex, this is null.
* `matched`: The matched groups in the `uri` from the `regex`.
* `query`: An object representing the query parameters, if available, in the `uri`.
* `params`: An object whose keys are the names of the params and splats in `pattern` and values are their corresponding values in `matched`. If the pattern was a regex, the keys are indices and the values are the corresponding matched values.

For example, `/foo/:bar` matching `/foo/quux?beep=boop` becomes:

```javascript
{
    uri: '/foo/quux?beep=boop',
    regex: /^/foo/([^/?]+)(?:\?([\s\S]*))?$/,
    pattern: '/foo/:bar',
    matched: [ 'quux' ],
    query: {
        beep: 'boop'
    },
    params: {
        bar: 'quux'
    }
}
```

### `process(uri)`

Run a `uri` through the routes in a router, calling the handler if a match is found.