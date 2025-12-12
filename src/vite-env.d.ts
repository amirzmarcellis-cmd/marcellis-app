/// <reference types="vite/client" />

declare global {
  function twinr_push_token_fetch(): {
    token: string;
    platform: 'android' | 'ios';
  };

  interface Window {
    twinr_push_token_fetch?: () => {
      token: string;
      platform: 'android' | 'ios';
    };
  }
}

export {};
