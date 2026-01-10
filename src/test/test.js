import Database from "../database/database.js";

const db = new Database();

async function test1() {
    await db.remove('data.json', 2169203535);
    await db.read('data.json').then(data => console.log(data));
}

function test2() {

}

test1();