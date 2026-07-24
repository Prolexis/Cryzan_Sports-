import { prisma } from '@/lib/prisma';

export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });
    return flag ? flag.isEnabled : true;
  } catch (error) {
    return true; // Fallback por defecto habilitado
  }
}
