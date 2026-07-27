import { prisma } from '../prisma';
import fs from 'fs';
import path from 'path';

export interface ReportOptions {
  hidePrices?: boolean;
}

export class ReportService {
  private static getReportsDir(): string {
    const dir = path.join(process.cwd(), 'public', 'downloads', 'reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  static getReportPath(fileName: string): string {
    return path.join(this.getReportsDir(), fileName);
  }

  static async generateInvoiceHtml(orderId: string, options: ReportOptions = {}): Promise<string> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const isGift = options.hidePrices || false;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Boleta de Venta - ${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #fff; bg-color: #0c0a09; background-color: #0c0a09; }
          .container { max-width: 800px; margin: 0 auto; background: #18181b; padding: 30px; border-radius: 16px; border: 1px solid #27272a; }
          .header { border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { color: #ef4444; font-size: 28px; font-weight: 900; tracking-wide: uppercase; }
          .info { margin-bottom: 25px; font-size: 13px; line-height: 1.6; color: #a1a1aa; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #27272a; padding: 12px; text-align: left; font-size: 13px; }
          th { background-color: #27272a; color: #fff; font-weight: bold; }
          td { color: #d4d4d8; }
          .total { font-size: 20px; font-weight: 900; text-align: right; margin-top: 25px; color: #ef4444; border-top: 1px solid #27272a; pt: 15px; }
          .badge { display: inline-block; background: #ef4444/15; border: 1px solid #ef4444/30; color: #ef4444; font-size: 10px; font-weight: bold; px: 2.5; py: 0.5; border-radius: 9999px; text-transform: uppercase; }
          .gift-notice { margin-top: 30px; padding: 15px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; text-align: center; color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="title">CRY ZAN SPORT</div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa;">RUC: 20601234567 | Trujillo, La Libertad - Perú</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #fff; font-size: 16px;">BOLETA ELECTRÓNICA</h3>
              <p style="margin: 4px 0 0 0; color: #ef4444; font-weight: bold;">B001-${order.id.slice(0, 6).toUpperCase()}</p>
            </div>
          </div>

          <div class="info">
            <p><strong>Cliente:</strong> ${order.user?.name || 'Cliente'} (${order.user?.email || 'N/A'})</p>
            <p><strong>Documento (${order.documentType || 'DNI'}):</strong> ${order.documentNumber || 'N/A'}</p>
            <p><strong>Fecha de Emisión:</strong> ${new Date(order.createdAt).toLocaleDateString('es-PE')}</p>
            <p><strong>Forma de Pago:</strong> ${order.paymentMethod}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">Cant.</th>
                <th style="width: 50%;">Descripción</th>
                <th style="width: 20%; text-align: right;">P. Unitario</th>
                <th style="width: 20%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.quantity}</td>
                  <td>${item.product.name}</td>
                  <td style="text-align: right;">${isGift ? '***' : `S/. ${item.price.toFixed(2)}`}</td>
                  <td style="text-align: right;">${isGift ? '***' : `S/. ${(item.price * item.quantity).toFixed(2)}`}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          ${
            isGift
              ? `<div class="gift-notice">🎁 ¡Esta compra es un regalo! Los detalles de precio han sido ocultados.</div>`
              : `<div class="total">
                  <p style="margin: 0;">Monto Total: S/. ${order.total.toFixed(2)} PEN</p>
                 </div>`
          }
        </div>
      </body>
      </html>
    `;
  }

  static async generateMonthlySalesReportHtml(monthStr: string): Promise<string> {
    const year = parseInt(monthStr.split('-')[0]);
    const month = parseInt(monthStr.split('-')[1]);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalShipping = orders.reduce((sum, o) => sum + o.shippingCost, 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + o.discountAmount, 0);

    // Group sales by Category for a mini CSS bar chart
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate, lt: endDate },
        },
      },
      include: { product: { include: { category: true } } },
    });

    const categorySales: Record<string, number> = {};
    for (const item of items) {
      const catName = item.product.category.name;
      categorySales[catName] = (categorySales[catName] || 0) + item.price * item.quantity;
    }

    const maxSales = Math.max(...Object.values(categorySales), 1);
    const categoryChartHtml = Object.entries(categorySales)
      .map(([cat, amount]) => {
        const percentage = Math.round((amount / maxSales) * 100);
        return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #a1a1aa;">
            <span>${cat}</span>
            <span style="font-weight: bold; color: #fff;">S/. ${amount.toFixed(2)}</span>
          </div>
          <div style="background: #27272a; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: #ef4444; width: ${percentage}%; height: 100%; border-radius: 4px;"></div>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Ventas Mensual - ${monthStr}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #fff; background-color: #0c0a09; }
          .container { max-width: 900px; margin: 0 auto; background: #18181b; padding: 30px; border-radius: 16px; border: 1px solid #27272a; }
          .header { border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; }
          .title { color: #ef4444; font-size: 26px; font-weight: bold; }
          .grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .card { background: #27272a; padding: 20px; border-radius: 12px; border: 1px solid #3f3f46; text-align: center; }
          .card-value { font-size: 22px; font-weight: bold; color: #ef4444; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          th, td { border: 1px solid #27272a; padding: 12px; text-align: left; font-size: 12px; }
          th { background-color: #27272a; color: #fff; }
          td { color: #d4d4d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="title">REPORTE MENSUAL DE VENTAS</span>
            <p style="margin: 5px 0 0 0; color: #a1a1aa;">Periodo: <strong>${monthStr}</strong> | Cryzan Sport Trujillo</p>
          </div>

          <div class="grid">
            <div class="card">
              <div style="font-size: 12px; color: #a1a1aa;">Total Pedidos</div>
              <div class="card-value">${orders.length}</div>
            </div>
            <div class="card">
              <div style="font-size: 12px; color: #a1a1aa;">Facturación Bruta</div>
              <div class="card-value">S/. ${totalSales.toFixed(2)}</div>
            </div>
            <div class="card">
              <div style="font-size: 12px; color: #a1a1aa;">Descuentos Otorgados</div>
              <div class="card-value" style="color: #10b981;">S/. ${totalDiscounts.toFixed(2)}</div>
            </div>
          </div>

          <div style="background: #1e1b4b/20; border: 1px solid #2e2a87/40; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #fff; font-size: 14px; text-transform: uppercase;">Distribución de Ventas por Categoría</h3>
            ${categoryChartHtml || '<p style="color: #a1a1aa; font-size: 12px; margin: 0;">Sin datos este mes</p>'}
          </div>

          <h3 style="color: #fff; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Detalle de Transacciones</h3>
          <table>
            <thead>
              <tr>
                <th>Código Orden</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders
                .map(
                  (o) => `
                <tr>
                  <td><code>${o.id.slice(0, 8).toUpperCase()}</code></td>
                  <td>${o.user?.name || 'Cliente Invitado'}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString('es-PE')}</td>
                  <td>${o.paymentMethod}</td>
                  <td style="text-align: right; font-weight: bold; color: #fff;">S/. ${o.total.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  static async generateInventoryRefundReportHtml(): Promise<string> {
    const criticalVariants = await prisma.productVariant.findMany({
      where: { stock: { lt: 5 } },
      include: { product: true },
      take: 15,
    });

    const pendingRefunds = await prisma.refundRequest.findMany({
      include: { user: true, order: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Inventario Crítico y Devoluciones</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #fff; background-color: #0c0a09; }
          .container { max-width: 950px; margin: 0 auto; background: #18181b; padding: 30px; border-radius: 16px; border: 1px solid #27272a; }
          .header { border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; }
          .title { color: #ef4444; font-size: 26px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
          th, td { border: 1px solid #27272a; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #27272a; color: #fff; }
          td { color: #d4d4d8; }
          .badge-red { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-orange { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-green { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="title">REPORTE ADMINISTRATIVO DE INVENTARIO Y DEVOLUCIONES</span>
            <p style="margin: 5px 0 0 0; color: #a1a1aa;">Fecha de Emisión: <strong>${new Date().toLocaleDateString('es-PE')}</strong></p>
          </div>

          <h3 style="color: #fff; text-transform: uppercase; border-left: 4px solid #ef4444; padding-left: 8px;">Alertas de Stock Crítico (Menos de 5 unidades)</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Stock Actual</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${criticalVariants
                .map(
                  (v) => `
                <tr>
                  <td><strong>${v.product.name}</strong></td>
                  <td>${v.size}</td>
                  <td>${v.color || 'N/A'}</td>
                  <td style="font-weight: bold; color: #f59e0b;">${v.stock} unidades</td>
                  <td><span class="${v.stock === 0 ? 'badge-red' : 'badge-orange'}">${v.stock === 0 ? 'AGOTADO' : 'STOCK CRÍTICO'}</span></td>
                </tr>
              `
                )
                .join('')}
              ${criticalVariants.length === 0 ? '<tr><td colspan="5" style="text-align: center;">No hay alertas críticas en el inventario actual</td></tr>' : ''}
            </tbody>
          </table>

          <h3 style="color: #fff; text-transform: uppercase; border-left: 4px solid #ef4444; padding-left: 8px;">Solicitudes de Devolución</h3>
          <table>
            <thead>
              <tr>
                <th>Código Solicitud</th>
                <th>Orden Relacionada</th>
                <th>Cliente</th>
                <th>Motivo de Devolución</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${pendingRefunds
                .map(
                  (r) => `
                <tr>
                  <td><code>${r.id.slice(0, 8).toUpperCase()}</code></td>
                  <td><code>${r.order.id.slice(0, 8).toUpperCase()}</code></td>
                  <td>${r.user.name}</td>
                  <td>${r.reason}</td>
                  <td>
                    <span class="${
                      r.status === 'PENDING' ? 'badge-orange' : r.status === 'APPROVED' ? 'badge-green' : 'badge-red'
                    }">
                      ${r.status}
                    </span>
                  </td>
                </tr>
              `
                )
                .join('')}
              ${pendingRefunds.length === 0 ? '<tr><td colspan="5" style="text-align: center;">No se han registrado solicitudes de devolución</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  static async generateClaimReceiptHtml(claimId: string): Promise<string> {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Constancia de Reclamación - ${claim.claimNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; border-radius: 8px; }
          .header { border-bottom: 2px solid #d32f2f; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { color: #d32f2f; font-size: 24px; font-weight: bold; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; background: #f5f5f5; padding: 6px 12px; margin-top: 20px; margin-bottom: 10px; border-left: 3px solid #d32f2f; }
          p { margin: 8px 0; font-size: 13px; line-height: 1.5; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="title">CRY ZAN SPORT</div>
              <p style="margin: 2px 0 0 0; font-size: 11px;">Trujillo, La Libertad | Libro de Reclamaciones Digital</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; font-size: 14px;">HOJA DE RECLAMACIÓN</h3>
              <p style="margin: 2px 0 0 0; color: #d32f2f; font-weight: bold; font-size: 15px;">${claim.claimNumber}</p>
            </div>
          </div>

          <p style="font-size: 11px; color: #555; font-style: italic;">Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) de Perú.</p>

          <div class="section-title">1. Identificación del Consumidor Reclamante</div>
          <p><strong>Nombre Completo:</strong> ${claim.fullName}</p>
          <p><strong>Documento (${claim.documentType}):</strong> ${claim.documentNumber}</p>
          <p><strong>Teléfono:</strong> ${claim.phone}</p>
          <p><strong>Email:</strong> ${claim.email}</p>

          <div class="section-title">2. Detalle de la Reclamación</div>
          <p><strong>Tipo:</strong> ${claim.type}</p>
          <p><strong>Fecha de Registro:</strong> ${new Date(claim.createdAt).toLocaleString('es-PE')}</p>
          <p><strong>Descripción del Hecho:</strong></p>
          <p style="background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 4px; font-family: monospace;">${claim.description}</p>

          <div class="section-title">3. Detalle del Pedido del Consumidor (Pretensión)</div>
          <p style="background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 4px; font-family: monospace;">${claim.request}</p>

          <div class="footer">
            <p>Cryzan Sport responderá a este documento en un plazo no mayor a quince (15) días hábiles.</p>
            <p>Conserve esta constancia de reclamación para cualquier consulta o trámite ante INDECOPI.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
