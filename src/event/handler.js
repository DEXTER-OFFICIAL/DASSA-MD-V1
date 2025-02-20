import { serialize, decodeJid } from '../../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../../config.cjs';
import { smsg } from '../../lib/myfunc.cjs';
import { handleAntilink } from './antilink.js';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get group admins
export const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") {
            admins.push(i.id);
        }
    }
    return admins || [];
};

// Google OAuth Credentials
const googleConfig = {
    client_id: "1047911532168-5oe814scs32gaif00bkfu4ak9fc9mjn7.apps.googleusercontent.com",
    client_secret: "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",
    redirect_uri: "http://localhost",
    access_token: "ya29.a0AXeO80Skon8QmiReCiD5QspmoqUuYg0j5dj9Zd4E1fPelwLWpcmxqYLYI2WYTefgB8R7t8VCN2MinA4Ix7VVh2DdkTDaufSvjlMMdMjojIlHaEq8jq5GZPT8am3TB5g6ToxlnLk5ZgaReMH471oKodYrroW6W9vLoSxzvhWVaCgYKAXQSARMSFQHGX2MifGbMlX99rGeyQpYLfOyXug0175",
    refresh_token: "1//045rAzXtG6IGsCgYIARAAGAQSNwF-L9IrKa08kGfOdy6ixbqMD1Y40_6pnqDaNHY1O6gae01Q27DnOm2QqbM6i6uM1MJIa3a3XYo"
};

// Function to save contact in Google Contacts
async function saveToGoogleContacts(name, phoneNumber) {
    const { client_id, client_secret, access_token, refresh_token } = googleConfig;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost");

    oauth2Client.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token
    });

    const service = google.people({ version: 'v1', auth: oauth2Client });

    const resource = {
        names: [{ givenName: name }],
        phoneNumbers: [{ value: phoneNumber }]
    };

    try {
        await service.people.createContact({ requestBody: resource });
        console.log(`✅ Saved ${name} (${phoneNumber}) to Google Contacts.`);
    } catch (error) {
        console.error('❌ Error saving contact:', error);
    }
}

// Main Handler
const Handler = async (chatUpdate, sock, logger) => {
    try {
        if (chatUpdate.type !== 'notify') return;

        const m = serialize(JSON.parse(JSON.stringify(chatUpdate.messages[0])), sock, logger);
        if (!m.message) return;

        const participants = m.isGroup ? await sock.groupMetadata(m.from).then(metadata => metadata.participants) : [];
        const groupAdmins = m.isGroup ? getGroupAdmins(participants) : [];
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botId) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        const PREFIX = /^[\\/!#.]/;
        const isCOMMAND = (body) => PREFIX.test(body);
        const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
        const prefix = prefixMatch ? prefixMatch[0] : '/';
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const text = m.body.slice(prefix.length + cmd.length).trim();
        const botNumber = await sock.decodeJid(sock.user.id);
        const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
        let isCreator = false;

        if (m.isGroup) {
            isCreator = m.sender === ownerNumber || m.sender === botNumber;
        } else {
            isCreator = m.sender === ownerNumber || m.sender === botNumber;
        }

        if (!sock.public) {
            if (!isCreator) {
                return;
            }
        }

        await handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator);

        const { isGroup, sender, body } = m;

        // Auto-Save to Google Contacts when "hello" is sent
        if (body.toLowerCase() === "hello") {
            const senderNumber = sender.split('@')[0];
            await saveToGoogleContacts("WhatsApp Contact", senderNumber);
        }

        const pluginDir = path.join(__dirname, '..', 'plugin');
        const pluginFiles = await fs.readdir(pluginDir);

        for (const file of pluginFiles) {
            if (file.endsWith('.js')) {
                const pluginPath = path.join(pluginDir, file);
                try {
                    const pluginModule = await import(`file://${pluginPath}`);
                    const loadPlugins = pluginModule.default;
                    await loadPlugins(m, sock);
                } catch (err) {
                    console.error(`Failed to load plugin: ${pluginPath}`, err);
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export default Handler;
