import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync';
import { ChatRoom } from 'types';

export type Schema = {
  chatRooms: ChatRoom[];
}

const adapter = new FileSync<Schema>('database.json')
export const db = low(adapter)

function setupDatabase() {
  db.defaults({ chatRooms: []}).write();

  return db;
}

export default setupDatabase;