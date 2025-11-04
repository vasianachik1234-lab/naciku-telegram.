export default async function handler(req, res) {
  // Дозволяємо запити з будь-яких доменів (щоб Tilda працювала)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обробляємо попередній (preflight) запит від браузера
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const data = req.body || {};

  const msg = `
📩 <b>Нове бронювання</b>
👤 <b>Ім’я:</b> ${data.name}
📞 <b>Телефон:</b> ${data.phone}
📅 <b>Заїзд:</b> ${data.checkin}
📆 <b>Виїзд:</b> ${data.checkout}
🏠 <b>Номер:</b> ${data.room}
👥 <b>Гостей:</b> ${data.guests}
💬 <b>Коментар:</b> ${data.comment || '-'}
  `;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML'
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
