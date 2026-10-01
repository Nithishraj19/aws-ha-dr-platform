const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

test('health and version endpoints respond', async (t) => {
  const port = 3100 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: __dirname + '/..', env: { ...process.env, PORT: String(port), APP_VERSION: 'test-7' }, stdio: 'ignore'
  });
  t.after(() => child.kill());
  let response;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { response = await fetch(`http://127.0.0.1:${port}/health`); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(response, 'server should start');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'UP' });
  const version = await fetch(`http://127.0.0.1:${port}/version`);
  assert.deepEqual(await version.json(), { version: 'test-7' });
});
