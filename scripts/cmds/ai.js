const axios = require("axios");

const Prefixes = ["ai", "anjara", "ae", "mitantsoa", "mikmon"];

const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

const stickers = [
  "1702931226959443", "1653956285190271", "1653955455190354",
  "1653961838523049", "1653959108523322", "1653958728523360", 
  "1653957535190146", "1653962321856334", "1653972585188641",
  "1653962778522955", "1653963005189599", "1653963445189555",
  "1653974758521757", "1653974501855116", "1653972291855337", 
  "1653969815188918"
];

const RP = "";

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

function splitMessage(text, maxLength = 9000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

module.exports = {
  config: {
    name: "gptae",
    aliases: [],
    version: "1.6",
    author: "Aesther",
    countDown: 2,
    role: 0,
    shortDescription: "🤖 Pose une question à l'IA GPTAE",
    longDescription: "Obtiens une réponse stylisée de GPTAE avec design lisible et décoratif.",
    category: "ai",
    guide: "{pn} <question>",
    prefixes: Prefixes
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    const uid = event.senderID;
    const threadID = event.threadID;
    const messageID = event.messageID;

    if (!prompt) {
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      api.sendMessage({ sticker: randomSticker }, threadID);
      api.setMessageReaction("☁️", messageID, () => {}, true);
      return;
    }

    try {
      const apiUrl = `https://delirius-apiofc.vercel.app/ia/chatgpt?q=${encodeURIComponent(RP + " : " + prompt)}&user=${uid}`;
      const { data } = await axios.get(apiUrl, { timeout: 100000 });
      const response = data?.data || "🤖 Aucune réponse reçue.";

      const styled = applyFont(response.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? " 🪐" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 100 * 1000);
      }

      api.setMessageReaction("🌷", messageID, () => {}, true);

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur met trop de temps à répondre. Réessaie plus tard."
        : "❌ Une erreur est survenue lors de la connexion à l'API GPTAE.";
      message.reply(applyFont(errMsg));
    }
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const args = event.body.slice(prefix.length).trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  },

  onReply: async function ({ args, event, api, message, Reply }) {
    if (event.senderID !== Reply.author) return;

    const prompt = RP + " : " + event.body.trim();
    const uid = event.senderID;

    try {
      const apiUrl = `https://delirius-apiofc.vercel.app/ia/chatgpt?q=${encodeURIComponent(prompt)}&user=${uid}`;
      const { data } = await axios.get(apiUrl, { timeout: 150001 });
      const response = data?.data || "🤖 Aucune réponse obtenue.";

      const styled = applyFont(response.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? " 🌸" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 100 * 1000);
      }

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 100 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur est trop lent à répondre."
        : "❌ Une erreur s'est produite avec l'API GPTAE.";
      message.reply(applyFont(errMsg));
    }
  }
};
