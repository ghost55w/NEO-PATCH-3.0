const { Bans } = require("../DataBase/ban");
const { Sudo } = require("../DataBase/sudo");
const { jidDecode, getContentType } = require("@whiskeysockets/baileys");
const evt = require("../lib/ovlcmd");
const config = require("../set");
const prefixe = config.PREFIXE || "+";
const getJid = require("./cache_jid");

const {
    verifierJoueursMatch,
    verifierCardsMatch,
    analysePaveAvecGemini,
    envoyerResultatPaveGemini,
    duelsEnCours,
    matchAttente,
    lancerTimerTour
} = require("../cmd/AllstarsEngine");

/* IMPORT SYSTEME MATCH BLUELOCK */
const {
    verifierFiche,
    messageMatch
} = require("../cmd/Bluelockmatch");

//==============================================================
// 🌀🧠 NEOAI
//==============================================================

const {
    traiterMessageNeoAI,
    fermerSessionNeoAI
} = require("../cmd/outils");

//==============================================================
// 📝 EXTRAIRE LE TEXTE
//==============================================================

function getTextMessage(msg) {

    return (
        msg?.conversation ||
        msg?.extendedTextMessage?.text ||
        msg?.imageMessage?.caption ||
        msg?.videoMessage?.caption ||
        msg?.documentMessage?.caption ||
        msg?.buttonsResponseMessage?.selectedButtonId ||
        msg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        ""
    );

}

//==============================================================
// 🧠 MESSAGE UPSERT
//==============================================================

async function message_upsert(m, ovl) {

    try {

        if (m.type !== "notify") {
            return;
        }

        const ms = m.messages?.[0];

        if (!ms?.message) {
            return;
        }

        //==========================================================
        // 🔐 DÉCODER JID
        //==========================================================

        const decodeJid = (jid) => {

            if (!jid) {
                return jid;
            }

            if (/:\d+@/gi.test(jid)) {

                const d = jidDecode(jid) || {};

                return (
                    d.user &&
                    d.server &&
                    `${d.user}@${d.server}`
                ) || jid;
            }

            return jid;
        };

        //==========================================================
        // 📦 TYPE MESSAGE
        //==========================================================

        const mtype =
            getContentType(ms.message);

        //==========================================================
        // 📝 TEXTE UNIQUE
        //==========================================================

        let texte =
            getTextMessage(ms.message) || "";

        //==========================================================
        // 🔥 FALLBACK SI TEXTE VIDE
        //==========================================================

        if (!texte) {

            try {

                texte =
                    JSON.stringify(ms.message);

            } catch (e) {

                texte = "";

            }

        }

        //==========================================================
        // 🧹 NETTOYAGE
        //==========================================================

        const clean =
            texte
                .toLowerCase()
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, " ")
                .trim();

        //==========================================================
        // 🏠 CHAT
        //==========================================================

        const ms_org =
            ms.key.remoteJid;

        //==========================================================
        // 🤖 JID BOT
        //==========================================================

        const id_Bot =
            decodeJid(ovl.user.id);

        const id_Bot_N =
            id_Bot.split("@")[0];

        //==========================================================
        // 👥 GROUPE
        //==========================================================

        const verif_Groupe =
            ms_org.endsWith("@g.us");

        const infos_Groupe =
            verif_Groupe
                ? await ovl.groupMetadata(ms_org)
                : {};

        const nom_Groupe =
            infos_Groupe.subject || "";

        const mbre_membre =
            verif_Groupe
                ? infos_Groupe.participants
                : [];

        const groupe_Admin =
            mbre_membre
                .filter(p => p.admin)
                .map(p => p.jid);

        const verif_Ovl_Admin =
            verif_Groupe &&
            groupe_Admin.includes(id_Bot);

        //==========================================================
        // 💬 MESSAGE CITÉ
        //==========================================================

        const msg_Repondu =
            ms.message?.[mtype]
                ?.contextInfo
                ?.quotedMessage;

        const auteur_Msg_Repondu =
            await getJid(
                decodeJid(
                    ms.message
                        ?.extendedTextMessage
                        ?.contextInfo
                        ?.participant
                ),
                ms_org,
                ovl
            );

        //==========================================================
        // 👤 MENTIONS
        //==========================================================

        const mentionnes =
            ms.message?.[mtype]
                ?.contextInfo
                ?.mentionedJid || [];

        const mention_JID =
            await Promise.all(
                mentionnes.map(
                    lid =>
                        getJid(
                            lid,
                            ms_org,
                            ovl
                        )
                )
            );

        //==========================================================
        // 👤 AUTEUR RÉEL DU MESSAGE
        //==========================================================

        let auteur_Message;

        if (ms.key.fromMe) {

            // 🤖 Message envoyé par le bot
            auteur_Message = id_Bot;

        } else if (verif_Groupe) {

            // 👤 Message d'un membre du groupe
            auteur_Message =
                await getJid(
                    decodeJid(ms.key.participant),
                    ms_org,
                    ovl
                );

        } else {

            // 👤 Message privé
            auteur_Message =
                decodeJid(ms.key.remoteJid);

        }

        //==========================================================
        // 🛡️ FALLBACK AUTEUR
        //==========================================================

        if (!auteur_Message) {

            auteur_Message =
                decodeJid(
                    ms.key.participant ||
                    ms.key.remoteJid
                );

        }

        const nom_Auteur_Message =
            ms.pushName;

        //==========================================================
        // 📌 ARGUMENTS
        //==========================================================

        let arg =
            texte
                .trim()
                .split(/ +/)
                .slice(1);

        for (let i = 0; i < arg.length; i++) {

            if (arg[i].startsWith("@")) {

                const rawId =
                    arg[i].replace(/^@/, "");

                arg[i] =
                    await getJid(
                        rawId + "@lid",
                        ms_org,
                        ovl
                    );

            }

        }

        //==========================================================
        // ⚙️ COMMANDE
        //==========================================================

        const isCmd =
            texte.startsWith(prefixe);

        const cmdName =
            isCmd
                ? texte
                    .slice(prefixe.length)
                    .trim()
                    .split(/ +/)[0]
                    .toLowerCase()
                : "";

        //==========================================================
        // 👑 DEVELOPPEURS
        //==========================================================

        const Ainz =
            "22651463203";

        const Ainzbot =
            "22605463559";

        const devNumbers = [
            Ainz,
            Ainzbot
        ];

        //==========================================================
        // 💎 SUDO
        //==========================================================

        async function getSudoUsers() {

            try {

                const sudos =
                    await Sudo.findAll({
                        attributes: ["id"]
                    });

                return sudos.map(
                    e =>
                        e.id.replace(
                            /[^0-9]/g,
                            ""
                        )
                );

            } catch (err) {

                console.error(
                    "Erreur récupération sudo:",
                    err
                );

                return [];

            }

        }

        function toJID(entry) {

            if (
                typeof entry !== "string"
            ) {
                return "";
            }

            return entry.endsWith(
                "@s.whatsapp.net"
            )
                ? entry
                : `${entry.replace(
                    /[^0-9]/g,
                    ""
                )}@s.whatsapp.net`;

        }

        const sudoUsers =
            await getSudoUsers();

        const premiumUsers = [
            Ainz,
            Ainzbot,
            id_Bot_N,
            config.NUMERO_OWNER,
            ...sudoUsers
        ].map(toJID);

        const prenium_id =
            premiumUsers.includes(
                auteur_Message
            );

        const dev_num =
            devNumbers.map(
                n =>
                    `${n}@s.whatsapp.net`
            );

        const dev_id =
            dev_num.includes(
                auteur_Message
            );

        const verif_Admin =
            verif_Groupe &&
            (
                groupe_Admin.includes(
                    auteur_Message
                ) ||
                prenium_id
            );

        //==========================================================
        // 🪪 BADGE
        //==========================================================

        const ms_badge = {

            key: {
                fromMe: false,
                participant:
                    "0@s.whatsapp.net",
                remoteJid:
                    "0@s.whatsapp.net"
            },

            message: {
                extendedTextMessage: {
                    text:
                        "ɴᴇᴏ-ʙᴏᴛ-ᴍᴅ ʙʏ ᴀɪɴᴢ",

                    contextInfo: {
                        mentionedJid: []
                    }
                }
            }

        };

        //==========================================================
        // 💬 RÉPONDRE
        //==========================================================

        const repondre =
            (msg) =>
                ovl.sendMessage(
                    ms_org,
                    {
                        text: msg
                    },
                    {
                        quoted: ms
                    }
                );

        //==========================================================
        // 📦 OPTIONS COMMANDES
        //==========================================================

        const cmd_options = {

            verif_Groupe,

            mbre_membre,

            membre_Groupe:
                auteur_Message,

            verif_Admin,

            infos_Groupe,

            nom_Groupe,

            auteur_Message,

            nom_Auteur_Message,

            id_Bot,

            prenium_id,

            dev_id,

            dev_num,

            id_Bot_N,

            verif_Ovl_Admin,

            prefixe,

            arg,

            repondre,

            groupe_Admin:
                () => groupe_Admin,

            msg_Repondu,

            auteur_Msg_Repondu,

            ms,

            ms_org,

            texte,

            getJid,

            mention_JID

        };

        //==========================================================
        // 🌀🧠 NEOAI — MESSAGE
        //==========================================================

        try {

            const neoAIHandled =
                await traiterMessageNeoAI(
                    ms,
                    ms_org,
                    ovl,
                    auteur_Message
                );

            if (neoAIHandled) {

                return;

            }

        } catch (err) {

            console.error(
                "❌ [NeoAI] Erreur traitement message :",
                err
            );

        }

        //==========================================================
        // 🔥 SYSTEME MATCH GLOBAL
        //==========================================================

        try {

            //======================================================
            // 🌀 INSCRIPTION JOUEURS
            //======================================================

            await verifierJoueursMatch(
                texte,
                ms_org,
                ovl
            );

            //======================================================
            // 🎴 CHOIX PERSONNAGES
            //======================================================

            await verifierCardsMatch(
                texte,
                ms_org,
                ovl,
                auteur_Message
            );

            //======================================================
            // 🥊 ANALYSE PAVÉ ALL STARS
            //======================================================

            const matchId =
                matchAttente[ms_org];

            if (matchId) {

                const match =
                    duelsEnCours[matchId];

                if (
                    match &&
                    match.etat === "in_match"
                ) {

                    //================================================
                    // 👤 VÉRIFIER JOUEUR
                    //================================================

                    const joueur =
                        match.joueurs?.find(
                            j =>
                                j.jid ===
                                auteur_Message
                        );

                    if (joueur) {

                        //================================================
                        // 🌀 DÉTECTION PAVÉ
                        //================================================

                        const estPaveJeu =
                            texte.includes(
                                "🌀🎮:"
                            ) ||
                            texte.includes(
                                "🌀🎮 :"
                            );

                        //================================================
                        // 🤖 ANALYSE
                        //================================================

                        if (estPaveJeu) {

                            console.log(
                                "🌀 PAVÉ DÉTECTÉ"
                            );

                            console.log(
                                "👤 Auteur :",
                                auteur_Message
                            );

                            const resultatGemini =
                                await analysePaveAvecGemini(
                                    texte,
                                    {
                                        user:
                                            auteur_Message,

                                        joueur:
                                            joueur,

                                        match:
                                            match
                                    }
                                );

                            if (
                                !resultatGemini
                                    ?.paveDetecte
                            ) {

                                console.log(
                                    "❌ Gemini : aucun pavé détecté"
                                );

                            } else {

                                console.log(
                                    "🤖 GEMINI — PAVÉ DÉTECTÉ"
                                );

                                console.log(
                                    "🌀 Actions :",
                                    resultatGemini.nombreActions
                                );

                                console.log(
                                    "📊 Note :",
                                    resultatGemini.note
                                );

                                console.log(
                                    "⚖️ Verdict :",
                                    resultatGemini.verdict
                                );

                                console.log(
                                    "➡️ Joueur suivant :",
                                    resultatGemini.joueurSuivant
                                );

                                await envoyerResultatPaveGemini(
                                    ovl,
                                    ms_org,
                                    resultatGemini,
                                    match
                                );

                                lancerTimerTour(
                                    match,
                                    ms_org,
                                    ovl
                                );

                            }

                        }

                    }

                }

            }

            //======================================================
            // 📄 BLUELOCK — FICHE
            //======================================================

            await verifierFiche(
                texte,
                ms_org,
                ovl
            );

            //======================================================
            // ⚽ BLUELOCK — MATCH
            //======================================================

            await messageMatch(
                ms,
                ovl
            );

        } catch (err) {

            console.log(
                "❌ Erreur système match :",
                err
            );

        }

        //==========================================================
        // 🚫 BAN
        //==========================================================

        async function isBanned(
            type,
            id
        ) {

            const ban =
                await Bans.findOne({
                    where: {
                        id,
                        type
                    }
                });

            return !!ban;

        }

        //==========================================================
        // ⚙️ COMMANDES
        //==========================================================

        if (isCmd) {

            const cd =
                evt.cmd?.find(
                    c =>
                        c.nom_cmd === cmdName ||
                        c.alias?.includes(
                            cmdName
                        )
                );

            if (cd) {

                try {

                    if (
                        config.MODE !== "public" &&
                        !prenium_id
                    ) {
                        return;
                    }

                    if (
                        (
                            !dev_id &&
                            auteur_Message !==
                            "221772430620@s.whatsapp.net"
                        ) &&
                        ms_org ===
                        "120363314687943170@g.us"
                    ) {
                        return;
                    }

                    if (
                        !prenium_id &&
                        await isBanned(
                            "user",
                            auteur_Message
                        )
                    ) {
                        return;
                    }

                    if (
                        !prenium_id &&
                        verif_Groupe &&
                        await isBanned(
                            "group",
                            ms_org
                        )
                    ) {
                        return;
                    }

                    await ovl.sendMessage(
                        ms_org,
                        {
                            react: {
                                text:
                                    cd.react ||
                                    "🎐",

                                key:
                                    ms.key
                            }
                        }
                    );

                    await cd.fonction(
                        ms_org,
                        ovl,
                        cmd_options
                    );

                } catch (e) {

                    console.error(
                        "Erreur:",
                        e
                    );

                    await ovl.sendMessage(
                        ms_org,
                        {
                            text:
                                "Erreur: " +
                                e
                        },
                        {
                            quoted: ms
                        }
                    );

                }

            }

        }

        //==========================================================
        // 🔧 FONCTIONS
        //==========================================================

        for (
            const command of evt.func || []
        ) {

            try {

                await command.fonction(
                    ms_org,
                    ovl,
                    cmd_options
                );

            } catch (err) {

                console.error(
                    `Erreur dans la fonction isfunc '${command.nom_cmd}':`,
                    err
                );

            }

        }

    } catch (e) {

        console.error(
            "❌ Erreur(message.upsert):",
            e
        );

    }

}

module.exports = message_upsert;
