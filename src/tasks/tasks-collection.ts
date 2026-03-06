import type { Tenant, TenantContext, SwitchTenantTask } from '../types.js'

export function createTasksCollection(tasks: SwitchTenantTask[]): SwitchTenantTask {
  return {
    async makeCurrent(tenant: Tenant, ctx: TenantContext) {
      for (const task of tasks) {
        await task.makeCurrent(tenant, ctx)
      }
    },
    async forgetCurrent(ctx: TenantContext) {
      for (const task of [...tasks].reverse()) {
        await task.forgetCurrent(ctx)
      }
    },
  }
}
