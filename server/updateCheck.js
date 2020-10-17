/* eslint-disable no-undef */
if (typeof axios === 'undefined') axios = require('axios').default;

(async() => {
  try {
    const verRes = await axios('https://spotifive.services.dislike.life/version');
    if (verRes.data.version !== SPOTIFY_CONFIG.version) {
      console.log(`New version available (${verRes.data.version}). Changes:\n  ${verRes.data.changes.join('\n  ')}^7`);
    } else {
      console.log('You are running the latest version of SpotiFive. Remember to report bugs and issues!');
    }
  } catch (err) {
    console.log('Failed to get version info ' + err);
  }
})();