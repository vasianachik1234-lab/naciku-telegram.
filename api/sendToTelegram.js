// /api/sendToTelegram.js
export default async function handler(req, res) {
  // CORS (preflight + basic)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const botToken = process.env.BOT_TOKEN; // токен вашого бота
    const chatId   = process.env.CHAT_ID;   // ID чату/каналу для отримання броней

    if (!botToken || !chatId) {
      return res.status(500).json({ ok: false, error: 'missing_env_vars' });
    }

    // Дані від віджета
    const {
      name = '',
      phone = '',
      checkin = '',
      checkout = '',
      room = '',
      guests = '',
      comment = '',
      nights = 0,
      total = 0,
      breakdown = '',
      currency = 'UAH'
    } = (req.body || {});

    // Простенька валідація
    if (!name  !phone  !checkin  !checkout  !room) {
      return res.status(400).json({ ok: false, error: 'invalid_payload' });
    }

    // Форматування гривні
    const fmt = new Intl.NumberFormat('uk-UA');
    const totalStr = ${fmt.format(Number(total) || 0)} ${currency === 'UAH' ? 'грн' : currency};

    // Якщо з форми прийшов "розклад" як "3×2500 грн + 2×3500 грн" — залишаємо як є.
    const brk = breakdown && String(breakdown).trim().length ? breakdown : '—';

    const esc = (s) => String(s || '').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&'); // мін. екранування

    const text =
`🆕 *Нове бронювання*

👤 *Ім’я:* ${esc(name)}
📞 *Телефон:* ${esc(phone)}

📅 *Заїзд:* ${esc(checkin)}
🏁 *Виїзд:* ${esc(checkout)}
🛏️ *Номер:* ${esc(room)}
👥 *Гостей:* ${esc(guests || '—')}
📝 *Коментар:* ${esc(comment || '—')}

🌙 *Ночей:* ${esc(nights)}
💰 *Сума:* ${esc(totalStr)}
📊 *Розклад:* ${esc(brk)}`;

    // Відправка в Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2', // завдяки esc() текст безпечний для MarkdownV2
        disable_web_page_preview: true
      })
    });

    if (!tgRes.ok) {
      const t = await tgRes.text().catch(() => '');
      throw new Error(`telegram_error: ${t || tgRes.status}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'server_error' });
  }
}
