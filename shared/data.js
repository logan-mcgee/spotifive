/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

CONFIG_C = {
  version: '1.0.0',
  client_id: 'c92707c27c9e40f88b19315bb753d917',
  scope: 'user-read-currently-playing',
  redirect_uri: 'https://spotifive.services.dislike.life/auth/begin'
};

const log = console.log;

function mtd(n) {
  return (n < 10 ? '0' : '') + n;
}

console.log = (...data) => {
  const curTime = new Date();
  log(`^2[${GetCurrentResourceName()}] ^4[${mtd(curTime.getHours())}:${mtd(curTime.getMinutes())}:${mtd(curTime.getSeconds())}]^7: ${data[0]}`);
};
