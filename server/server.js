import { randomUUID } from "crypto";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const users = [
  { id: "1", name: "John Doe", username: "john", password: "password123", age: 30, isMarried: true },
  { id: "2", name: "Jane Smith", username: "jane", password: "password456", age: 25, isMarried: false },
  { id: "3", name: "Alice Johnson", username: "alice", password: "password789", age: 28, isMarried: false }
];

const authTokens = new Map();

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const typeDefs = `
  type Query {
    getUser: [User]
    getUserById(id: ID!): User
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    createUser(name: String!, username: String!, password: String!, age: Int!, isMarried: Boolean!): User
    updateUser(id: ID!, name: String, age: Int, isMarried: Boolean): User
  }

  type User {
    id: ID
    name: String
    username: String
    age: Int
    isMarried: Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

const resolvers = {
  Query: {
    getUser: (parent, args, context) => {
      if (!context.currentUser) throw new Error("Unauthorized");
      return users.map(sanitizeUser);
    },
    getUserById: (parent, args, context) => {
      if (!context.currentUser) throw new Error("Unauthorized");
      const user = users.find((u) => u.id === args.id);
      return sanitizeUser(user);
    }
  },
  Mutation: {
    login: (parent, args) => {
      const user = users.find((u) => u.username === args.username);
      if (!user || user.password !== args.password) throw new Error("Invalid credentials");
      const token = randomUUID();
      authTokens.set(token, user.id);
      return {
        token,
        user: sanitizeUser(user)
      };
    },
    createUser: (parent, args, context) => {
      if (!context.currentUser) throw new Error("Unauthorized");
      if (users.some((u) => u.username === args.username)) throw new Error("Username already exists");
      const newUser = {
        id: (users.length + 1).toString(),
        name: args.name,
        username: args.username,
        password: args.password,
        age: args.age,
        isMarried: args.isMarried
      };
      users.push(newUser);
      return sanitizeUser(newUser);
    },
    updateUser: (parent, args, context) => {
      if (!context.currentUser) throw new Error("Unauthorized");
      const user = users.find((u) => u.id === args.id);
      if (!user) throw new Error("User not found");

      if (args.name !== undefined) user.name = args.name;
      if (args.age !== undefined) user.age = args.age;
      if (args.isMarried !== undefined) user.isMarried = args.isMarried;

      return sanitizeUser(user);
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return { currentUser: null };
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const userId = authTokens.get(token);
    if (!userId) return { currentUser: null };
    const currentUser = users.find((user) => user.id === userId) || null;
    return { currentUser };
  }
});

console.log(`Server Running at ${url}`);
