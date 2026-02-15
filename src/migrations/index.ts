import * as migration_20260215_180208 from './20260215_180208';

export const migrations = [
  {
    up: migration_20260215_180208.up,
    down: migration_20260215_180208.down,
    name: '20260215_180208'
  },
];
