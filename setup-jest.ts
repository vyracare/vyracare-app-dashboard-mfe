import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';

if (!globalThis.atob) {
  globalThis.atob = (data: string): string =>
    Buffer.from(data, 'base64').toString('binary');
}

if (!globalThis.btoa) {
  globalThis.btoa = (data: string): string =>
    Buffer.from(data, 'binary').toString('base64');
}

setupZoneTestEnv();
