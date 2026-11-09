import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['scripts/run-framework.mjs', 'build'], {
  stdio: 'inherit', env: { ...process.env, AULAEMDIA_DEMO: '1' },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
