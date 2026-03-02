const fs = require('fs');
const path = require('path');
const pino = require("pino");
const axios = require('axios');
const express = require('express');

const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const { get_session, restaureAuth } = require('./DataBase/session');
const config = require('./set');
const {
  message_upsert,
  group_participants_update,
  connection_update,
  dl_save_media_ms,
  recup_msg
} = require('./Ovl_events');

let ovl;

async function initBot() {
  try {
    const instanceId = "principale";
    const sessionData = await get_session(config.SESSION_ID);
    await restaureAuth(instanceId, sessionData.creds, sessionData.keys);
    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${instanceId}`);
    const { version } = await fetchLatestBaileysVersion();

    ovl = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false
    });

    ovl.ev.on("messages.upsert", async (m) => message_upsert(m, ovl));
    ovl.ev.on("group-participants.update", async (data) => group_participants_update(data, ovl));
    ovl.ev.on("connection.update", (update) => connection_update(update, ovl, initBot));
    ovl.ev.on("creds.update", saveCreds);

    ovl.dl_save_media_ms = (msg, filename = '', attachExt = true, dir = './downloads') =>
      dl_save_media_ms(ovl, msg, filename, attachExt, dir);

    ovl.recup_msg = (params = {}) => recup_msg({ ovl, ...params });

    console.log("Session principale prête");

  } catch (err) {
    console.error("Erreur au lancement :", err.message || err);
    setTimeout(initBot, 5000);
  }
}

initBot();

const app = express();
const port = process.env.PORT || 3000;
let dernierPingRecu = Date.now();

app.get('/', (req, res) => {
  dernierPingRecu = Date.now();
  res.send(`<h1>NEO-BOT en ligne</h1>`);
});

app.listen(port, () => {
  console.log("Listening on port: " + port);
  let publicURL;
if (process.env.RENDER_EXTERNAL_URL) {
  publicURL = process.env.RENDER_EXTERNAL_URL;
} else if (process.env.KOYEB_PUBLIC_DOMAIN) {
  publicURL = `https://${process.env.KOYEB_PUBLIC_DOMAIN}`;
} else {
  publicURL = `http://localhost:${port}`;
}

setupAutoPing(publicURL);
});

function setupAutoPing(url) {
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log(`Ping: OVL-MD-V2✅`);
    } catch (err) {
      console.error('Erreur lors du ping', err.message);
    }
  }, 30000);
}

process.on('uncaughtException', (e) => {
  console.error('Une erreur inattendue est survenue :', e);
});
