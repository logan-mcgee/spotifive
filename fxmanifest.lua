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
  'shared/data.js',
  'client/scaleform.js',
  'client/uifeatures.js',
  'client/main.js'
}

server_scripts {
  'shared/data.js',
  'server/auth.js'
}
