import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [setores, setSetores] = useState([]);

  useEffect(() => {
    async function loadSetores() {
      const querySnapshot = await getDocs(collection(db, 'setores'));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setSetores(lista);
    }
    loadSetores();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (secretaria !== '' && departamento !== '') {
      await addDoc(collection(db, 'setores'), {
        secretaria: secretaria,
        departamento: departamento
      }).then(() => {
        toast.success("Setor cadastrado!");
        setSecretaria(''); setDepartamento('');
      });
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores"><FiSettings size={25} /></Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleAdd}>
            <label>Secretaria</label>
            <input type="text" value={secretaria} onChange={(e) => setSecretaria(e.target.value)} placeholder="Ex: Saúde" />
            <label>Departamento</label>
            <input type="text" value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Ex: Almoxarifado" />
            <button type="submit">Salvar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
