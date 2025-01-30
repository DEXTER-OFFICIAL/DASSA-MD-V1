const aliveCommand = async (m, gss) => {
  try {
    const prefixMatch = m.body.match(/^[/!#.]/);
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim().toLowerCase() : '';

    if (cmd === 'alive') {
      const imageUrl = 'https://whatsapp.com/channel/0029Vag1WQFJf05dF0pQeU3u/338'; // ඔබේ රූපය URL එක මෙතන සවි කරන්න
      const audioUrl = 'https://github.com/DEXTER-ID-PROJECT/DATA-JSON/raw/refs/heads/main/Audio/alive.mp3'; // Voice Note URL

      // කාලය ලබාගැනීම
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      const seconds = Math.floor(uptime % 60);

      // කැප්ෂන් නිර්මාණය
      const caption = `*🤖 DASSA-MD BOT IS ONLINE*\n_________________________________________\n\n*📆 ${days} Day*\n*🕰️ ${hours} Hour*\n*⏳ ${minutes} Minute*\n*⏲️ ${seconds} Second*\n_________________________________________\n\n*⫷⫷⫷ \`DASSA MD BEST BOT\` ⫸⫸⫸*`;

      // Image එක සහ කැප්ෂන් එක යැවීම
      await gss.sendMessage(m.from, {
        image: { url: imageUrl },
        caption: caption,
        contextInfo: {
          quotedMessage: m.message,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '',
            newsletterName: 'DASSA FORWARD',
            serverMessageId: 143,
          },
        },
      }, { quoted: m });

    }
  } catch (err) {
    console.error(err);
  }
};

export default aliveCommand;
