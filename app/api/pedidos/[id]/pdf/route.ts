import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/reports/ReportService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const htmlContent = await ReportService.generateInvoiceHtml(params.id);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error generando boleta:', error);
    return NextResponse.json({ error: error.message || 'Error al generar la boleta' }, { status: 500 });
  }
}
