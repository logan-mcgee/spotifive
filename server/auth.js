/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/server/index.d.ts" />

const { setHttpCallback } = require('@citizenfx/http-wrapper');
const Koa = require('koa');
const queryString = require('query-string');
const app = new Koa();
if (typeof axios === 'undefined') axios = require('axios').default;

const currentAuthers = {};

app.use(async ctx => {
  const req = await queryString.parseUrl(ctx.request.url);
  if (req.url === '/auth') {
    const pairSrc = currentAuthers[req.query.user];
    currentAuthers[req.query.user] = null;
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
  try {
    const refreshRes = await axios({
      url: 'https://spotifive.services.dislike.life/auth/renew',
      params: {
        refreshToken
      }
    });
    emitNet('spotifive:giveCode', source, refreshRes.data.access_token);
  } catch (err) {
    console.log('Token renewal err: ' + err);
  }
});

setHttpCallback(app.callback());