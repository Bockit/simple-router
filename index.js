import * as qs from 'querystring'

/**
 * A simple router. Instantiate with no argument, and call
 * `router.route(<string>, <function>)` to add route handlers. Attempt to match a
 * URI with `router.process(<string>)`, calling the handler of the first matched
 * route and returning true, or finding no matches and returning false.
 */
export default class SimpleRouter {

    constructor () {
        this.routes = []
    }

    /**
     * Add a request handler.
     * @param  {String} pattern   The URI pattern. Backbone style pattern,
     *                            supports :named, *splat and (/optional)
     *                            patterns. Can also be a direct regex.
     * @param  {Function} handler The callback to be called when the route
     *                            matches
     * @return {Router}           The router instance for chaining
     */
    route (pattern, handler) {
        if (typeof pattern === 'string') {
            var regex = patternToRegex(pattern)
            var names = getNames(pattern)
        }
        else {
            var regex = pattern
            var names = null
            pattern = null
        }

        this.routes.push({ regex, pattern, handler })
        return this
    }

    /**
     * Try and match a uri against the defined routes. Returns true if it does,
     * false if it doesn't.
     * @param  {String} uri The URI to match
     * @return {Boolean}    Whether or not the URI matched a route.
     */
    process (uri) {
        for (let route of this.routes) {
            let req = matchRoute(route, uri)
            if (req) {
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

/**
 * Convert a route pattern to a regex
 * @param  {String} pattern A URI pattern, can include `/:named`, `/*splat` and
 *                          `(/optional)` parameters.
 * @return {RegExp}         The regex for matching routes
 */
export function patternToRegex (pattern) {
    let escaped = pattern.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, (match, optional) => {
            return optional ? match : '([^/?]+)'
        })
        .replace(splatParam, '([^?]*?)')

    return new RegExp('^' + escaped + '(?:\\?([\\s\\S]*))?$')
}



/**
 * Match a route object against a uri, returning a request object if matched
 * and null if not.
 * @param  {Object} route A route object. A route object has a URI `pattern`
 *                        string, a `regex` regular expression used to match
 *                        against a URI and a names array with all the named
 *                        parameters and splats in the pattern string.
 * @param  {String} uri   The URI to test the route against.
 * @return {Mixed}        If a route does not match the uri it returns `false`.
 *                        If it does match it returns a request object. A
 *                        request object has the following properties:
 *
 *                        * uri: The URI that was matched
 *                        * regex: The regex of the route used to match it
 *                        * pattern: The pattern of the route used to match it
 *                        * matched: The return value of matching the URI
 *                                   against the regex.
 *                        * query: An object representing the query parameters
 *                                 in the URI.
 *                        * params: An object representing the named params in
 *                                  the matched route pattern and their
 *                                  corresponding values.
 */
export function matchRoute (route, uri) {
    let { pattern, regex, names } = route
    let matched = regex.exec(uri)
    if (!matched) return null

    // No names, so use indexes
    if (!names) names = matched.map((v, i) => i)

    let params = names.reduce((ret, name, i) => {
        ret[name] = matched[i]
        return ret
    }, {})

    let query = getQuery(uri)

    return { uri, regex, pattern, matched, query, params }
}

/**
 * Given a uri string, parse the query out into a javascript object
 * @param  {String} uri The URI to get a query out of.
 * @return {Object}     The parsed query string.
 */
export function getQuery (uri) {
    // The query component is indicated by the first
    // question mark ("?") character and terminated by a
    // number sign ("#") character or by the end of the URI.
    if (uri.indexOf('#') > 0) uri = uri.split('#').slice(0, -1).join('#')
    return qs.parse(uri.split('?').slice(1).join('?'))
}

/**
 * Given a URI pattern string, return a list of the named params and splats
 * in the string.
 * @param  {String} string The URI pattern
 * @return {Array}         The list of named params and splats
 */
export function getNames (string) {
    let ret = []
    // Names can be :name and *name
    ret.push.apply(ret, extractFromPattern(string, namedParam))
    ret.push.apply(ret, extractFromPattern(string, splatParam))
    return ret
}

/**
 * Match a regex against a string and return the matches as an array, or an
 * empty array if there are no matches. Will remove the first character from
 * the matches because they aren't used (: or *).
 * @param  {String} string The string to match the regex to
 * @param  {RegExp} regex  The regex to match with
 * @return {Array}         The matched segments.
 */
export function extractFromPattern (string, regex) {
    return (string.match(regex) || [])
        // Remove the leading character, colon or star
        .map((name) => name.slice(1))
}