import { prisma } from '../prisma';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';

export class WordReportService {
  private static getReportsDir(): string {
    const dir = path.join(process.cwd(), 'public', 'downloads', 'reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  static async generateMonthlySalesReportDocx(monthStr: string, fileName: string): Promise<string> {
    const year = parseInt(monthStr.split('-')[0]);
    const month = parseInt(monthStr.split('-')[1]);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `REPORTE MENSUAL DE VENTAS - ${monthStr}`,
                  bold: true,
                  size: 32,
                  color: 'EF4444',
                }),
              ],
            }),
            new Paragraph({
              text: `Generado el: ${new Date().toLocaleDateString('es-PE')}`,
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total de Ventas: S/. ${totalSales.toFixed(2)} PEN`,
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              text: `Total de Pedidos Procesados: ${orders.length}`,
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Detalle de Órdenes',
                  bold: true,
                  size: 20,
                }),
              ],
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Código', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Cliente', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fecha', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })] }),
                  ],
                }),
                ...orders.map(
                  (o) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: o.id.slice(0, 8).toUpperCase() })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: o.user?.name || 'Cliente Invitado' })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: new Date(o.createdAt).toLocaleDateString('es-PE') })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `S/. ${o.total.toFixed(2)}` })] })] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(this.getReportsDir(), fileName);
    fs.writeFileSync(filePath, buffer);

    return fileName;
  }

  static async generateB2BContractDocx(clubName: string, representativeName: string, fileName: string): Promise<string> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'CONTRATO DE SUMINISTRO Y PATROCINIO DEPORTIVO B2B',
                  bold: true,
                  size: 28,
                  color: '000000',
                }),
              ],
            }),
            new Paragraph({
              text: `Entre la marca CRYZAN SPORT PERÚ y el club/organización ${clubName || '[Nombre del Club]'}, representado por ${representativeName || '[Nombre del Representante]'} en Trujillo, Perú.`,
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Cláusula Primera: Objeto del Contrato',
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: 'Cryzan Sport proveerá equipamiento y uniformes deportivos oficiales a precios preferenciales de distribución B2B según las cotizaciones adjuntas en el anexo de este contrato.',
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Cláusula Segunda: Duración',
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: 'El presente contrato tendrá una duración obligatoria de doce (12) meses, vigentes a partir de la firma de ambas partes.',
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Firma de Conformidad',
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              text: '__________________________________                __________________________________',
            }),
            new Paragraph({
              text: 'Por Cryzan Sport Perú                             Por el Club Deportivo',
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(this.getReportsDir(), fileName);
    fs.writeFileSync(filePath, buffer);

    return fileName;
  }
}
