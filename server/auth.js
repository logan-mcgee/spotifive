/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/server/index.d.ts" />

let canRun = true;
const { setHttpCallback } = require('@citizenfx/http-wrapper');
const Koa = require('koa');
const queryString = require('query-string');
const app = new Koa();
if (typeof axios === 'undefined') axios = require('axios').default;
if (GetCurrentResourceName() !== 'spotifive') {
  canRun = false;
  console.log('^1the resource name MUST be named "spotifive" in order to function. please rename the resource and try again.^7');
}

if (canRun) {
  const currentAuthers = {};
  const currentRefresh = {};

  app.use(async ctx => {
    const req = await queryString.parseUrl(ctx.request.url);
    if (req.url === '/auth') {
      const pairSrc = currentAuthers[req.query.user];
      delete currentAuthers[req.query.user];
      emitNet('spotifive:giveCode', pairSrc, req.query.access_token, req.query.refresh_token);
      ctx.body = 'done';
      return;
    }
    ctx.body = 'no.';
  });

  onNet('spotifive:beginPair', async (pseudoNum) => {
    currentAuthers[pseudoNum] = source;
  });

  onNet('spotifive:refreshToken', async (refreshToken) => {
    const src = source;
    if (currentRefresh[src] === GetPlayerIdentifier(src, 0)) {
      return;
    } else if (currentRefresh[src] !== GetPlayerIdentifier(src, 0) && currentRefresh[src]) delete currentRefresh[src];

    currentRefresh[src] = GetPlayerIdentifier(src, 0);
    try {
      const refreshRes = await axios({
        url: 'https://spotifive.services.dislike.life/auth/renew',
        params: {
          refreshToken
        }
      });
      emitNet('spotifive:giveCode', src, refreshRes.data.access_token);
      delete currentRefresh[src];
    } catch (err) {
      delete currentRefresh[src];
      if (err.message === 'Request failed with status code 403') { //? hack as i think fivem breaks err.response
        console.log('Token revoked. removing from client');
        return emitNet('spotifive:removeCode', src);
      }
      console.log('Token renewal err: ' + err);
    }
  });

  setHttpCallback(app.callback());
}