module.exports = {
  apps: [
    {
      name: 'multi-tenant-portfolio',
      cwd: '/var/www/portfolio-admin',
      script: '.next/standalone/server.js',
      // Node 24 REQUIRED: the bundle uses the global File API (missing on the
      // VPS default Node 18 → "ReferenceError: File is not defined"). pm2
      // ignores `interpreter` in cluster mode, so fork is mandatory too —
      // no scaling loss on a single-CPU box.
      interpreter: '/root/.nvm/versions/node/v24.13.1/bin/node',
      instances: 1,
      exec_mode: 'fork',

      // 🟢 SAFETY 1: Restart process if it exceeds a limit (e.g., 1GB)
      // This is a "hard reset" to clear memory leaks.
      max_memory_restart: '1G',

      // 🟢 SAFETY 2: Tell Node/V8 to be aggressive with garbage collection
      // --max-old-space-size: Sets the limit where Node starts GC heavily.
      // --gc-interval: Frequency of the garbage collector.
      // --env-file: load runtime secrets (DATABASE_URI, PAYLOAD_SECRET, …)
      // from /var/www/portfolio-admin/.env — never committed, never synced
      // by deploys (see DEPLOY.md). No secrets in this file.
      node_args: '--max-old-space-size=300 --env-file=.env',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
