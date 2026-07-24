import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Si Cloudinary está configurado, usarlo
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;

    if (cloudinaryCloudName && cloudinaryApiKey) {
      // Simulación o llamada real a Cloudinary
      const fakeCloudinaryUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/cryzan_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      return NextResponse.json({ url: fakeCloudinaryUrl });
    }

    // Fallback: URL representativa para el prototipo Cryzan Sport
    const mockUrl = `/img/productos/${file.name.toLowerCase().includes('zapatilla') ? 'zapatillas.jpeg' : file.name.toLowerCase().includes('pelota') ? 'pelota.jpeg' : file.name.toLowerCase().includes('casaca') ? 'casaca.jpeg' : 'polo.jpeg'}`;
    return NextResponse.json({ url: mockUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json({ error: 'Error al procesar la subida de imagen' }, { status: 500 });
  }
}
