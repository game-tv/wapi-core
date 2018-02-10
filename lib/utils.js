'use strict'

module.exports.checkScopes = (wantedScope, scopes) => {
  if (scopes.indexOf('admin' > -1)) {
    return true
  }
  for (let i = 0; i < scopes.length; i++) {
    if (wantedScope.startsWith(scopes[i])) return true
  }
  return false
}
