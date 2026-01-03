import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';   
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiSettings, FiUser, FiLogOut, FiList } from 'react-icons/fi'; // Import único e completo
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  const { user, logOut } = useContext(AuthContext);

  return (
    <div className='sidebar'>
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt='foto do usuario' />
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

// Dentro do return do seu Header:
<Link to="/servidores">
  <FiUsers color="#FFF" size={24} />
  Servidores
</Link>

{user.isadm && (
  <Link to="/settings">
    <FiSettings color="#FFF" size={24} />
    Configurações
  </Link>
)}

      {/* Aba de Setores visível apenas para Admin */}
      {user.isadm && (
        <Link to='/settings'>
          <FiList color='#fff' size={24} />
          Setores
        </Link>
      )}

      <button onClick={() => logOut()} className="logout-btn">
        <FiLogOut color='#fff' size={24} />
        Sair
      </button>
    </div>
  )
}
