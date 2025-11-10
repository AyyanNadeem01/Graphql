import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";


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
  query getUserById($id:ID!) {
    getUserById(id:$id) {
      id
      age
      name
      isMarried
    }
  }
`;

function App() {
 const { data, loading, error } = useQuery(GET_USERS);
  const { data: dataById, loading: loadingById, error: errorById } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: "3" },
    }
  );

  
  if (loading || loadingById) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (errorById) return <p>Error: {errorById.message}</p>;




  return (
   <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#222",
      }}>
      <h1>Users</h1>
      {data.getUser.map((user) => (
        <p style={{ textAlign: "center", backgroundColor: "#222", padding: "1rem" }} key={user.id}>
          {user.name} — Age: {user.age} — Married:{" "}
          {user.isMarried ? "Yes" : "No"}
        </p>
      ))}

  <h1>User by ID (3)</h1>
      {dataById?.getUserById && (
        <p
          style={{
            textAlign: "center",
            backgroundColor: "#333",
            padding: "1rem",
            margin: "0.5rem",
            borderRadius: "8px",
          }}
        >
          {dataById.getUserById.name} — Age: {dataById.getUserById.age} — Married:{" "}
          {dataById.getUserById.isMarried ? "Yes" : "No"}
        </p>
      )}

    </div>
  );
}

export default App;
