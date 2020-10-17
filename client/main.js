/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

SPOTIFIVE_COMMANDS = {
  pair: pairCommand,
  unpair: unpairCommand,
};

function pairCommand() {
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
      url: `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CONFIG.client_id}&scope=${SPOTIFY_CONFIG.scope}&redirect_uri=${SPOTIFY_CONFIG.redirect_uri}&state=${stateData}`
    }
  }));
}

function unpairCommand() {
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
}

// eslint-disable-next-line no-undef
RegisterCommand('spotifive', (src, args) => {
  const cmd = args[0];
  if (SPOTIFIVE_COMMANDS[cmd]) {
    args.shift();
    SPOTIFIVE_COMMANDS[cmd](args);
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