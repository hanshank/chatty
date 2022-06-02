var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Low, JSONFile } from 'lowdb';
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.read();
        if (!db.data) {
            db.data = { chatRooms: [] };
            yield db.write();
        }
        return db;
    });
}
export default setupDatabase;
