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

            }

        }
    }
}

export default Queue;