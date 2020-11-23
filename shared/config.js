/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

CONFIG = {
  pos: { //? repositions the UI on the screen
    x: GetResourceKvpFloat('spotifive:position_x') || 0.5,
    y: GetResourceKvpFloat('spotifive:position_y') || 0.95
  },
  opacity: GetResourceKvpInt('spotifive:opacity') || 255
};