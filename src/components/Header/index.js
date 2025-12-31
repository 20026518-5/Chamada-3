import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';   
import { AuthContext } from '../../contexts/auth';
// 1. Adicione o FiLogOut nos imports
import {FiHome, FiSettings, FiUser, FiLogOut} from 'react-icons/fi'; 
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  // 2. Pegue a função logOut do seu contexto
  const {user, logOut} = useContext(AuthContext); 

  return (
    <div className='sidebar'>
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt = 'foto do usuario' />
      </div>
      <Link to='/dashboard'>
        <FiHome color='#fff' size={24} />
        Chamados
      </Link>

      <Link to='/customers'>
        <FiUser color='#fff' size={24} />
        Clientes
      </Link>

      <Link to='/profile'>
        <FiSettings color='#fff' size={24} />
        Perfil
      </Link>

      {/* 3. Adicione o botão de logout */}
      <button onClick={ () => logOut() } className="logout-btn">
        <FiLogOut color='#fff' size={24} />
        Sair
      </button>
    </div>
  )
}
