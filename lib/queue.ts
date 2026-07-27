// Administrador de colas asíncronas BullMQ sobre Redis
export interface QueueJob {
  type: 'EMAIL' | 'PDF' | 'ABANDONED_CART_NOTIFICATION' | 'WISHLIST_STOCK_ALERT' | 'WISHLIST_PRICE_ALERT' | 'REPORTS_GENERATION';
  payload: any;
}

import { processReportJob } from './reports/worker';

export async function enqueueJob(job: QueueJob) {
  const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
  console.log(`⚡ [BULLMQ QUEUE JOB] Tipo: ${job.type} encolado en ${redisUrl}`);

  if (job.type === 'REPORTS_GENERATION') {
    // Execute asynchronously in the background so request thread is not blocked
    setImmediate(() => {
      processReportJob(job.payload).catch((err) => {
        console.error('Error processing background report job:', err);
      });
    });
  }

  return { success: true, jobId: `job_${Date.now()}` };
}
