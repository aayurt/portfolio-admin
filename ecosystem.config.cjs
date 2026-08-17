module.exports = {
  apps: [
    {
      name: 'multi-tenant-portfolio',
      cwd: '/var/www/portfolio-admin',
      script: '/var/www/portfolio-admin/.next/standalone/server.js',
      // Fork mode: cluster mode crash-loops this app on the VPS (silent
      // restarts under memory pressure). The box has a single CPU, so there
      // is no scaling loss from using one fork.
      instances: 1,
      exec_mode: 'fork',

      // 🟢 SAFETY 1: Restart process if it exceeds a limit (e.g., 1GB)
      // This is a "hard reset" to clear memory leaks.
      max_memory_restart: '1G',

      // 🟢 SAFETY 2: Tell Node/V8 to be aggressive with garbage collection
      // --max-old-space-size: Sets the limit where Node starts GC heavily.
      // --env-file: load DATABASE_URI, PAYLOAD_SECRET, PREVIEW_SECRET,
      // CRON_SECRET and MEDIA_STATIC_DIR from /var/www/portfolio-admin/.env
      // (kept off the server, never committed to git).
      node_args: '--max-old-space-size=300 --env-file=.env',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
