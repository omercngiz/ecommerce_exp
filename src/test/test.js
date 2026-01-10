import Database from "../database/database.js";

const db = new Database();

async function test() {
    await db.remove('data.json', 2169203535);
    await db.read('data.json').then(data => console.log(data));
}

test();