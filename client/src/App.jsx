import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

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
  mutation CreateUser(
    $name: String!
    $username: String!
    $password: String!
    $age: Int!
    $isMarried: Boolean!
  ) {
    createUser(
      name: $name
      username: $username
      password: $password
      age: $age
      isMarried: $isMarried
    ) {
      id
      name
      username
      age
      isMarried
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $age: Int, $isMarried: Boolean) {
    updateUser(id: $id, name: $name, age: $age, isMarried: $isMarried) {
      id
      name
      age
      isMarried
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        name
        username
      }
    }
  }
`;

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isMarried, setIsMarried] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState("3");
  const [updateName, setUpdateName] = useState("");
  const [updateAge, setUpdateAge] = useState("");
  const [updateIsMarried, setUpdateIsMarried] = useState(false);

  const isAuthenticated = Boolean(token);

  const { data, loading, error, refetch: refetchUsers } = useQuery(GET_USERS, {
    skip: !isAuthenticated
  });
  const {
    data: dataById,
    loading: loadingById,
    error: errorById,
    refetch: refetchUserById
  } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !isAuthenticated
  });

  useEffect(() => {
    if (!dataById?.getUserById) return;
    setUpdateName(dataById.getUserById.name);
    setUpdateAge(String(dataById.getUserById.age));
    setUpdateIsMarried(Boolean(dataById.getUserById.isMarried));
  }, [dataById]);

  const [login, { loading: loggingIn, error: loginError }] = useMutation(
    LOGIN_MUTATION,
    {
      onCompleted: ({ login: loginResult }) => {
        const authToken = loginResult.token;
        localStorage.setItem("token", authToken);
        setToken(authToken);
      }
    }
  );

  const [createUser, { loading: creating, error: createError }] = useMutation(
    CREATE_USER,
    {
      refetchQueries: [{ query: GET_USERS }],
      awaitRefetchQueries: true
    }
  );

  const [updateUser, { loading: updating, error: updateError }] = useMutation(
    UPDATE_USER,
    {
      refetchQueries: [
        { query: GET_USERS },
        { query: GET_USER_BY_ID, variables: { id: userId } }
      ],
      awaitRefetchQueries: true
    }
  );

  const handleLogin = async () => {
    try {
      await login({
        variables: { username: loginUsername, password: loginPassword }
      });
      setLoginUsername("");
      setLoginPassword("");
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          name,
          username: newUsername,
          password: newPassword,
          age: Number(age),
          isMarried
        }
      });
      await refetchUsers();
      setName("");
      setAge("");
      setIsMarried(false);
      setNewUsername("");
      setNewPassword("");
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleUserIdChange = async (value) => {
    setUserId(value);
    if (!value) return;
    await refetchUserById({ id: value });
  };

  const handleUpdateUser = async () => {
    if (!userId) return;
    try {
      await updateUser({
        variables: {
          id: userId,
          name: updateName,
          age: Number(updateAge),
          isMarried: updateIsMarried
        }
      });
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#222",
          color: "white"
        }}
      >
        <h1>Login</h1>
        <input
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          placeholder="Username..."
          style={{ marginBottom: "10px" }}
        />
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Password..."
          style={{ marginBottom: "10px" }}
        />
        <button onClick={handleLogin} disabled={loggingIn}>
          {loggingIn ? "Logging in..." : "Login"}
        </button>
        {loginError && <p>Error: {loginError.message}</p>}
      </div>
    );
  }

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
        minHeight: "100vh",
        backgroundColor: "#222",
        color: "white",
        gap: "24px"
      }}
    >
      <button
        onClick={handleLogout}
        style={{ alignSelf: "flex-end", margin: "20px", padding: "8px 16px" }}
      >
        Logout
      </button>
      <div style={{ textAlign: "center" }}>
        <h1>Users</h1>
        {data?.getUser?.map((user) => (
          <p key={user.id}>
            {user.name} — Age: {user.age} — Married: {user.isMarried ? "Yes" : "No"}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <h1>User by ID ({userId || ""})</h1>
        <input
          value={userId}
          onChange={(e) => handleUserIdChange(e.target.value)}
          placeholder="User ID..."
          style={{ textAlign: "center" }}
        />
        {dataById?.getUserById ? (
          <p>
            {dataById.getUserById.name} — Age: {dataById.getUserById.age} — Married: {" "}
            {dataById.getUserById.isMarried ? "Yes" : "No"}
          </p>
        ) : (
          <p>No user found</p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "320px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2>Create New User</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name..."
          />
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username..."
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password..."
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
            />
            Married
          </label>
          <button onClick={handleCreateUser} disabled={creating}>
            {creating ? "Creating..." : "Create User"}
          </button>
          {createError && <p>Error: {createError.message}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2>Update User</h2>
          <input
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
            placeholder="Name..."
          />
          <input
            type="number"
            value={updateAge}
            onChange={(e) => setUpdateAge(e.target.value)}
            placeholder="Age..."
          />
          <label>
            <input
              type="checkbox"
              checked={updateIsMarried}
              onChange={(e) => setUpdateIsMarried(e.target.checked)}
            />
            Married
          </label>
          <button onClick={handleUpdateUser} disabled={updating}>
            {updating ? "Updating..." : "Update User"}
          </button>
          {updateError && <p>Error: {updateError.message}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
