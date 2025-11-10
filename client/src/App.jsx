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

function App() {
 const { data, loading, error } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
    </div>
  );
}

export default App;
