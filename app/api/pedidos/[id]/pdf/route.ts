import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Boleta de Venta - ${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #d32f2f; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .title { color: #d32f2f; font-size: 24px; font-weight: bold; }
          .info { margin-bottom: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
          th { background-color: #f8f9fa; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #d32f2f; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">CRY ZAN SPORT PERÚ</div>
            <p>RUC: 20601234567 | Trujillo, La Libertad - Perú</p>
          </div>
          <div>
            <h3>BOLETA DE VENTA ELECTRÓNICA</h3>
            <p><strong>B001-${order.id.slice(0, 6).toUpperCase()}</strong></p>
          </div>
        </div>

        <div class="info">
          <p><strong>Cliente:</strong> ${order.user?.name || 'Cliente'} (${order.user?.email || 'N/A'})</p>
          <p><strong>Documento (${order.documentType || 'DNI'}):</strong> ${order.documentNumber || '47586932'}</p>
          <p><strong>Fecha de Emisión:</strong> ${new Date(order.createdAt).toLocaleDateString('es-PE')}</p>
          <p><strong>Forma de Pago:</strong> ${order.paymentMethod}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Descripción</th>
              <th>P. Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.product.name}</td>
                <td>S/. ${item.price.toFixed(2)}</td>
                <td>S/. ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Monto Total: S/. ${order.total.toFixed(2)} SOL</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando boleta:', error);
    return NextResponse.json({ error: 'Error al generar la boleta' }, { status: 500 });
  }
}
