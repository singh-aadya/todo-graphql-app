const { ApolloServer, gql } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');

let todos = [];

const typeDefs = gql`
  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: String!
  }

  type Query {
    getTodos(completed: Boolean, priority: String): [Todo]
  }

  type Mutation {
    addTodo(task: String!, priority: String!): Todo
    deleteTodo(id: ID!): Boolean
    toggleTodo(id: ID!): Todo
  }
`;

const resolvers = {
  Query: {
    getTodos: (_, { completed, priority }) => {
      return todos.filter(todo => {
        if (completed !== undefined && todo.completed !== completed) return false;
        if (priority && todo.priority !== priority) return false;
        return true;
      });
    },
  },
  Mutation: {
    addTodo: (_, { task, priority }) => {
      const newTodo = { id: uuidv4(), task, completed: false, priority };
      todos.push(newTodo);
      return newTodo;
    },
    deleteTodo: (_, { id }) => {
      const initialLength = todos.length;
      todos = todos.filter(todo => todo.id !== id);
      return todos.length < initialLength;
    },
    toggleTodo: (_, { id }) => {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
      return todo;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
