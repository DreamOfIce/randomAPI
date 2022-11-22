module.exports = {
  apps: [
    {
      name: 'hoyorandom',
      script: './index.js',
      args: 'print-log',
      env: {
        NODE_ENV: 'production',
      },
      out_file: './logs/access.log',
      error_file: './logs/error.log',
    },
  ],
};
