/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSound = /* GraphQL */ `
  mutation CreateSound(
    $input: CreateSoundInput!
    $condition: ModelSoundConditionInput
  ) {
    createSound(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      User {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
export const updateSound = /* GraphQL */ `
  mutation UpdateSound(
    $input: UpdateSoundInput!
    $condition: ModelSoundConditionInput
  ) {
    updateSound(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      User {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
export const deleteSound = /* GraphQL */ `
  mutation DeleteSound(
    $input: DeleteSoundInput!
    $condition: ModelSoundConditionInput
  ) {
    deleteSound(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      User {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      username
      email
      authUsername
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      boards {
        nextToken
        startedAt
      }
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      username
      email
      authUsername
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      boards {
        nextToken
        startedAt
      }
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      username
      email
      authUsername
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      boards {
        nextToken
        startedAt
      }
    }
  }
`;
export const createBoard = /* GraphQL */ `
  mutation CreateBoard(
    $input: CreateBoardInput!
    $condition: ModelBoardConditionInput
  ) {
    createBoard(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      users {
        nextToken
        startedAt
      }
    }
  }
`;
export const updateBoard = /* GraphQL */ `
  mutation UpdateBoard(
    $input: UpdateBoardInput!
    $condition: ModelBoardConditionInput
  ) {
    updateBoard(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      users {
        nextToken
        startedAt
      }
    }
  }
`;
export const deleteBoard = /* GraphQL */ `
  mutation DeleteBoard(
    $input: DeleteBoardInput!
    $condition: ModelBoardConditionInput
  ) {
    deleteBoard(input: $input, condition: $condition) {
      id
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      users {
        nextToken
        startedAt
      }
    }
  }
`;
export const createUserBoard = /* GraphQL */ `
  mutation CreateUserBoard(
    $input: CreateUserBoardInput!
    $condition: ModelUserBoardConditionInput
  ) {
    createUserBoard(input: $input, condition: $condition) {
      id
      userID
      boardID
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      user {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
export const updateUserBoard = /* GraphQL */ `
  mutation UpdateUserBoard(
    $input: UpdateUserBoardInput!
    $condition: ModelUserBoardConditionInput
  ) {
    updateUserBoard(input: $input, condition: $condition) {
      id
      userID
      boardID
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      user {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
export const deleteUserBoard = /* GraphQL */ `
  mutation DeleteUserBoard(
    $input: DeleteUserBoardInput!
    $condition: ModelUserBoardConditionInput
  ) {
    deleteUserBoard(input: $input, condition: $condition) {
      id
      userID
      boardID
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      user {
        id
        username
        email
        authUsername
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      board {
        id
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
    }
  }
`;
