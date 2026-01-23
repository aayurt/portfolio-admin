module.exports = {
  apps: [
    {
      name: 'next-app',
      script: '.next/standalone/server.js', // Point to the standalone server
      instances: 'max', // Use all CPU cores (Cluster Mode)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8080, // Match this with your Nginx proxy port
      },
    },
  ],
}
