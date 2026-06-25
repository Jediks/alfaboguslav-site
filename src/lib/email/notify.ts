type OrderEmailPayload = {
  referenceId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  total: number;
  itemCount: number;
};

type ClientOrderConfirmationPayload = {
  referenceId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  total: number;
  itemCount: number;
  locale?: "uk" | "en";
};

type QuoteEmailPayload = {
  referenceId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

const MANAGER_EMAIL = process.env.MANAGER_EMAIL ?? "alfarepik@gmail.com";

async function sendViaResend(subject: string, html: string, to?: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false as const, reason: "no_api_key" };

  const from = process.env.RESEND_FROM ?? "Alpha Boguslav <onboarding@resend.dev>";
  const recipients = to && to.length > 0 ? to : [MANAGER_EMAIL];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] Resend error:", text);
    return { sent: false as const, reason: "api_error" };
  }

  return { sent: true as const };
}

export async function notifyNewOrder(payload: OrderEmailPayload) {
  const subject = `[Alpha Boguslav] Нове замовлення ${payload.referenceId}`;
  const html = `
    <h2>Нове B2B замовлення</h2>
    <p><strong>ID:</strong> ${payload.referenceId}</p>
    <p><strong>Компанія:</strong> ${payload.companyName}</p>
    <p><strong>Контакт:</strong> ${payload.contactName}</p>
    <p><strong>Email:</strong> ${payload.contactEmail}</p>
    <p><strong>Телефон:</strong> ${payload.contactPhone}</p>
    <p><strong>Сума:</strong> ${payload.total} ₴</p>
    <p><strong>Позицій:</strong> ${payload.itemCount}</p>
  `;
  return sendViaResend(subject, html);
}

export async function notifyClientOrderConfirmation(
  payload: ClientOrderConfirmationPayload
) {
  if (!payload.contactEmail) {
    return { sent: false as const, reason: "no_recipient" };
  }
  const isUk = payload.locale !== "en";
  const subject = isUk
    ? `Дякуємо за замовлення ${payload.referenceId} — Alpha Boguslav`
    : `Thank you for your order ${payload.referenceId} — Alpha Boguslav`;
  const html = isUk
    ? `
      <h2>Дякуємо за замовлення!</h2>
      <p>Вітаємо, ${payload.contactName}!</p>
      <p>Ми отримали ваше замовлення <strong>${payload.referenceId}</strong>${
        payload.companyName ? ` від компанії <strong>${payload.companyName}</strong>` : ""
      }.</p>
      <p>Орієнтовна сума: <strong>${payload.total} ₴</strong> за ${payload.itemCount} позицій.</p>
      <p>Менеджер зв'яжеться з вами найближчим часом для підтвердження деталей та фінальної ціни.</p>
      <p>— Команда Alpha Boguslav</p>
    `
    : `
      <h2>Thank you for your order!</h2>
      <p>Hello ${payload.contactName},</p>
      <p>We received your order <strong>${payload.referenceId}</strong>${
        payload.companyName ? ` from <strong>${payload.companyName}</strong>` : ""
      }.</p>
      <p>Estimated total: <strong>${payload.total} UAH</strong> for ${payload.itemCount} item(s).</p>
      <p>Our manager will contact you shortly to confirm details and the final price.</p>
      <p>— Alpha Boguslav team</p>
    `;
  return sendViaResend(subject, html, [payload.contactEmail]);
}

export async function notifyNewQuote(payload: QuoteEmailPayload) {
  const subject = `[Alpha Boguslav] Запит на прорахунок ${payload.referenceId}`;
  const html = `
    <h2>Новий запит на прорахунок</h2>
    <p><strong>ID:</strong> ${payload.referenceId}</p>
    <p><strong>Компанія:</strong> ${payload.companyName}</p>
    <p><strong>Контакт:</strong> ${payload.contactName}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Телефон:</strong> ${payload.phone}</p>
    <p><strong>Повідомлення:</strong> ${payload.message || "—"}</p>
  `;
  return sendViaResend(subject, html);
}
