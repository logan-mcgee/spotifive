/* eslint-disable no-undef */
/// <reference path="../node_modules/@citizenfx/client/index.d.ts" />

class Scaleform {
  constructor(scaleform) {
    this.scaleform = scaleform;
    this.handle = RequestScaleformMovie(scaleform);
  }

  draw2D() {
    DrawScaleformMovieFullscreen(this.handle);
  }

  callFunc(funcName, ...args) {
    BeginScaleformMovieMethod(this.handle, funcName);
    args.forEach((arg) => {
      switch (typeof arg) {
        case 'string':
          PushScaleformMovieFunctionParameterString(arg);
          break;
        case 'number':
          arg.includes('.') ? PushScaleformMovieFunctionParameterFloat(arg) : PushScaleformMovieFunctionParameterInt(arg);
          break;
        case 'boolean':
          PushScaleformMovieMethodParameterBool(arg);
          break;
        default:
          PushScaleformMovieFunctionParameterString(arg);
          break;
      }
    });
    PopScaleformMovieFunctionVoid();
  }
}