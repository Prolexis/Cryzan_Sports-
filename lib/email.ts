export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Cryzan Sport <ventas@cryzansport.com>',
          to,
          subject,
          html,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Error enviando email vía Resend:', err);
    }
  }

  // Fallback simulado para entorno de desarrollo
  console.log(`✉️ [MOCK EMAIL SENT] Para: ${to} | Asunto: ${subject}`);
  return { success: true, mock: true };
}

export function generateOrderEmailTemplate(orderId: string, total: number) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 12px; padding: 30px; border: 1px solid #333;">
        <h1 style="color: #d32f2f; margin-bottom: 10px;">🏆 Cryzan Sport Perú</h1>
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu orden <strong>#${orderId.slice(0, 8)}</strong> ha sido recibida correctamente y está siendo procesada.</p>
        <div style="background-color: #121212; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px;">Total Pagado: <strong style="color: #d32f2f;">S/. ${total.toFixed(2)}</strong></p>
        </div>
        <p>Puedes consultar el estado de tu pedido y descargar tu boleta de venta en tu portal de cliente en <a href="http://localhost:3000/mi-cuenta/pedidos" style="color: #d32f2f;">Cryzan Sport</a>.</p>
      </div>
    </div>
  `;
}
