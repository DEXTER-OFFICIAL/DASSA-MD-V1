import fetch from 'node-fetch';

const downloadSong = async (m, gss) => {
    const prefix = "!";
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'song' && text) {
        try {
            const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.success) {
                const { title, thumbnail, download_url } = data.result;
                
                // Send thumbnail with title as caption
                await gss.sendImage(m.from, thumbnail, title);

                // Send the audio file directly
                await gss.sendAudio(m.from, download_url, title);

                await m.React("✅");
            } else {
                throw new Error("Failed to fetch song.");
            }
        } catch (error) {
            console.error('Error downloading song:', error);
            m.reply('Error downloading song. Please check the link and try again.');
            await m.React("❌");
        }
    }
};

export default downloadSong;
