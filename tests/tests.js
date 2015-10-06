import test from 'tape'
import Router, { patternToRegex, matchRoute, getQuery, getNames } from '../index'

// This doesn't need extreme testing, it comes from backbone so I'm operating
// under the assumption that is tested properly. Just need to know that it
// creates regular expressions
test('Converts patterns into regular expressions', function (t) {
    var regex = patternToRegex('/hello/:world')
    t.equals(Object.prototype.toString.call(regex), '[object RegExp]',
        'Creates regular expressions')
    t.end()
})

test('Route matching to uris', function (t) {
    let pattern
    let regex
    let names

    pattern = '/hello/:world'
    regex = patternToRegex(pattern)
    names = [ 'world' ]
    t.ok(matchRoute({ pattern, regex, names }, '/hello/bob'), 'Simple param')
    t.notOk(matchRoute({ pattern, regex, names }, '/hello'), 'Simple param - no match')

    pattern = '/hello/*world'
    regex = patternToRegex(pattern)
    names = [ 'world' ]
    t.ok(matchRoute({ pattern, regex, names }, '/hello/bob/foo'), 'Simple splat')
    t.notOk(matchRoute({ pattern, regex, names }, '/baz/bob/foo'), 'Simple splat - no match')

    pattern = '/hello(/:world)'
    regex = patternToRegex(pattern)
    names = [ 'world' ]
    t.ok(matchRoute({ pattern, regex, names }, '/hello'), 'Optional')
    t.ok(matchRoute({ pattern, regex, names }, '/hello/world'), 'Optional - including optional')
    t.notOk(matchRoute({ pattern, regex, names }, '/hell/world'), 'Optional - no match')

    pattern = '/hello(/:world)/:bar'
    regex = patternToRegex(pattern)
    names = [ 'world', 'bar' ]
    t.ok(matchRoute({ pattern, regex, names }, '/hello/world'), 'Optional and simple')
    t.ok(matchRoute({ pattern, regex, names }, '/hello/world/foo'), 'Optional and simple - including optional')
    t.notOk(matchRoute({ pattern, regex, names }, '/hello/world/foo/baz'), 'Optional and simple - too many')

    t.end()
})

test('Extracting the query string from a uri', function (t) {
    t.deepEquals(getQuery('/hello?foo=bar'), { foo: 'bar' }, 'Read query string from uri')
    t.deepEquals(getQuery('/hello'), {}, 'Empty query string')
    t.end()
})

test('Read names of parameters from a uri pattern', function (t) {
    t.deepEquals(getNames('/hello/:world'), [ 'world'], 'Simple param')
    t.deepEquals(getNames('/hello/*world'), [ 'world'], 'Simple splat')
    t.deepEquals(getNames('/hello/:world/:foo'), [ 'world', 'foo' ], 'Correct order')
    t.deepEquals(getNames('/hello/:world(/:bar)/:foo'), [ 'world', 'bar', 'foo' ], 'Optional params')
    t.deepEquals(getNames('/hello'), [], 'No names')
    t.end()
})

test('Create routes', function (t) {
    let router = new Router
    let noop = function () {}

    router.get('/hello', noop)
    t.equals(router.routes.length, 1, 'Routes are added to the router')
    t.ok(router.routes[0] != null && typeof router.routes[0] === 'object', 'Route objects are created')
    t.end()
})

test('Calls handlers', function (t) {
    t.plan(1)
    let router = new Router
    router.get('/hello', function () {
        t.pass('Handler is called')
    })
    router.process('/hello')
    t.end()
})