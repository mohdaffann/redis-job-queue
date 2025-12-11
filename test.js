import Queue from "./queue.js";

/* 

(Basic queue testing phase 1 , with emails and some payload data)
const emailQueue = new Queue('emails');

await emailQueue.add({ email: 'jondoe@gmail.com', msg: 'hello jd' });
await emailQueue.add({ email: 'groot@gmail.com', msg: 'hello groot' });

emailQueue.process(async (job) => {
    console.log('job is processing', job.id);
    console.log('job details', job.data);
    await new Promise(res => setTimeout(res, 2000));

})


 
 (Testing with 2 failed attempts and a successful attempt followed by , phase 2)

const testQueue = new Queue('test-queue');
await testQueue.add({ attempt: 0 })

testQueue.process(async (job) => {
    console.log(`processing job ${job.id}`);
    console.log(`present retry count ${job.retries}`);

    const retries = parseInt(job.retries);

    if (retries < 2) {
        console.log(`attempt ${retries + 1} failing on demand`);
        throw new Error('Simulated failure')
    }
    console.log(`attempt ${retries + 1} success`);


})
   
(Testing with always failed case , phase 3)
const testQueue = new Queue('test-queue')

await testQueue.add({ topic: 'test' })

testQueue.process(async (job) => {
    console.log(`processing job ${job.id} `);
    console.log(`current retry count ${job.retries}`);
    throw new Error('alwaysss fails')
})
 */

const testQueue = new Queue('test-queue')

await testQueue.add({ name: 'job1', failAttempts: 2 })
await testQueue.add({ name: 'job2', failAttempts: 0 })
await testQueue.add({ name: 'job3', failAttempts: 1 })
await testQueue.add({ name: 'job4', failAttempts: 3 })

testQueue.process(async (job) => {
    const retries = parseInt(job.retries)
    console.log(`processing job ${job.data.name} at ${retries} retries `);

    if (retries < job.data.failAttempts) {
        console.log(`failing ${job.data.name} at ${retries} attempt`);
        throw new Error('Forced failure')
    }

    console.log(`${job.data.name} processed successfully`);


})