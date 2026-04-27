type SendMessageParams = {
  to: string
  message: string
  token: string
  phoneNumberId: string
}

export async function sendWhatsAppMessage({ to, message, token, phoneNumberId }: SendMessageParams) {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[whatsapp send] failed to send to ${to}:`, err)
    throw new Error(`WhatsApp send failed: ${err}`)
  }

  return res.json()
}
