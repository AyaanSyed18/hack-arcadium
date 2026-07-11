module.exports = {
  apps: [
    {
      name: 'arcadium-web',
      script: 'npm',
      args: 'run dev',
      autorestart: true,
      max_size: '10M',
      retain: '5',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'arcadium-whatsapp-bot',
      script: 'npx',
      args: 'tsx scripts/whatsapp-bot.ts',
      autorestart: true,
      watch: false,
      max_size: '10M',
      retain: '5',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'arcadium-discord-bot',
      script: 'npx',
      args: 'tsx scripts/discord-bot.ts',
      autorestart: true,
      watch: false,
      max_size: '10M',
      retain: '5',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
