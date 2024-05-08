import { Logger } from '@nestjs/common';
import axios, { CreateAxiosDefaults } from 'axios';
import axiosRetry, { IAxiosRetryConfigExtended } from 'axios-retry';

axiosRetry(axios, {
  retries: 1,
  shouldResetTimeout: true,
  retryDelay: () => 1000,
  retryCondition: () => true,
  onRetry: (retryCount) => Logger.warn(`retry attempt: ${retryCount}`, 'axios'),
});

const api = (config?: CreateAxiosDefaults<any>, version?: string) => {
  const api = axios.create({ timeout: 60000, ...config });

  api.interceptors.request.use((request) => {
    Logger.log(`${request?.baseURL ?? ''}${request.url}`, `${version} ${request.method.toUpperCase()}`);

    const query = request.params ? `?${new URLSearchParams(request.params).toString()}` : '';
    if (query) {
      Logger.log(`${request?.baseURL ?? ''}${request.url}${query}`, `${version ?? 'axios'} ${request.method.toUpperCase()}`);
    }
    return request;
  });

  return api;
};

const petroplay_v1 = async (retry?: IAxiosRetryConfigExtended) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-secret-key': process.env.PETROPLAY_SECRET_KEY,
  };

  return api({ baseURL: process.env.PETROPLAY_V1_URL, headers, 'axios-retry': retry }, 'V1');
};

const petroplay_v2 = async (retry?: IAxiosRetryConfigExtended) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-secret-key': process.env.PETROPLAY_SECRET_KEY,
  };

  return api({ baseURL: process.env.PETROPLAY_V2_URL, headers, 'axios-retry': retry }, 'V2');
};

const dealernet = async (retry?: IAxiosRetryConfigExtended) => {
  const headers = {
    'Content-Type': 'text/xml;charset=utf-8',
  };

  return api({ headers, 'axios-retry': retry }, 'DEALERNET');
};

const petroplay = {
  v1: petroplay_v1,
  v2: petroplay_v2,
};

const webClient = api();

export { webClient, dealernet, petroplay };
