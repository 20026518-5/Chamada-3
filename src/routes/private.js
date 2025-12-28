import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth";
import Loading from "../components/Loading";

export default function Private ({children}){
  const {signed,loading} = useContext(AuthContext);
  if(loading) return  (
  <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <Loading size={40} color="#121212" />
  </div>
);
  if(!signed) return <Navigate to='/' />
  
  //console.log(signed);
  return children;
}
