import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const users = [
  { id: "1", name: "John Doe", age: 30, isMarried: true },
  { id: "2", name: "Jane Smith", age: 25, isMarried: false },
  { id: "3", name: "Alice Johnson", age: 28, isMarried: false },
];

const typeDefs = `
  type Query {
    getUser: [User]
    getUserById(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, age: Int!, isMarried: Boolean!): User
    updateUser(id: ID!, name: String, age: Int, isMarried: Boolean): User
    }

  type User {
    id: ID
    name: String
    age: Int
    isMarried: Boolean
  }
`;

const resolvers = {
  Query: {
    getUser: () => users,
    getUserById: (parent, args) => users.find((user) => user.id === args.id),
  },
  Mutation: {
    createUser: (parent, args) => {
      const { name, age, isMarried } = args;
      const newUser = {
        id: (users.length + 1).toString(),
        name,
        age,
        isMarried,
      };
      users.push(newUser);
      return newUser;
    },
     updateUser: (parent, args) => {
      const user = users.find((u) => u.id === args.id);
      if (!user) throw new Error("User not found");

      if (args.name !== undefined) user.name = args.name;
      if (args.age !== undefined) user.age = args.age;
      if (args.isMarried !== undefined) user.isMarried = args.isMarried;

      return user;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`Server Running at ${url}`);
