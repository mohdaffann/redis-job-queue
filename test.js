import Queue from "./queue.js";

const emailQueue = new Queue('emails');

await emailQueue.add({ email: 'jondoe@gmail.com', msg: 'hello jd' });
await emailQueue.add({ email: 'groot@gmail.com', msg: 'hello groot' });

emailQueue.process(async (job) => {
    console.log('job is processing', job.id);
    console.log('job details', job.data);
    await new Promise(res => setTimeout(res, 2000));

})