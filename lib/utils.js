'use strict'

function checkScopes (wantedScope, scopes) {
  if (scopes.indexOf('admin' > -1)) {
    return true
  }
  for (let i = 0; i < scopes.length; i++) {
    if (wantedScope.startsWith(scopes[i])) return true
  }
  return false
}

function checkPermissions (account, wantedPermissions, requireAccount = true) {
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

function buildMissingScopeMessage (name, env, scopes) {
  if (!Array.isArray(scopes)) {
    scopes = [scopes]
  }
  scopes = scopes.map(s => buildFullyQualifiedScope(name, env, s))
  let message = 'missing scope' + (scopes.length > 1 ? 's' : '')
  message = message + ' ' + scopes.join(' or ')
  return message
}

function buildFullyQualifiedScope (name, env, scope) {
  const fqScope = `${name}-${env}`
  if (scope !== '') {
    return fqScope + ':' + scope
  }
  return fqScope
}

function isTrue (value) {
  if (typeof value === 'string') {
    return value === 'true'
  } else if (typeof value === 'boolean') {
    return value
  } else {
    return false
  }
}

module.exports = { buildFullyQualifiedScope, buildMissingScopeMessage, checkPermissions, checkScopes, isTrue }
