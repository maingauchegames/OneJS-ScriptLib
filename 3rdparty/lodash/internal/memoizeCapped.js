"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var memoize_js_1 = require("../memoize.js");
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
    var result = (0, memoize_js_1.default)(func, function (key) {
        var cache = result.cache;
        if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
        }
        return key;
    });
    return result;
}
exports.default = memoizeCapped;
