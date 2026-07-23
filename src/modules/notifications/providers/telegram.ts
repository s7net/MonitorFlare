export class TelegramProvider {
  static async sendMessage(
    botToken: string,
    chatId: string,
    message: string,
    baseUrl?: string,
    serviceId?: string,
    serviceUrl?: string
  ): Promise<void> {
    const keyboard: any = { inline_keyboard: [] };
    if (baseUrl && serviceId) {
      keyboard.inline_keyboard.push([{ text: '📊 View Details', url: `${baseUrl}/monitoring/${serviceId}` }]);
    }
    if (baseUrl && serviceUrl) {
      keyboard.inline_keyboard.push([
        { text: '🌐 Open URL', url: serviceUrl },
        { text: '📈 Status Page', url: baseUrl },
      ]);
    }

    const payload: Record<string, any> = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    };

    if (keyboard.inline_keyboard.length > 0) {
      payload.reply_markup = keyboard;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }
  }

  static async sendDocument(
    botToken: string,
    chatId: string,
    documentContent: string,
    filename: string = 'monitorflare-backup.json',
    caption: string = '📦 MonitorFlare System Backup'
  ): Promise<void> {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);

    const file = new File([documentContent], filename, { type: 'application/json' });
    formData.append('document', file);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram sendDocument error: ${response.status} - ${errorText}`);
    }
  }
}
