import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState(''); // Input individual
  const [listaDepartamentos, setListaDepartamentos] = useState([]); // Lista temporária
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSetores() {
      try {
        const querySnapshot = await getDocs(collection(db, 'setores'));
        let lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setSetores(lista);
      } catch (error) {
        console.error("Erro ao buscar setores: ", error);
      } finally {
        setLoading(false);
      }
    }
    loadSetores();
  }, []);

  // Adiciona o departamento na lista temporária da tela
  function handleAddToList(e) {
    e.preventDefault();
    if (departamentoInput === '') {
      toast.warning("Digite o nome do departamento!");
      return;
    }
    setListaDepartamentos([...listaDepartamentos, departamentoInput]);
    setDepartamentoInput('');
  }

  // Remove da lista temporária
  function handleRemoveFromList(index) {
    let novaLista = listaDepartamentos.filter((_, i) => i !== index);
    setListaDepartamentos(novaLista);
  }

  // Salva no Firebase (Mantém compatibilidade com o seu SignUp atual)
  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione ao menos um departamento!");
      return;
    }

    try {
      // Cria cada departamento como um documento para o filtro de 'SignUp' funcionar
      const promises = listaDepartamentos.map(dep => {
        return addDoc(collection(db, 'setores'), {
          secretaria: secretaria,
          departamento: dep
        });
      });

      await Promise.all(promises);

      toast.success("Secretaria e departamentos cadastrados!");
      setSecretaria('');
      setListaDepartamentos([]);
      
      // Recarrega a página para atualizar a tabela
      window.location.reload(); 

    } catch (error) {
      console.error(error);
      toast.error("Falha ao salvar no banco de dados.");
    }
  }

  async function handleDelete(id) {
    try {
      const docRef = doc(db, 'setores', id);
      await deleteDoc(docRef);
      setSetores(setores.filter(item => item.id !== id));
      toast.success("Setor excluído!");
    } catch (error) {
      toast.error("Erro ao excluir setor.");
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores">
          <FiSettings size={25} />
        </Title>

        <div className="container">
          <div className="form-profile">
            <label>Secretaria</label>
            <input 
              type="text" 
              value={secretaria} 
              onChange={(e) => setSecretaria(e.target.value)} 
              placeholder="Ex: Secretaria de Saúde" 
            />

            <label>Adicionar Departamentos</label>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={departamentoInput} 
                  onChange={(e) => setDepartamentoInput(e.target.value)} 
                  placeholder="Ex: Almoxarifado" 
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button onClick={handleAddToList} style={{ width: '50px', backgroundColor: '#181c2e' }}>
                    <FiPlus size={20} color="#FFF" />
                </button>
            </div>

            {/* Listagem visual do que será cadastrado */}
            {listaDepartamentos.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#f8f8f8', borderRadius: '5px' }}>
                    <p><strong>Aguardando cadastro:</strong></p>
                    <ul style={{ listStyle: 'none', marginTop: '5px' }}>
                        {listaDepartamentos.map((dep, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                                <span>{dep}</span>
                                <button onClick={() => handleRemoveFromList(index)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Excluir</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleSaveAll} style={{ marginTop: '20px' }}>Cadastrar Secretaria e Departamentos</button>
          </div>
        </div>

        {/* Tabela de Setores já cadastrados */}
        <div className="container">
          {loading ? (
            <span>Carregando setores...</span>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Secretaria</th>
                  <th scope="col">Departamento</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {setores.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Secretaria">{item.secretaria}</td>
                    <td data-label="Departamento">{item.departamento}</td>
                    <td data-label="Ações">
                      <button className="action" style={{ backgroundColor: '#FD441B' }} onClick={() => handleDelete(item.id)}>
                        <FiTrash2 size={15} color="#FFF" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
