export type ChatRoom = {
  createdBy: string;
  name: string;
  id: string;
}

export type Schema = {
  chatRooms: ChatRoom[];
}