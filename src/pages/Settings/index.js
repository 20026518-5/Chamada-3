import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
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

  function handleAddToList(e) {
    e.preventDefault();
    if (departamentoInput === '') {
      toast.warning("Digite o nome do departamento!");
      return;
    }
    setListaDepartamentos([...listaDepartamentos, departamentoInput]);
    setDepartamentoInput('');
  }

  function handleRemoveFromList(index) {
    let novaLista = listaDepartamentos.filter((_, i) => i !== index);
    setListaDepartamentos(novaLista);
  }

  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione ao menos um departamento!");
      return;
    }

    try {
      const promises = listaDepartamentos.map(dep => {
        return addDoc(collection(db, 'setores'), {
          secretaria: secretaria.trim(),
          departamento: dep.trim()
        });
      });

      await Promise.all(promises);
      toast.success("Secretaria e departamentos cadastrados!");
      setSecretaria('');
      setListaDepartamentos([]);
      
      // Recarrega os dados para atualizar a lista abaixo
      const querySnapshot = await getDocs(collection(db, 'setores'));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setSetores(lista);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar no banco de dados.");
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

  // Agrupa os setores por secretaria para exibição organizada
  const setoresAgrupados = setores.reduce((acc, item) => {
    if (!acc[item.secretaria]) {
      acc[item.secretaria] = [];
    }
    acc[item.secretaria].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores">
          <FiSettings size={25} />
        </Title>

        <div className="container">
          <div className="form-profile">
            {/* Organização das Labels e Inputs */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #DDD', paddingBottom: '20px' }}>
                <label>Nome da Secretaria</label>
                <input 
                  type="text" 
                  value={secretaria} 
                  onChange={(e) => setSecretaria(e.target.value)} 
                  placeholder="Ex: Secretaria de Saúde" 
                />

                <div style={{ marginTop: '15px' }}>
                    <label>Departamentos desta Secretaria</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          value={departamentoInput} 
                          onChange={(e) => setDepartamentoInput(e.target.value)} 
                          placeholder="Adicionar um departamento por vez" 
                          style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button onClick={handleAddToList} style={{ width: '50px', height: '43px', backgroundColor: '#181c2e' }}>
                            <FiPlus size={20} color="#FFF" />
                        </button>
                    </div>
                </div>

                {/* Lista de espera visual antes de salvar */}
                {listaDepartamentos.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#EEE', borderRadius: '5px' }}>
                        <ul style={{ listStyle: 'none' }}>
                            {listaDepartamentos.map((dep, index) => (
                                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                    <span><strong>+</strong> {dep}</span>
                                    <button onClick={() => handleRemoveFromList(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remover</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button onClick={handleSaveAll} style={{ marginTop: '20px', backgroundColor: '#1fcc44' }}>
                    Salvar Secretaria Completa
                </button>
            </div>
          </div>
        </div>

        {/* Listagem por Secretaria e seus Departamentos */}
        <div className="container">
          <Title name="Secretarias Cadastradas">
            <FiList size={22} />
          </Title>

          {loading ? (
            <span>Carregando setores...</span>
          ) : Object.keys(setoresAgrupados).length === 0 ? (
            <span>Nenhuma secretaria encontrada.</span>
          ) : (
            Object.keys(setoresAgrupados).map((nomeSec) => (
              <div key={nomeSec} style={{ marginBottom: '25px', background: '#f8f8f8', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#181c2e', marginBottom: '10px', textTransform: 'uppercase', borderBottom: '2px solid #181c2e', display: 'inline-block' }}>
                    {nomeSec}
                </h3>
                
                <table style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th scope="col">Departamento</th>
                      <th scope="col" style={{ width: '100px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setoresAgrupados[nomeSec].map((item) => (
                      <tr key={item.id}>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
