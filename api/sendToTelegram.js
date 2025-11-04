export default async function handler(req, res) {
  // --- Дозволяємо запити з будь-яких сайтів (для Tilda, Vercel тощо)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Відповідь на preflight-запит (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- Тільки POST-запити
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      name,
      phone,
      checkin,
      checkout,
      room,
      guests,
      comment,
      nights,
      total,
      breakdown,
      currency
    } = req.body;

    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    // --- Формуємо повідомлення
    const text = `
🏨 <b>Нове бронювання NACIKU</b>

👤 <b>Ім’я:</b> ${name}
📞 <b>Телефон:</b> ${phone}
📅 <b>Заїзд:</b> ${checkin}
📆 <b>Виїзд:</b> ${checkout}
🏠 <b>Номер:</b> ${room}
👥 <b>Гостей:</b> ${guests}
💬 <b>Коментар:</b> ${comment || '—'}

🌙 <b>Ночей:</b> ${nights}
💰 <b>Сума:</b> ${total} ${currency}
🧾 <b>Розрахунок:</b> ${breakdown}
`;

    // --- Відправка в Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(500).json({ ok: false, error: result.description });
    }

  } catch (error) {
    console.error('Telegram send error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
