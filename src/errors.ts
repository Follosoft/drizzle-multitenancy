export class NoCurrentTenantError extends Error {
  constructor(message = 'No current tenant. Did you forget to use withTenant()?') {
    super(message)
    this.name = 'NoCurrentTenantError'
  }
}

export class TenantNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Tenant not found: ${identifier}`)
    this.name = 'TenantNotFoundError'
  }
}
