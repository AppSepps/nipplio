/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSound = /* GraphQL */ `
  subscription OnCreateSound {
    onCreateSound {
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
export const onUpdateSound = /* GraphQL */ `
  subscription OnUpdateSound {
    onUpdateSound {
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
export const onDeleteSound = /* GraphQL */ `
  subscription OnDeleteSound {
    onDeleteSound {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateBoard = /* GraphQL */ `
  subscription OnCreateBoard {
    onCreateBoard {
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
export const onUpdateBoard = /* GraphQL */ `
  subscription OnUpdateBoard {
    onUpdateBoard {
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
export const onDeleteBoard = /* GraphQL */ `
  subscription OnDeleteBoard {
    onDeleteBoard {
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
export const onCreateUserBoard = /* GraphQL */ `
  subscription OnCreateUserBoard {
    onCreateUserBoard {
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
export const onUpdateUserBoard = /* GraphQL */ `
  subscription OnUpdateUserBoard {
    onUpdateUserBoard {
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
export const onDeleteUserBoard = /* GraphQL */ `
  subscription OnDeleteUserBoard {
    onDeleteUserBoard {
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
