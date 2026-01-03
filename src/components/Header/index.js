import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiUser, FiSettings, FiUsers } from 'react-icons/fi'; // Adicionado FiUsers aqui
import './header.css';

export default function Header(){
  const { user } = useContext(AuthContext);

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuario" />
      </div>

      <Link to="/dashboard">
        <FiHome color="#FFF" size={24} />
        Chamados
      </Link>

      {/* Aba Servidores (Antiga Clientes) visível para todos ou apenas Adm conforme sua regra */}
      <Link to="/servidores">
        <FiUsers color="#FFF" size={24} />
        Servidores
      </Link>

      <Link to="/profile">
        <FiUser color="#FFF" size={24} />
        Perfil
      </Link>

      {/* Rota de configurações para o ADM */}
      {user.isadm && (
        <Link to="/settings">
          <FiSettings color="#FFF" size={24} />
          Configurações
        </Link>
      )}

    </div>
  )
}
