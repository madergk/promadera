import * as migration_20260806_035335_initial from './20260806_035335_initial';

export const migrations = [
  {
    up: migration_20260806_035335_initial.up,
    down: migration_20260806_035335_initial.down,
    name: '20260806_035335_initial'
  },
];
