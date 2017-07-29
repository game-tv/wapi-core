'use strict';

module.exports.checkScopes = function checkScopes(wantedScope, scopes) {
    for (let i = 0; i < scopes.length; i++) {
        if (wantedScope.startsWith(scopes[i])) return true;
    }
    return false;
};
