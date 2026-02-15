module.exports = {
  apps: [
    {
      name: 'multi-tenant-portfolio',
      script: '.next/standalone/server.js',
      instances: 'max',
      exec_mode: 'cluster',

      // Restart if memory exceeds ~350MB
      max_memory_restart: '350M',

      // Limit Node heap to 350MB
      node_args: '--max-old-space-size=350',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
