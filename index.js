import * as qs from 'querystring'

export default class SimpleRouter {

    constructor () {
        this.routes = []
    }

    get (pattern, handler) {
        if (typeof pattern === 'string') {
            var regex = patternToRegex(pattern)
            var names = getNames(pattern)
        }
        else {
            var regex = pattern
            var names = null
            pattern = null
        }

        this.routes.push({ regex, pattern, handler,  })
    }

    process (url) {
        for (let route of this.routes) {
            if (let req = matchRoute(route, uri)) {
                route.handler(req)
                return true
            }
        }
        return false
    }
}

// These regular expressions and the patternToRegex function have been sourced
// from backbone.

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
export const optionalParam = /\((.*?)\)/g
export const namedParam = /(\(\?)?:\w+/g
export const splatParam = /\*\w+/g
export const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g

export function patternToRegex (pattern) {
    let escaped = pattern.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, (match, optional) => {
            return optional ? match : '([^/?]+)'
        })
        .replace(splatParam, '([^?]*?)')

    return new RegExp('^' + escaped + '(?:\\?([\\s\\S]*))?$')
}

export function matchRoute (route, uri) {
    let { regex, pattern, handler, names } = route
    let matched = regex.exec(uri)
    if (!matched) return null
    // Passes the query string as the last cell in the array. Get rid of it!
    // Only for non-regex routes, route.names doesn't exist in regex routes.
    if (var names = route.names) {
        matched = matched.slice(0, -1)
    }
    else {
        // No names, so use indexes
        names = matched.map((v, i) => i)
    }
    let params = {}
    for (let i = 0; i < matched.length; i++) {
        params[names[i]] = matched[i]
    }
    let query = getQuery(uri)

    return { uri, regex, pattern, matched, query, params }
}

export function getQuery (uri) {
    return qs.parse(uri.split('?').slice(1).join('?')
}

export function getNames (string) {
    let ret = []
    ret.push.apply(ret, process(string, namedParam))
    ret.push.apply(ret, process(string, splatParam))
    return ret
}

export function process (string, regex) {
    let matches = string.match(regex) || []
    let indexes = getIndexes(string, regex)
    let arr = []
    for (let i = 0; i < matches.length; i++) {
        arr.push([ matches[i], indexes[i] ])
    }
    return arr.sort((a, b) => a[1] - b[1])
        .map(([ name ]) => name.slice(1))
}
export function getIndexes (string, regex) {
    let ret = []
    while (regex.test(string)) {
        ret.push(regex.lastIndex)
    }
    return ret
}