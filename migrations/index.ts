import * as migration_20260806_035335_initial from './20260806_035335_initial';
import * as migration_20260811_sync_schema from './20260811_sync_schema';
import * as migration_20260811_add_consultas_contacto from './20260811_add_consultas_contacto';
import * as migration_20260812_extend_proyecto_drafts from './20260812_extend_proyecto_drafts';

export const migrations = [
  {
    up: migration_20260806_035335_initial.up,
    down: migration_20260806_035335_initial.down,
    name: '20260806_035335_initial'
  },
  {
    up: migration_20260811_sync_schema.up,
    down: migration_20260811_sync_schema.down,
    name: '20260811_sync_schema'
  },
  {
    up: migration_20260811_add_consultas_contacto.up,
    down: migration_20260811_add_consultas_contacto.down,
    name: '20260811_add_consultas_contacto'
  },
  {
    up: migration_20260812_extend_proyecto_drafts.up,
    down: migration_20260812_extend_proyecto_drafts.down,
    name: '20260812_extend_proyecto_drafts'
  },
];
