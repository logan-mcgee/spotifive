fx_version "bodacious"
games {"gta5"}

author "logan. (Illusive)"
description "Spotify authentication as a wrapper."
version "1.0.0"

dependency 'yarn'

ui_page 'spotifive.html'

files {
  'spotifive.html'
}

client_scripts {
  'shared/persistent.js',
  'shared/config.js',
  'client/fetch.js',
  'client/main.js',
  'components/scaleform.js',
  'components/uifeatures.js',
  'components/controls.js',
}

server_scripts {
  'shared/persistent.js',
  'server/updateCheck.js',
  'server/auth.js'
}
