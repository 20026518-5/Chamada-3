import { Routes, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers'; // Este é o componente que agora é "Servidores"
import New from '../pages/New';
import Settings from '../pages/Settings'; 

import Private from './private';

function RoutesApp(){
  return(
    <Routes>
      <Route path="/" element={ <SignIn/> } />
      <Route path="/register" element={ <SignUp/> } />

      <Route path="/dashboard" element={ <Private><Dashboard/></Private> } />
      <Route path="/profile" element={ <Private><Profile/></Private> } />
      
      {/* Alterado de /customers para /servidores conforme solicitado */}
      <Route path="/servidores" element={ <Private><Customers/></Private> } />
      
      <Route path="/new" element={ <Private><New/></Private> } />
      <Route path="/new/:id" element={ <Private><New/></Private> } />
      
      <Route path="/settings" element={ <Private><Settings/></Private> } />
    </Routes>
  )
}

export default RoutesApp;
