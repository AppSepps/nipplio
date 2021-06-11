// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Sound, Board, UserBoard, User } = initSchema(schema);

export {
  Sound,
  Board,
  UserBoard,
  User
};