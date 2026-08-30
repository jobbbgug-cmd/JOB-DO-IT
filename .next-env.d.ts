/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    NODE_ENV?: string;
    NEXT_PUBLIC_API_URL?: string;
  }
}
