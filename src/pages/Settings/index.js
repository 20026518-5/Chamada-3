import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus } from 'react-icons/fi'; // Adicionei FiPlus
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState(''); // Input individual
  const [listaDepartamentos, setListaDepartamentos] = useState([]); // Lista para o lote
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
        toast.error("Erro ao carregar lista de setores.");
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

  // Remove da lista temporária (antes de salvar no banco)
  function handleRemoveFromList(index) {
    let novaLista = listaDepartamentos.filter((_, i) => i !== index);
    setListaDepartamentos(novaLista);
  }

  // Salva tudo no Firebase
  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione ao menos um departamento!");
      return;
    }

    try {
      // Cria uma promessa para cada departamento para salvar individualmente
      // mantendo a compatibilidade com o seu filtro no SignUp
      const promessas = listaDepartamentos.map(dep => {
        return addDoc(collection(db, 'setores'), {
          secretaria: secretaria,
          departamento: dep
        });
      });

      await Promise.all(promessas);

      toast.success("Secretaria e departamentos cadastrados!");
      
      // Limpa os campos e recarrega a lista da tela
      setSecretaria('');
      setListaDepartamentos([]);
      
      // Recarregar lista total (opcional: você pode dar um push no estado setores para ser mais rápido)
      window.location.reload(); 

    } catch (error) {
      console.error("Erro ao cadastrar: ", error);
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
      console.error("Erro ao deletar: ", error);
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

            <label>Adicionar Departamento</label>
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

            {/* Lista temporária de departamentos antes de salvar */}
            {listaDepartamentos.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#f8f8f8', borderRadius: '5px' }}>
                    <p><strong>Departamentos a cadastrar:</strong></p>
                    <ul style={{ listStyle: 'none', marginTop: '5px' }}>
                        {listaDepartamentos.map((dep, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                {dep}
                                <button onClick={() => handleRemoveFromList(index)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Excluir</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleSaveAll} style={{ marginTop: '20px' }}>Cadastrar Todos</button>
          </div>
        </div>

        <div className="container">
          {loading ? (
            <span>Carregando setores...</span>
          ) : setores.length === 0 ? (
            <span>Nenhum setor cadastrado.</span>
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
                      <button 
                        className="action" 
                        style={{ backgroundColor: '#FD441B' }} 
                        onClick={() => handleDelete(item.id)}
                      >
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
