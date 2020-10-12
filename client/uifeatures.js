/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

let spotifive_data = {
  name: '',
  startTime: 0,
  duration: 0,
  artists: [],
  playing: false,
  data: {},
  progress: 0,
  album_img: '',
  hide_ui: false
};

RegisterCommand('spotifiveui', (src, args) => {
  switch(args[0]) {
    case 'toggle':
      spotifive_data.hide_ui = !spotifive_data.hide_ui;
      emit('chat:addMessage', {
        color: [30, 215, 96],
        multiline: false,
        args: ['SpotiFive', `HUD now ${spotifive_data.hide_ui ? '^1Hidden': '^2Visible'}`]
      });
      if (spotifive_data.hide_ui) {
        SendNuiMessage(JSON.stringify({ type: 'hideAlbum' }));
      } else {
        spotifive_data.album_img && SendNuiMessage(JSON.stringify({ type: 'showAlbum' }));
      }
      break;
  }
});

setInterval(() => {
  if (!GetResourceKvpString('spotifive:refresh_token') || !GetResourceKvpString('spotifive:access_token')) return;
  getCurrentSong((success, songData) => {
    const cleanedArtists = songData.item.artists.map((artist) => (artist.name));
    const newImage = songData.item.album.images.length > 0 ? songData.item.album.images[0].url : 'https://www.freepnglogos.com/uploads/spotify-logo-png/file-spotify-logo-png-4.png';

    if (spotifive_data.album_img !== newImage && !spotifive_data.hide_ui) {
      SendNuiMessage(JSON.stringify({
        type: 'loadAlbum',
        data: {
          imageUrl: newImage,
          x: CONFIG_C.spotiPos.x - 0.095,
          y: CONFIG_C.spotiPos.y - 0.04
        }
      }));
    }

    if (!spotifive_data.hide_ui) SendNuiMessage(JSON.stringify({ type: 'showAlbum' }));

    spotifive_data.name = songData.item.name;
    spotifive_data.artists = cleanedArtists;
    spotifive_data.playing = !success ? false : songData.is_playing;
    spotifive_data.startTime = new Date(Date.now() - songData.progress_ms);
    spotifive_data.duration = songData.item.duration_ms;
    spotifive_data.progress = songData.progress_ms;
    spotifive_data.data = songData;
    spotifive_data.album_img = newImage;
  });

}, 5000);

function DrawTxt(text, x, y, scale1, scale2) {
  SetTextFont(0);
  SetTextProportional(1);
  SetTextScale(scale1, scale2);
  SetTextEntry('STRING');
  AddTextComponentString(text);
  DrawText(x, y);
}

let scaleform = new Scaleform('dashboard');

function fancyTimeFormat(duration) {
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  var ret = '';

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

String.prototype.limit = function (length) {
  return this.length > length ? (this.substring(0, length) + '...') : this;
};

setTick(async () => {
  await Wait(0);
  if (!GetResourceKvpString('spotifive:refresh_token') || !GetResourceKvpString('spotifive:access_token')) return;
  if (spotifive_data.artists.length === 0) return;

  if (!spotifive_data.hide_ui) {
    let newTime = ((Date.now() - spotifive_data.startTime) / 1000).toFixed(0) > spotifive_data.duration / 1000 ? (spotifive_data.duration / 1000).toFixed(0) : ((Date.now() - spotifive_data.startTime) / 1000).toFixed(0);
    const songDur = (spotifive_data.duration / 1000).toFixed(0);

    if (!spotifive_data.playing) newTime = (spotifive_data.progress) / 1000;

    DrawRect(CONFIG_C.spotiPos.x, CONFIG_C.spotiPos.y, 0.2, 0.1, 25, 20, 20, 255);
    DrawRect(CONFIG_C.spotiPos.x, CONFIG_C.spotiPos.y + 0.048, 0.2, 0.004, 30, 215, 96, 255);

    DrawTxt(spotifive_data.name.limit(25), CONFIG_C.spotiPos.x - 0.05, CONFIG_C.spotiPos.y - 0.045, 0.0, 0.35);
    DrawTxt(spotifive_data.artists.join(', ').limit(30), CONFIG_C.spotiPos.x - 0.05, CONFIG_C.spotiPos.y - 0.015, 0.0, 0.3);

    DrawTxt(fancyTimeFormat(newTime), CONFIG_C.spotiPos.x - 0.05, CONFIG_C.spotiPos.y + 0.015, 0.0, 0.3);
    DrawRect(CONFIG_C.spotiPos.x + 0.02, CONFIG_C.spotiPos.y + 0.026, 0.09, 0.003, 35, 30, 30, 255);

    const rectWidth = 0.09 * newTime / songDur;
    DrawRect((CONFIG_C.spotiPos.x - 0.025) + (rectWidth / 2), CONFIG_C.spotiPos.y + 0.026, rectWidth, 0.003, 255, 255, 255, 255);
    DrawTxt(fancyTimeFormat(songDur), CONFIG_C.spotiPos.x + 0.07, CONFIG_C.spotiPos.y + 0.015, 0.0, 0.3);
  }

  const playerPed = PlayerPedId();

  //? SET_RADIO(tuning, station, artist, song)
  if (IsPedInAnyVehicle(playerPed) && HasScaleformMovieLoaded(scaleform.handle)) {
    SetVehicleRadioEnabled(GetVehiclePedIsIn(playerPed, false), !spotifive_data.playing);
    scaleform.callFunc('SET_RADIO', '', `Spotify${!spotifive_data.playing ? ' - Paused' : ''}`, spotifive_data.artists.join(', '), spotifive_data.name);
  }

});