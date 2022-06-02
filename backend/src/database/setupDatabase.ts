import { Low, JSONFile } from 'lowdb';

type ChatRoom = {
  createdBy: string;
  name: string;
  id: string;
}

type Schema = {
  chatRooms: ChatRoom[];
}

const adapter = new JSONFile<Schema>('./src/database/database.json');
const db = new Low<Schema>(adapter);

async function setupDatabase() {
  await db.read();
  
  if (!db.data) {
    console.log('yooo!');
    db.data = { chatRooms: [] };
    await db.write(); 
  }

  console.log(db.data);
  await db.read();

  return db;
}

export default setupDatabase;