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
    if (secretaria === '' || departamento === '') {
      toast.error("Preencha todos os campos!");
      return;
    }

    await addDoc(collection(db, 'setores'), {
      secretaria: secretaria,
      departamento: departamento
    }).then(() => {
      toast.success("Setor cadastrado!");
      setSecretaria('');
      setDepartamento('');
      // Atualiza a lista localmente para o admin ver o que acabou de criar
      setSetores([...setores, { secretaria, departamento }]);
    });
  }

  async function handleDelete(id) {
    const docRef = doc(db, 'setores', id);
    await deleteDoc(docRef).then(() => {
      toast.success("Setor excluído!");
      setSetores(setores.filter(item => item.id !== id));
    });
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
            <button type="submit">Cadastrar Setor</button>
          </form>
        </div>

        <div className="container">
          <table>
            <thead>
              <tr>
                <th scope="col">Secretaria</th>
                <th scope="col">Departamento</th>
                <th scope="col">#</th>
              </tr>
            </thead>
            <tbody>
              {setores.map((item, index) => (
                <tr key={index}>
                  <td data-label="Secretaria">{item.secretaria}</td>
                  <td data-label="Departamento">{item.departamento}</td>
                  <td data-label="#">
                    <button className="action" style={{backgroundColor: '#FD441B'}} onClick={() => handleDelete(item.id)}>
                      <FiTrash2 size={15} color="#FFF" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
