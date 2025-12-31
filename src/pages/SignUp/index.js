import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { AuthContext } from '../../contexts/auth';
import { FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify'; // Importação que faltava

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [secretaria, setSecretaria] = useState(''); // Novo campo
  const [departamento, setDepartamento] = useState(''); // Novo campo

  const { signUp, loadingAuth } = useContext(AuthContext);
  
  function handleSignUp(e) {
    e.preventDefault();
    // Verificando se todos os campos estão preenchidos
    if(name !== '' && email !== '' && password !== '' && secretaria !== '' && departamento !== ''){
       signUp(name, email, password, secretaria, departamento);
    } else {
       toast.error("Preencha todos os campos, incluindo Secretaria e Departamento!");
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt='logo signUp'/>
        </div>

        <form className='form' onSubmit={handleSignUp}>
          <h1>Nova Conta</h1>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder='Nome' 
          />
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder='E-mail'
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder='Senha' 
          />
          {/* Novos Inputs */}
          <input 
            type="text" 
            value={secretaria} 
            onChange={(e) => setSecretaria(e.target.value)} 
            placeholder='Sua Secretaria' 
          />
          <input 
            type="text" 
            value={departamento} 
            onChange={(e) => setDepartamento(e.target.value)} 
            placeholder='Seu Departamento' 
          />

          <button type="submit" disabled={loadingAuth}>
            {loadingAuth ? <FaSpinner className="loading-spinner" /> : "Cadastrar"}
          </button>
        </form>
        <Link to='/'>Já possuo conta!</Link>
      </div>
    </div>
  );
}

export default SignUp;
