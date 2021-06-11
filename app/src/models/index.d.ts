import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Sound {
  readonly id: string;
  readonly board?: Board;
  readonly name?: string;
  readonly User?: User;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Sound>);
  static copyOf(source: Sound, mutator: (draft: MutableModel<Sound>) => MutableModel<Sound> | void): Sound;
}

export declare class Board {
  readonly id: string;
  readonly name?: string;
  readonly users?: (UserBoard | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Board>);
  static copyOf(source: Board, mutator: (draft: MutableModel<Board>) => MutableModel<Board> | void): Board;
}

export declare class UserBoard {
  readonly id: string;
  readonly user: User;
  readonly board: Board;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserBoard>);
  static copyOf(source: UserBoard, mutator: (draft: MutableModel<UserBoard>) => MutableModel<UserBoard> | void): UserBoard;
}

export declare class User {
  readonly id: string;
  readonly username?: string;
  readonly email?: string;
  readonly boards?: (UserBoard | null)[];
  readonly authUsername?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}