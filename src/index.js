const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const Colyseus = require('colyseus.js');
const dotenv = require('dotenv');
dotenv.config();

const { TOKEN } = process.env;
let room;
let client;

const generateSessionToken = (token) =>
  fetch('https://pixels-server.pixels.xyz/v1/auth/initialize', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'sec-ch-ua':
        '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      Referer: 'https://play.pixels.xyz/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: `{"authToken":"${token}","mapId":"","tenant":"pixels","walletProvider":"otpc","ver":5.5}`,
    method: 'POST',
  }).then(async (res) => {
    if (res.status === 200) {
      return await res.json();
    }
  });

(async () => {
  client = new Colyseus.Client('wss://pixels-server.pixels.xyz');
  const { sessionToken, player } = await generateSessionToken(TOKEN);
  const { mapId, world, username, lastSavedAt } = player;

  room = await client.join('worldful', {
    mapId,
    world,
    username,
    lastSavedAt,
    isGuest: false,
    cryptoWallet: {},
    ver: 5.5,
    avatar: '',
    token: sessionToken,
  });

  console.log(`connected at ${room.name}`);


  // moving player
  console.log("moving player to GRUMP (wacka mole)")
  room.send("moveSelfPlayer", {
    "velocity": { "x": 0, "y": 0 },
    "h": "1014",
    "position": { "x": 749, "y": 223 } // grump
  })

})();
