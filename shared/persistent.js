/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

SPOTIFY_CONFIG = {
  version: '1.2.2', //! DONT TOUCH THESE UNLESS YOU KNOW WHAT YOU ARE DOING
  client_id: 'c92707c27c9e40f88b19315bb753d917', //! DONT TOUCH THESE UNLESS YOU KNOW WHAT YOU ARE DOING
  scope: 'user-read-currently-playing,user-read-private,user-modify-playback-state', //! DONT TOUCH THESE UNLESS YOU KNOW WHAT YOU ARE DOING
  redirect_uri: 'https://spotifive.services.dislike.life/auth/begin', //! DONT TOUCH THESE UNLESS YOU KNOW WHAT YOU ARE DOING
};

const log = console.log;

function mtd(n) {
  return (n < 10 ? '0' : '') + n;
}

console.log = (...data) => {
  const curTime = new Date();
  log(`^2[${GetCurrentResourceName()}] ^4[${mtd(curTime.getHours())}:${mtd(curTime.getMinutes())}:${mtd(curTime.getSeconds())}]^7: ${data[0]}`);
};
