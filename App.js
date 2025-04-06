import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TODOS = gql`
  query GetTodos($completed: Boolean, $priority: String) {
    getTodos(completed: $completed, priority: $priority) {
      id
      task
      completed
      priority
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!, $priority: String!) {
    addTodo(task: $task, priority: $priority) {
      id
      task
      completed
      priority
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`;

function App() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [filters, setFilters] = useState({ completed: null, priority: '' });

  const { loading, error, data, refetch } = useQuery(GET_TODOS, {
    variables: filters,
  });

  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => {
      setTask('');
      refetch();
    },
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onCompleted: () => refetch(),
  });

  const [toggleTodo] = useMutation(TOGGLE_TODO, {
    onCompleted: () => refetch(),
  });

  const handleAddTodo = () => {
    if (!task) return alert("Can't add empty todo!");
    addTodo({ variables: { task, priority } });
  };

  const handleToggle = id => toggleTodo({ variables: { id } });

  const handleDelete = id => deleteTodo({ variables: { id } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching todos</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📝 To-Do App (GraphQL)</h1>

      <div>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Enter task..."
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <button onClick={handleAddTodo}>Add</button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Filter: </label>
        <select
          onChange={e =>
            setFilters(prev => ({ ...prev, completed: e.target.value === '' ? null : e.target.value === 'true' }))
          }
        >
          <option value="">All</option>
          <option value="true">Completed</option>
          <option value="false">Incomplete</option>
        </select>

        <select
          onChange={e =>
            setFilters(prev => ({ ...prev, priority: e.target.value }))
          }
        >
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <button onClick={() => refetch()}>Apply</button>
      </div>

      <ul>
        {data.getTodos.map(todo => (
          <li key={todo.id} style={{ margin: '10px 0' }}>
            <span
              onClick={() => handleToggle(todo.id)}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
                marginRight: '1rem',
              }}
            >
              {todo.task} ({todo.priority})
            </span>
            <button onClick={() => handleDelete(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
