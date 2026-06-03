module.exports = {
  apps: [
    {
      name: 'multi-tenant-portfolio',
      script: '/var/www/portfolio-admin/.next/standalone/server.js',
      instances: 'max',
      exec_mode: 'cluster',

      // 🟢 SAFETY 1: Restart process if it exceeds a limit (e.g., 1GB)
      // This is a "hard reset" to clear memory leaks.
      max_memory_restart: '1G',

      // 🟢 SAFETY 2: Tell Node/V8 to be aggressive with garbage collection
      // --max-old-space-size: Sets the limit where Node starts GC heavily.
      // --gc-interval: Frequency of the garbage collector.
      node_args: '--max-old-space-size=300',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URI: 'postgresql://neondb_owner:npg_lgnmCyZ38dva@ep-super-firefly-a1rjgu37-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        PAYLOAD_SECRET: '4ca13d993b1e2d789734dada',
        PREVIEW_SECRET: 'YOUR_SECRET_HERE',
        CRON_SECRET: 'YOUR_CRON_SECRET_HERE',
      },
    },
  ],
}
