import * as migration_20260215_180208 from './20260215_180208';
import * as migration_20260602_add_tenant_indexes from './20260602_add_tenant_indexes';

export const migrations = [
  {
    up: migration_20260215_180208.up,
    down: migration_20260215_180208.down,
    name: '20260215_180208'
  },
  {
    up: migration_20260602_add_tenant_indexes.up,
    down: migration_20260602_add_tenant_indexes.down,
    name: '20260602_add_tenant_indexes'
  },
];
