"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeInactiveParticipants = exports.updateParticipants = exports.updateMessages = exports.participants$ = exports.messages$ = void 0;
const rxjs_1 = require("rxjs");
exports.messages$ = new rxjs_1.BehaviorSubject([]);
exports.participants$ = new rxjs_1.BehaviorSubject([]);
function updateMessages(payload) {
    console.log('updating', payload);
    exports.messages$.next([...exports.messages$.getValue(), { text: payload === null || payload === void 0 ? void 0 : payload.text, username: payload === null || payload === void 0 ? void 0 : payload.username }]);
}
exports.updateMessages = updateMessages;
function updateParticipants(payload) {
    const existingParticipants = exports.participants$.value;
    exports.participants$.next([...existingParticipants, { username: payload.username, id: payload.id }]);
}
exports.updateParticipants = updateParticipants;
function removeInactiveParticipants(idsOfActiveParticipants) {
    const onlineParticipants = exports.participants$.getValue().filter(p => idsOfActiveParticipants.includes(p.id));
    exports.participants$.next(onlineParticipants);
}
exports.removeInactiveParticipants = removeInactiveParticipants;
