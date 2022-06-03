"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParticipants = exports.updateMessages = exports.participants$ = exports.messages$ = void 0;
const rxjs_1 = require("rxjs");
exports.messages$ = new rxjs_1.BehaviorSubject([]);
exports.participants$ = new rxjs_1.BehaviorSubject([]);
// export const roomContent$ = combineLatest([participants$, messages$]).pipe(map(([participants, messages]) => ({ participants, messages })));
function updateMessages(payload) {
    console.log('updating', payload);
    exports.messages$.next([...exports.messages$.getValue(), { text: payload === null || payload === void 0 ? void 0 : payload.text, username: payload === null || payload === void 0 ? void 0 : payload.username }]);
}
exports.updateMessages = updateMessages;
function updateParticipants(payload) {
    const existingParticipants = exports.participants$.value;
    exports.participants$.next([...existingParticipants, { username: payload.username }]);
}
exports.updateParticipants = updateParticipants;
