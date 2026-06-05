import { Client, Databases } from 'node-appwrite/dist/index.js';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6a231a080000231d1f8b')
  .setKey('standard_6ce565e29a8f2c36a1c86ec4b3e2e81fee01e4cafec6170d3037dd8f17706a09275830ede25fe9f6256357d6c639273046914b9052a870189f4a89f5dbe4f861b8ec7d06dbe4e7430f1a1c21afcb9354ec7560bb51427d62e204015f99784e2d643ae7b679684fd732e5460fffae43b578317a13464433d1de259adaf98dfdfe');

const databases = new Databases(client);

try {
  const dbList = await databases.list();
  console.log('Databases:', JSON.stringify(dbList, null, 2));
} catch (e) {
  console.error('Error listing databases:', e.message);
  console.error('Full error:', JSON.stringify(e, null, 2));
}
