/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

// eslint-disable-next-line no-unused-vars
class Scaleform {
  constructor(scaleform) {
    this.scaleform = scaleform;
    this.handle = RequestScaleformMovie(scaleform);
    this.loaded = false;
  }

  draw2D() {
    DrawScaleformMovieFullscreen(this.handle);
  }

  draw3D(x, y, z, rot1, rot2, rot3, scale1, scale2, scale3) {
    DrawScaleformMovie_3dNonAdditive(this.handle, x, y, z, rot1, rot2, rot3, 2.0, 2.0, 10.0, scale1, scale2, scale3, 2);
  }

  dispose() {
    SetScaleformMovieAsNoLongerNeeded(this.handle);
    this.scaleform = null, this.handle = null, this.loaded = false;
  }

  load() {
    return new Promise((resolve) => {
      const loadTick = setTick(async () => {
        if (HasScaleformMovieLoaded(this.handle)) {
          this.loaded = true;
          resolve(this.loaded);
          clearTick(loadTick);
        }
      });
    });
  }

  callFunc(funcName, ...args) {
    BeginScaleformMovieMethod(this.handle, funcName);
    args.forEach((arg) => {
      switch (typeof arg) {
        case 'string':
          ScaleformMovieMethodAddParamTextureNameString(arg);
          break;
        case 'number':
          Number.isInteger(parseInt(arg)) ? ScaleformMovieMethodAddParamInt(arg) : ScaleformMovieMethodAddParamFloat(arg);
          break;
        case 'boolean':
          ScaleformMovieMethodAddParamBool(arg);
          break;
        default:
          ScaleformMovieMethodAddParamTextureNameString(arg);
          break;
      }
    });
    EndScaleformMovieMethod();
  }
}