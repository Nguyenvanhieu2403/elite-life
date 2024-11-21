export type AppConfig = {
  nodeEnv: string;
  isPermissionValidate: boolean;
  name: string;
  workingDirectory: string;
  saleFrontendDomain: string;
  foreignFrontendDomain: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  docsName: string;
  docsUser: string;
  docsPassword: string;
  dirName: string;
  dirFile: string;
  dirTemplate: string;
};

export type AppleConfig = {
  appAudience: string[];
};

export type AuthConfig = {
  admin: {
    secret: string;
    expires?: string;
  },
  sale: {
    secret: string;
    expires?: string;
  }
};

export type DatabaseConfig = {
  url?: string;
  type?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  schema?: string;
  username?: string;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
};

export type FileConfig = {
  driver: string;
  maxFileSize: number;
};

export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};

export type AllConfigType = {
  app: AppConfig;
  apple: AppleConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  mail: MailConfig;
  file: FileConfig;
};
