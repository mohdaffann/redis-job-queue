import { createClient } from 'redis'

const client = createClient({
    url: 'redis://localhost:6379'
})

client.connect();
console.log('redis connected');

await client.set('test', 'Hello rediss!');
const value = await client.get("test");
console.log("retrieved value", value);

client.quit();

