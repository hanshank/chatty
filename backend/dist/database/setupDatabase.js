"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const adapter = new FileSync_1.default('database.json');
exports.db = (0, lowdb_1.default)(adapter);
function setupDatabase() {
    exports.db.defaults({ chatRooms: [] }).write();
    return exports.db;
}
exports.default = setupDatabase;
