/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

let spotifive_data = {
  name: '',
  startTime: 0,
  duration: 0,
  artists: 'None',
  playing: false,
  data: {},
  progress: 0,
  album_img: '',
  hide_ui: false
};

let isPaused = false;
let wasHidden = false;

SPOTIFIVE_COMMANDS['toggle'] = () => {
  spotifive_data.hide_ui = !spotifive_data.hide_ui;
  emit('chat:addMessage', {
    color: [30, 215, 96],
    multiline: false,
    args: ['SpotiFive', `HUD now ${spotifive_data.hide_ui ? '^1Hidden' : '^2Visible'}`]
  });
  if (spotifive_data.hide_ui) {
    SendNuiMessage(JSON.stringify({ type: 'hideAlbum' }));
  } else {
    spotifive_data.album_img && SendNuiMessage(JSON.stringify({
      type: 'loadAlbum',
      data: {
        imageUrl: spotifive_data.album_img,
        x: CONFIG.pos.x - 0.095,
        y: CONFIG.pos.y - 0.04,
        op: CONFIG.opacity
      }
    }));
  }
};

SPOTIFIVE_COMMANDS['move'] = (args) => {
  if (args[0] === 'reset') {
    args[0] = 0.5;
    args[1] = 0.95;
  }

  if (!parseFloat(args[0]) || !parseFloat(args[1])) return emit('chat:addMessage', {
    color: [30, 215, 96],
    multiline: false,
    args: ['SpotiFive', 'X or Y value is not a valid number.']
  });

  let parsedX = parseFloat(args[0]);
  let parsedY = parseFloat(args[1]);

  if (parsedX > 1.0) parsedX = 1.0;
  if (parsedX < 0.0) parsedX = 0.0;

  if (parsedY > 1.0) parsedY = 1.0;
  if (parsedY < 0.0) parsedY = 0.0;

  CONFIG.pos.x = parsedX;
  CONFIG.pos.y = parsedY;

  SetResourceKvpFloat('spotifive:position_x', CONFIG.pos.x);
  SetResourceKvpFloat('spotifive:position_y', CONFIG.pos.y);

  if (!spotifive_data.hide_ui && spotifive_data.album_img) {
    SendNuiMessage(JSON.stringify({
      type: 'loadAlbum',
      data: {
        imageUrl: spotifive_data.album_img,
        x: CONFIG.pos.x - 0.095,
        y: CONFIG.pos.y - 0.04
      }
    }));
  }

  emit('chat:addMessage', {
    color: [30, 215, 96],
    multiline: false,
    args: ['SpotiFive', `HUD position changed to ^3${parsedX}, ${parsedY}`]
  });
};

SPOTIFIVE_COMMANDS['opacity'] = (args) => {
  if (!parseInt(args[0])) return emit('chat:addMessage', {
    color: [30, 215, 96],
    multiline: false,
    args: ['SpotiFive', 'Opacity value invalid']
  });

  let parsedOpacity = parseInt(args[0]);

  if (parsedOpacity > 255) parsedOpacity = 255;
  if (parsedOpacity < 0) parsedOpacity = 0;

  CONFIG.opacity = parsedOpacity;

  SetResourceKvpInt('spotifive:opacity', CONFIG.opacity);

  if (!spotifive_data.hide_ui && spotifive_data.album_img) {
    SendNuiMessage(JSON.stringify({
      type: 'loadAlbum',
      data: {
        imageUrl: spotifive_data.album_img,
        x: CONFIG.pos.x - 0.095,
        y: CONFIG.pos.y - 0.04,
        opacity: CONFIG.opacity
      }
    }));
  }

  emit('chat:addMessage', {
    color: [30, 215, 96],
    multiline: false,
    args: ['SpotiFive', `Opacity set to ${parsedOpacity}`]
  });
};

let checkInterval = null;
let tickRunner = null;

function updateSong() {
  if (isPaused || spotifive_data.hide_ui) return;
  if (!GetResourceKvpString('spotifive:refresh_token') || !GetResourceKvpString('spotifive:access_token')) return;
  getCurrentSong((res) => {
    if (!res.ok || res.status === 204) return;
    const songData = res.data;
    const cleanedArtists = songData.item.artists.map((artist) => (artist.name));
    const newImage = songData.item.album.images.length > 0 ? songData.item.album.images[0].url : 'https://www.freepnglogos.com/uploads/spotify-logo-png/file-spotify-logo-png-4.png';

    if (spotifive_data.album_img !== newImage && !spotifive_data.hide_ui) {
      SendNuiMessage(JSON.stringify({
        type: 'loadAlbum',
        data: {
          imageUrl: newImage,
          x: CONFIG.pos.x - 0.095,
          y: CONFIG.pos.y - 0.04,
          opacity: CONFIG.opacity
        }
      }));
    }

    if (!spotifive_data.hide_ui && newImage) {
      SendNuiMessage(JSON.stringify({ type: 'showAlbum' }));
    }

    spotifive_data.name = songData.item.name.limit(20);
    spotifive_data.artists = cleanedArtists.join(', ').limit(25);
    spotifive_data.playing = songData.is_playing;
    spotifive_data.startTime = new Date(Date.now() - songData.progress_ms);
    spotifive_data.duration = songData.item.duration_ms;
    spotifive_data.progress = songData.progress_ms;
    spotifive_data.data = songData;
    spotifive_data.album_img = newImage;
  });
}

function DrawTxt(text, x, y, scale1, scale2) {
  SetTextFont(0);
  SetTextProportional(1);
  SetTextScale(scale1, scale2);
  SetTextEntry('STRING');
  SetTextColour(255, 255, 255, CONFIG.opacity);
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

function DrawSong() {
  if (!GetResourceKvpString('spotifive:refresh_token') || !GetResourceKvpString('spotifive:access_token')) return;

  if ((IsPauseMenuActive() || IsHudHidden()) && !isPaused) {
    isPaused = true;
    wasHidden = spotifive_data.hide_ui;
    spotifive_data.hide_ui = true;
    SendNuiMessage(JSON.stringify({
      type: 'hideAlbum',
    }));
  } else if (!(IsPauseMenuActive() || IsHudHidden()) && isPaused) {
    isPaused = false;
    if (!wasHidden) {
      spotifive_data.hide_ui = false;
      SendNuiMessage(JSON.stringify({
        type: 'showAlbum',
      }));
    }
  }

  if (!spotifive_data.hide_ui) {
    let newTime = ((Date.now() - spotifive_data.startTime) / 1000).toFixed(0) > spotifive_data.duration / 1000 ? (spotifive_data.duration / 1000).toFixed(0) : ((Date.now() - spotifive_data.startTime) / 1000).toFixed(0);
    const songDur = (spotifive_data.duration / 1000).toFixed(0);

    if (!spotifive_data.playing) newTime = (spotifive_data.progress) / 1000;

    DrawRect(CONFIG.pos.x, CONFIG.pos.y, 0.2, 0.1, 25, 20, 20, CONFIG.opacity);
    DrawRect(CONFIG.pos.x, CONFIG.pos.y + 0.048, 0.2, 0.004, 30, 215, 96, CONFIG.opacity);

    DrawTxt(spotifive_data.name, CONFIG.pos.x - 0.05, CONFIG.pos.y - 0.045, 0.0, 0.35);
    DrawTxt(spotifive_data.artists, CONFIG.pos.x - 0.05, CONFIG.pos.y - 0.015, 0.0, 0.3);

    DrawTxt(fancyTimeFormat(newTime), CONFIG.pos.x - 0.05, CONFIG.pos.y + 0.015, 0.0, 0.3);
    DrawRect(CONFIG.pos.x + 0.02, CONFIG.pos.y + 0.026, 0.09, 0.003, 35, 30, 30, CONFIG.opacity);

    const rectWidth = 0.09 * newTime / songDur;
    DrawRect((CONFIG.pos.x - 0.025) + (rectWidth / 2), CONFIG.pos.y + 0.026, rectWidth, 0.003, 255, 255, 255, CONFIG.opacity);
    DrawTxt(fancyTimeFormat(songDur), CONFIG.pos.x + 0.07, CONFIG.pos.y + 0.015, 0.0, 0.3);
  }

  const playerPed = PlayerPedId();

  //? SET_RADIO(tuning, station, artist, song)
  if (IsPedInAnyVehicle(playerPed) && HasScaleformMovieLoaded(scaleform.handle)) {
    SetVehicleRadioEnabled(GetVehiclePedIsIn(playerPed, false), !spotifive_data.playing);
    scaleform.callFunc('SET_RADIO', '', `Spotify${!spotifive_data.playing ? ' - Paused' : ''}`, spotifive_data.artists, spotifive_data.name);
  }

}

on('spotifive:connected', () => {
  if (!checkInterval) {
    updateSong();
    checkInterval = setInterval(updateSong, 5000);
  }
  if (!tickRunner) {
    tickRunner = setTick(DrawSong);
  }
});

on('spotifive:disconnected', () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    spotifive_data = {
      name: '',
      startTime: 0,
      duration: 0,
      artists: 'None',
      playing: false,
      data: {},
      progress: 0,
      album_img: '',
      hide_ui: false
    };
    checkInterval = null;
  }
  if (tickRunner) {
    clearTick(tickRunner);
    tickRunner = null;
  }
});