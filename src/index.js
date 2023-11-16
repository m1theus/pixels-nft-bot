const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const Colyseus = require('colyseus.js');

const generateSessionToken = () =>
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
    body: '{"authToken":"wsifUtnytHwjae6DjAMcMLln541K9S-h_OinHis6z7h8","mapId":"","tenant":"pixels","walletProvider":"otpc","ver":5.47}',
    method: 'POST',
  }).then(async (res) => {
    if (res.status === 200) {
      return await res.json();
    }
  });

async function teleportTo(mapId, world, client, currentRoom) {
  setInterval(async () => {
    await currentRoom.leave(true);
    const { sessionToken, player } = await generateSessionToken();

    const { mapId, world, username, lastSavedAt } = player;
    const terravile = await client.join('worldful', {
      mapId: 'carnival',
      world: 8,
      username,
      lastSavedAt,
      isGuest: false,
      cryptoWallet: {},
      ver: 5.47,
      avatar: '',
      token: sessionToken,
    });

    console.log('terravile===>', terravile.state);
  }, 1000 * 2);
}

(async () => {
  const client = new Colyseus.Client('wss://pixels-server.pixels.xyz');
  const { sessionToken, player } = await generateSessionToken();
  const { mapId, world, username, lastSavedAt } = player;

  const roomWS = await client.join('worldful', {
    mapId,
    world,
    username,
    lastSavedAt,
    isGuest: false,
    cryptoWallet: {},
    ver: 5.47,
    avatar: '',
    token: sessionToken,
  });

  let playerState = null;

  roomWS.onMessage('*', (data) => {
    console.log('onMessage', data);
  });

  console.log('serializer', JSON.stringify(roomWS.serializer));

  roomWS.onStateChange((data) => {
    playerState = data?.players.get(roomWS.sessionId);

    console.log('my_player', JSON.stringify(playerState));

    console.log('onStateChange', data);
  });

  const hexString =
    '0dae6d6f766553656c66506c6179657283a876656c6f6369747982a17800a179d09ca168a5392d313634a8706f736974696f6e82a178cb40a925c13355f085a179cb40a7629421ff64b0';

  // Convert hex string to Uint8Array
  const byteArray = new Uint8Array(
    hexString.match(/.{2}/g).map((byte) => parseInt(byte, 16))
  );

  for (let i = 0; i < 5; i++) {
    console.log('moving...');
    roomWS.send('moveSelfPlayer', byteArray);
  }
})();
