/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

// eslint-disable-next-line no-undef
RegisterCommand('spotifive', (src, args) => {
  switch (args[0]) {
    case 'pair':
      if (GetResourceKvpString('spotifive:refresh_token') && GetResourceKvpString('spotifive:access_token')) return emit('chat:addMessage', {
        color: [30, 215, 96],
        multiline: false,
        args: ['SpotiFive', 'SpotiFive is already paired']
      });

      console.log('PAIR SEQUENCE STARTED');
      const pseudoNum = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const stateData = encodeURI(JSON.stringify({
        authCode: pseudoNum,
        serverEndpoint: GetCurrentServerEndpoint()
      }));
      emitNet('spotifive:beginPair', pseudoNum);
      SendNuiMessage(JSON.stringify({
        type: 'sendLink',
        data: {
          url: `https://accounts.spotify.com/authorize?response_type=code&client_id=${CONFIG_C.client_id}&scope=${CONFIG_C.scope}&redirect_uri=${CONFIG_C.redirect_uri}&state=${stateData}`
        }
      }));
      break;
    case 'unpair':
      if (!GetResourceKvpString('spotifive:refresh_token') && !GetResourceKvpString('spotifive:access_token')) return emit('chat:addMessage', {
        color: [30, 215, 96],
        multiline: false,
        args: ['SpotiFive', 'SpotiFive already unpaired']
      });

      emit('chat:addMessage', {
        color: [30, 215, 96],
        multiline: false,
        args: ['SpotiFive', 'SpotiFive now unpaired']
      });
      SendNuiMessage(JSON.stringify({
        type: 'hideAlbum'
      }));
      SetResourceKvp('spotifive:access_token', '');
      SetResourceKvp('spotifive:refresh_token', '');
      break;
  }
});

let callbackIds = {};

onNet('spotifive:giveCode', (access_token, refresh_token) => {
  console.log('RECIEVED TOKEN');
  SetResourceKvp('spotifive:access_token', access_token);
  if (refresh_token) {
    emit('chat:addMessage', {
      color: [30, 215, 96],
      multiline: false,
      args: ['SpotiFive', 'SpotiFive is now paired']
    });
    SetResourceKvp('spotifive:refresh_token', refresh_token);
  }
});

function refreshToken() {
  console.log('TOKEN EXPIRED. REQUESTING REFRESH.');
  emitNet('spotifive:refreshToken', GetResourceKvpString('spotifive:refresh_token'));
}

function getCurrentSong(callback) {
  if (!GetResourceKvpString('spotifive:refresh_token') || !GetResourceKvpString('spotifive:access_token')) return;
  // eslint-disable-next-line no-case-declarations
  const pseudoNum = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  callbackIds[pseudoNum] = callback;

  SendNuiMessage(JSON.stringify({
    type: 'getCurrentSong',
    data: {
      access_token: GetResourceKvpString('spotifive:access_token'),
      callback: pseudoNum
    }
  }));
}

RegisterNuiCallbackType('currentSongData');

on('__cfx_nui:currentSongData', (data, cb) => {
  if (!data.success && data.needRefresh) return refreshToken();
  callbackIds[data.callback](data.success, data.data);
  callbackIds[data.callback] = null;
  cb({ success: true });
});