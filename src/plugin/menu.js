import axios from 'axios';

const menuCommand = async (m, gss, botVersion = '1.0.0') => {
  try {
    const prefixMatch = m.body.match(/^[/!#.]/);
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim().toLowerCase() : '';

    if (cmd === 'menu') {
      const imageUrl = 'https://i.ibb.co/zTXDBHXY/IMG-20250129-WA0019.jpg'; // ඔබේ රූපය URL එක
      const captionUrl = 'https://raw.githubusercontent.com/Dassa1234/DASSA-CLOUD/refs/heads/main/menu.txt'; // GitHub raw URL
     

      // පරිශීලක නම (Push Name) ලබා ගැනීම
      const pushName = m.pushName || 'User'; // Push Name නොමැතිනම් 'User' ලෙස සකසයි

      // GitHub Caption එක ලබා ගැනීම
      const response = await axios.get(captionUrl);
      let caption = response.data || 'Caption not found!';

      // Placeholders dynamic values වලට සකසනවා
      caption = caption.replace(/\$\{prefix\}/g, prefix); // ${prefix} ආදේශනය
      caption = caption.replace(/\$\{botVersion\}/g, botVersion); // ${botVersion} ආදේශනය
      caption = caption.replace(/\$\{pushName\}/g, pushName); // ${pushName} ආදේශනය

      // Image message යැවීම
      await gss.sendMessage(m.from, {
        image: { url: imageUrl },
        caption: caption,
        contextInfo: {
          quotedMessage: m.message,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '',
            newsletterName: 'DASSA MD FORWARD',
            serverMessageId: 143,
          },
        },
      }, { quoted: m });
    }
  } catch (err) {
    console.error(err);
    await m.reply('⚠️ *Try Again menu command*');
  }
};

export default menuCommand;
