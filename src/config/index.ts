import dotenv from 'dotenv';

dotenv.config();

const config = {
  app: {
    name: process.env.APP_NAME,
    url: process.env.BASE_URL,
    env: process.env.ENV || 'dev',
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.DB_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    sync: !!JSON.parse(process.env.DB_SYNC),
    logging: !!JSON.parse(process.env.DB_LOGGING),
  },
  log: {
    dir: process.env.LOG_DIR || '',
    format: process.env.LOG_FORMAT || 'dev',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  mailgun: {
    key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    sender: process.env.MAILGUN_SENDER,
  },
  firebase: {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_EMAIL_CLIENT,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    storage_bucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  safehaven: {
    url: process.env.SAFEHAVEN_BASE_URL,
    client_assertion: process.env.SAFEHAVEN_CLIENT_ASSERTION,
    client_assertion_type: process.env.SAFEHAVEN_CLIENT_ASSERTION_TYPE,
    client_id: process.env.SAFEHAVEN_CLIENT_ID,
    grant_type: process.env.SAFEHAVEN_GRANT_TYPE,
    debit_account: process.env.SAFEHAVEN_DEBIT_ACCOUNT,
    refresh_token: process.env.SAFEHAVEN_REFRESH_TOKEN,
  },
};

export default config;
