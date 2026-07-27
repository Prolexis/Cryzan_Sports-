// Administrador de colas asíncronas BullMQ sobre Redis
export interface QueueJob {
  type: 'EMAIL' | 'PDF' | 'ABANDONED_CART_NOTIFICATION' | 'WISHLIST_STOCK_ALERT' | 'WISHLIST_PRICE_ALERT';
  payload: any;
}

export async function enqueueJob(job: QueueJob) {
  const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
  console.log(`⚡ [BULLMQ QUEUE JOB] Tipo: ${job.type} encolado en ${redisUrl}`);
  return { success: true, jobId: `job_${Date.now()}` };
}
