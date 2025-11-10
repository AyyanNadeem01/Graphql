import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import styles from "./App.module.css";

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
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Login</h1>
          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Username..."
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password..."
          />
          <button className={styles.button} onClick={handleLogin} disabled={loggingIn}>
            {loggingIn ? "Logging in..." : "Login"}
          </button>
          {loginError && <div className={styles.errorMessage}>Error: {loginError.message}</div>}
        </div>
      </div>
    );
  }

  if (loading || loadingById) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (errorById) return <p>Error: {errorById.message}</p>;

  return (
    <div className={styles.container}>
      <button className={`${styles.button} ${styles.logoutButton}`} onClick={handleLogout}>
        Logout
      </button>

      <div className={styles.section}>
        <div className={styles.usersContainer}>
          <h1 className={styles.sectionTitle}>All Users</h1>
          <ul className={styles.usersList}>
            {data?.getUser?.length > 0 ? (
              data.getUser.map((user) => (
                <li key={user.id} className={styles.userItem}>
                  <p className={styles.userText}>
                    <span className={styles.userLabel}>Name:</span>
                    <span className={styles.userValue}>{user.name}</span>
                  </p>
                  <p className={styles.userText}>
                    <span className={styles.userLabel}>Age:</span>
                    <span className={styles.userValue}>{user.age}</span>
                  </p>
                  <p className={styles.userText}>
                    <span className={styles.userLabel}>Married:</span>
                    <span className={styles.userValue}>{user.isMarried ? "Yes" : "No"}</span>
                  </p>
                </li>
              ))
            ) : (
              <li className={styles.userItem}>
                <p className={styles.userText}>No users found</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.userByIdContainer}>
          <h1 className={styles.sectionTitle}>User by ID</h1>
          <input
            className={styles.userIdInput}
            value={userId}
            onChange={(e) => handleUserIdChange(e.target.value)}
            placeholder="Enter User ID..."
          />
          {dataById?.getUserById ? (
            <div className={styles.userInfo}>
              <p className={styles.userText}>
                <span className={styles.userLabel}>Name:</span>
                <span className={styles.userValue}>{dataById.getUserById.name}</span>
              </p>
              <p className={styles.userText}>
                <span className={styles.userLabel}>Age:</span>
                <span className={styles.userValue}>{dataById.getUserById.age}</span>
              </p>
              <p className={styles.userText}>
                <span className={styles.userLabel}>Married:</span>
                <span className={styles.userValue}>{dataById.getUserById.isMarried ? "Yes" : "No"}</span>
              </p>
            </div>
          ) : (
            <div className={styles.userInfo}>
              <p className={styles.userText}>No user found</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <h2>Create New User</h2>
          <div className={styles.formGroup}>
            <input
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name..."
            />
            <input
              className={styles.formInput}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username..."
            />
            <input
              className={styles.formInput}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password..."
            />
            <input
              className={styles.formInput}
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age..."
            />
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                type="checkbox"
                checked={isMarried}
                onChange={(e) => setIsMarried(e.target.checked)}
              />
              Married
            </label>
            <button className={`${styles.button} ${styles.formButton}`} onClick={handleCreateUser} disabled={creating}>
              {creating ? "Creating..." : "Create User"}
            </button>
            {createError && <div className={styles.errorMessage}>Error: {createError.message}</div>}
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>Update User</h2>
          <div className={styles.formGroup}>
            <input
              className={styles.formInput}
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              placeholder="Name..."
            />
            <input
              className={styles.formInput}
              type="number"
              value={updateAge}
              onChange={(e) => setUpdateAge(e.target.value)}
              placeholder="Age..."
            />
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                type="checkbox"
                checked={updateIsMarried}
                onChange={(e) => setUpdateIsMarried(e.target.checked)}
              />
              Married
            </label>
            <button className={`${styles.button} ${styles.formButton}`} onClick={handleUpdateUser} disabled={updating}>
              {updating ? "Updating..." : "Update User"}
            </button>
            {updateError && <div className={styles.errorMessage}>Error: {updateError.message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
