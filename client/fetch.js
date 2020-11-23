/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />
const callbackIds = {};

function makeRequest(url, options, callback) {
  const pseudoNum = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  callbackIds[pseudoNum] = callback;

  SendNuiMessage(JSON.stringify({
    type: 'makeRequest',
    data: {
      url,
      options,
      cbId: pseudoNum
    }
  }));
}

RegisterNuiCallbackType('response');

on('__cfx_nui:response', (data, cb) => {
  cb({ recv: true });
  const id = data.cbId;
  delete data.cbId;
  callbackIds[id](data);
  delete callbackIds[data.callback];
});