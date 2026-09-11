export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.API_PORT || 4000),
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:3000',
  adminPath: process.env.ADMIN_PATH || '/y-panel',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  },
  fx: {
    usdTry: Number(process.env.FX_USD_TRY || 41),
  },
  mail: { provider: process.env.MAIL_PROVIDER || 'smtp' },
  sms: { provider: process.env.SMS_PROVIDER || 'netgsm' },
  payment: {
    defaultProvider: process.env.PAYMENT_DEFAULT_PROVIDER || 'iyzico',
    iyzico: {
      apiKey: process.env.IYZICO_API_KEY || '',
      secretKey: process.env.IYZICO_SECRET || '',
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
    },
  },
});
