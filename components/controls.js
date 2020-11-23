/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

let hasPremium = false;
let tickData = null;

function showHelpText(text) {
  BeginTextCommandDisplayHelp('STRING');
  AddTextComponentSubstringPlayerName(text);
  EndTextCommandDisplayHelp(0, 0, 1, -1);
}

function performAction(type) {
  let method = 'POST';
  if (type === 'pause' || type === 'play') method = 'PUT';
  makeRequest(`https://api.spotify.com/v1/me/player/${type}`, {
    method,
    headers: {
      Authorization: `Bearer ${GetResourceKvpString('spotifive:access_token')}`
    }
  }, (res) => {
    if (!res.status === 204) console.log('err: ' + res);
  });
}

on('spotifive:connected', async (user) => {
  if (user && user.product === 'premium') hasPremium = true;

  if (hasPremium && !tickData) {
    const sf = new Scaleform('instructional_buttons');
    await sf.load();

    tickData = setTick(() => {
      if (IsControlPressed(2, 19)) {
        sf.draw2D();

        // ? skip
        if (IsControlJustPressed(2, 190)) {
          sf.callFunc('FLASH_BUTTON_BY_ID', 0);
          performAction('next');
        }

        // ? pause
        if (IsControlJustPressed(2, 179)) {
          sf.callFunc('FLASH_BUTTON_BY_ID', 1);
          if (spotifive_data.playing) {
            performAction('pause');
          } else {
            performAction('play');
          }
        }

        // ? prev
        if (IsControlJustPressed(2, 189)) {
          sf.callFunc('FLASH_BUTTON_BY_ID', 2);
          performAction('previous');
        }
      }

      if (IsControlJustPressed(2, 19)) {
        sf.callFunc('CLEAR_ALL');
        sf.callFunc('SET_CLEAR_SPACE', 200);

        sf.callFunc('SET_DATA_SLOT', 0, GetControlInstructionalButton(2, 190, true), 'Skip song');
        sf.callFunc('SET_DATA_SLOT', 1, GetControlInstructionalButton(2, 179, true), 'Pause/resume');
        sf.callFunc('SET_DATA_SLOT', 2, GetControlInstructionalButton(2, 189, true), 'Previous song');
        
        sf.callFunc('DRAW_INSTRUCTIONAL_BUTTONS', -1);
        sf.callFunc('SET_BACKGROUND_COLOUR', 0, 0, 0, 80);
      }
    });

    showHelpText('~g~Spotifive~w~ detected ~y~Spotify Premium. ~w~Media controls are enabled!');
  }
});

on('spotifive:disconnected', () => {
  if (tickData) {
    isPlaying = false; hasPremium = false;
    clearTick(tickData);
    tickData = null;
  }
});