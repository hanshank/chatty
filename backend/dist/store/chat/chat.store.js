"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeInactiveParticipants = exports.updateRoomParticipants = exports.getRoomParticipantsIdsObservable = exports.getRoomParticipantsObservable = exports.participants$ = exports.messages$ = void 0;
const rxjs_1 = require("rxjs");
// TODO: Remove
exports.messages$ = new rxjs_1.BehaviorSubject([]);
const chatRooms$ = new rxjs_1.BehaviorSubject({});
exports.participants$ = new rxjs_1.BehaviorSubject([]);
function getRoomParticipantsObservable(roomId) {
    // TODO: not emitting on changes
    const obs$ = chatRooms$.pipe((0, rxjs_1.distinctUntilKeyChanged)(roomId)).pipe((0, rxjs_1.map)(chatRooms => chatRooms[roomId] || []));
    return obs$;
}
exports.getRoomParticipantsObservable = getRoomParticipantsObservable;
function getRoomParticipantsIdsObservable(roomId) {
    const obs$ = chatRooms$.pipe((0, rxjs_1.distinctUntilKeyChanged)(roomId)).pipe((0, rxjs_1.map)(chatRooms => chatRooms[roomId].map(participant => participant.id)));
    return obs$;
}
exports.getRoomParticipantsIdsObservable = getRoomParticipantsIdsObservable;
function updateRoomParticipants(payload) {
    const existingRooms = chatRooms$.value;
    const roomSpecificParticipants = existingRooms[payload.roomId] || [];
    const newParticipant = { username: payload.participant.username, id: payload.participant.id };
    chatRooms$.next({ ...existingRooms, [payload.roomId]: [...roomSpecificParticipants, newParticipant] });
}
exports.updateRoomParticipants = updateRoomParticipants;
function removeInactiveParticipants(idsOfActiveParticipants, roomId) {
    const existingRooms = chatRooms$.getValue();
    const onlineParticipantsInRoom = existingRooms[roomId].filter(p => idsOfActiveParticipants.includes(p.id));
    chatRooms$.next({ ...existingRooms, [roomId]: onlineParticipantsInRoom });
}
exports.removeInactiveParticipants = removeInactiveParticipants;
