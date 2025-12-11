import { createClient } from 'redis'
import { v4 as uuidv4 } from 'uuid';
class Queue {
    constructor(queueName) {
        this.queueName = queueName;
        this.redis = createClient();
        this.redis.connect();
    }
    async add(jobData) {
        const id = uuidv4();
        const payload = {
            id: id,
            data: JSON.stringify(jobData),
            status: 'waiting',
            retries: 0,
            maxRetries: 3,
            timestamp: Date.now().toString()
        }
        await this.redis.hSet(
            id,
            payload
        )

        await this.redis.rPush(`${this.queueName}:waiting`, id);
        return id;

    }

    async process(handlerFn) {
        while (true) {
            const res = await this.redis.blPop(`${this.queueName}:waiting`, 0);
            const jobId = res.element;
            const payload = await this.redis.hGetAll(jobId);
            payload.data = JSON.parse(payload.data)
            await this.redis.hSet(jobId, 'status', 'processing');
            try {
                await handlerFn(payload);
                await this.redis.hSet(jobId, 'status', 'finished')
            } catch (error) {
                console.log('error in processing the job', error);
                await this.redis.hSet(jobId, 'status', 'failed');
                const retries = parseInt(payload.retries);
                const maxRetries = parseInt(payload.maxRetries)
                const newRetry = retries + 1
                if (newRetry < maxRetries) {
                    const delay = 1000 * Math.pow(2, newRetry);
                    console.log(`retrying job ${jobId} at delay ${delay} at ${newRetry} attempt`);

                    await new Promise(res => setTimeout(res, delay));

                    await this.redis.hSet(jobId, 'retries', newRetry.toString());
                    await this.redis.hSet(jobId, 'status', 'waiting');
                    await this.redis.rPush(`${this.queueName}:waiting`, jobId)

                } else {
                    console.log(`job ${jobId} permanently failed after ${newRetry} attempts`);

                    await this.redis.hSet(jobId, 'status', 'failed permanently');
                    await this.redis.hSet(jobId, 'error', error.message)
                }

            }

        }
    }
}

export default Queue;