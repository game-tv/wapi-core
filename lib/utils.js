'use strict'

module.exports.checkScopes = function checkScopes (wantedScope, scopes) {
  if (scopes.indexOf('admin' > -1)) {
    return true
  }
  for (let i = 0; i < scopes.length; i++) {
    if (wantedScope.startsWith(scopes[i])) return true
  }
  return false
}
module.exports.checkPermissions = function checkPermissions (account, wantedPermissions, requireAccount = true) {
  if (!account) {
    return !requireAccount
  }
  if (account.perms.all) {
    return true
  }
  for (const perm of wantedPermissions) {
    if (account.perms[perm]) {
      return true
    }
  }
  return false
}
