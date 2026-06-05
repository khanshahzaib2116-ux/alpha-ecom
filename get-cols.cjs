const sdk = require('appwrite');
const c = new sdk.Client().setEndpoint('https://nyc.cloud.appwrite.io/v1').setProject('6a231a080000231d1f8b');
const db = new sdk.Databases(c);

async function main() {
  const result = await db.listCollections('6a231d41974aac5cb0aa');
  for (const col of result.collections) {
    console.log(col.name + '=' + col['$id']);
  }
}
main().catch(e => console.log(e));
