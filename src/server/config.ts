export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  env: process.env.NODE_ENV ?? 'development',
  apiKey: process.env.CIID_API_KEY ?? 'dev-key-cambiar-en-produccion',
  dbPath: process.env.CIID_DB_PATH ?? './ciid.db',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM ?? '',
  },
} as const;
