import { gql } from "@apollo/client";
import { useQuery,useMutation } from "@apollo/client/react";


import { useState } from "react";

const GET_USERS = gql`
  query getUsers {
    getUser {
      id
      age
      name
      isMarried
    }
  }
`;

const GET_USER_BY_ID = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      age
      name
      isMarried
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      id
      name
      age
      isMarried
    }
  }
`;

function App() {
  // 🔹 State for new user input
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isMarried, setIsMarried] = useState(false);

  // 🔹 Queries
  const { data, loading, error } = useQuery(GET_USERS);
  const { data: dataById, loading: loadingById, error: errorById } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: "3" },
    }
  );

  // 🔹 Mutation
  const [createUser, { loading: creating, error: createError }] =
    useMutation(CREATE_USER, {
      refetchQueries: [{ query: GET_USERS }],
    });

  // 🔹 Create User Handler
  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          name,
          age: Number(age),
          isMarried,
        },
      });
      alert("✅ User created successfully!");
      setName("");
      setAge("");
      setIsMarried(false);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  // 🔹 Loading and Error States
  if (loading || loadingById) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (errorById) return <p>Error: {errorById.message}</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#222",
        color: "white",
      }}
    >
      <h1>Users</h1>
      {data?.getUser?.map((user) => (
        <p key={user.id}>
          {user.name} — Age: {user.age} — Married:{" "}
          {user.isMarried ? "Yes" : "No"}
        </p>
      ))}

      <h1>User by ID (3)</h1>
      {dataById?.getUserById && (
        <p>
          {dataById.getUserById.name} — Age: {dataById.getUserById.age} — Married:{" "}
          {dataById.getUserById.isMarried ? "Yes" : "No"}
        </p>
      )}

      <h2>Create New User</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name..."
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age..."
        />
        <label>
          <input
            type="checkbox"
            checked={isMarried}
            onChange={(e) => setIsMarried(e.target.checked)}
          />{" "}
          Married
        </label>

        <button onClick={handleCreateUser} disabled={creating}>
          {creating ? "Creating..." : "Create User"}
        </button>
        {createError && <p>Error: {createError.message}</p>}
      </div>
    </div>
  );
}


export default App;
