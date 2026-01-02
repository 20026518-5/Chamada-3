import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch, query, where } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus, FiList, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para edição
  const [editandoId, setEditandoId] = useState(null); // ID do departamento sendo editado
  const [novoNomeDep, setNovoNomeDep] = useState('');
  const [editandoSec, setEditandoSec] = useState(null); // Nome da secretaria sendo editada
  const [novoNomeSec, setNovoNomeSec] = useState('');

  useEffect(() => {
    loadSetores();
  }, []);

  async function loadSetores() {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'setores'));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setSetores(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToList(e) {
    e.preventDefault();
    if (departamentoInput === '') return toast.warning("Digite o departamento!");
    setListaDepartamentos([...listaDepartamentos, departamentoInput]);
    setDepartamentoInput('');
  }

  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) return toast.warning("Preencha os campos!");
    try {
      const promises = listaDepartamentos.map(dep => 
        addDoc(collection(db, 'setores'), { secretaria: secretaria.trim(), departamento: dep.trim() })
      );
      await Promise.all(promises);
      toast.success("Cadastrado!");
      setSecretaria('');
      setListaDepartamentos([]);
      loadSetores();
    } catch (error) { toast.error("Erro ao salvar."); }
  }

  // --- FUNÇÕES DE EDIÇÃO E EXCLUSÃO ---

  async function handleDeleteDep(id) {
    try {
      await deleteDoc(doc(db, 'setores', id));
      setSetores(setores.filter(item => item.id !== id));
      toast.success("Departamento excluído!");
    } catch (error) { toast.error("Erro ao excluir."); }
  }

  async function handleDeleteSec(nomeSec) {
    if(!window.confirm(`Excluir a secretaria "${nomeSec}" e TODOS os seus departamentos?`)) return;
    try {
      const batch = writeBatch(db);
      const itensParaDeletar = setores.filter(s => s.secretaria === nomeSec);
      itensParaDeletar.forEach(item => batch.delete(doc(db, 'setores', item.id)));
      await batch.commit();
      toast.success("Secretaria removida!");
      loadSetores();
    } catch (error) { toast.error("Erro ao excluir secretaria."); }
  }

  async function handleUpdateDep(id) {
    if(novoNomeDep === '') return setEditandoId(null);
    try {
      await updateDoc(doc(db, 'setores', id), { departamento: novoNomeDep });
      toast.success("Departamento atualizado!");
      setEditandoId(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar."); }
  }

  async function handleUpdateSec(antigoNome) {
    if(novoNomeSec === '' || novoNomeSec === antigoNome) return setEditandoSec(null);
    try {
      const batch = writeBatch(db);
      const itensParaAtualizar = setores.filter(s => s.secretaria === antigoNome);
      itensParaAtualizar.forEach(item => batch.update(doc(db, 'setores', item.id), { secretaria: novoNomeSec }));
      await batch.commit();
      toast.success("Nome da secretaria atualizado!");
      setEditandoSec(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar secretaria."); }
  }

  const setoresAgrupados = setores.reduce((acc, item) => {
    if (!acc[item.secretaria]) acc[item.secretaria] = [];
    acc[item.secretaria].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores"><FiSettings size={25} /></Title>

        {/* Formulário de Cadastro permanece similar */}
        <div className="container">
          <div className="form-profile">
            <label>Nova Unidade (Secretaria/Autarquia)</label>
            <input type="text" value={secretaria} onChange={(e) => setSecretaria(e.target.value)} />
            <div style={{ marginTop: '15px' }}>
                <label>Adicionar Departamentos</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={departamentoInput} onChange={(e) => setDepartamentoInput(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                    <button onClick={handleAddToList} style={{ width: '50px', height: '43px', backgroundColor: '#181c2e' }}><FiPlus size={20} color="#FFF" /></button>
                </div>
            </div>
            {listaDepartamentos.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#EEE', borderRadius: '5px' }}>
                    {listaDepartamentos.map((dep, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px' }}>
                            <span>{dep}</span>
                            <button onClick={() => setListaDepartamentos(listaDepartamentos.filter((_, idx) => idx !== i))} style={{ color: 'red', border: 0, background: 'none' }}>Remover</button>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={handleSaveAll} style={{ marginTop: '20px', backgroundColor: '#1fcc44' }}>Cadastrar Unidade</button>
          </div>
        </div>

        {/* LISTAGEM COM OPÇÕES DE ALTERAR/DELETAR */}
        <div className="container">
          <Title name="Lista de Unidades"><FiList size={22} /></Title>
          {loading ? <span>Carregando...</span> : Object.keys(setoresAgrupados).map((nomeSec) => (
            <div key={nomeSec} style={{ marginBottom: '30px', background: '#FFF', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #181c2e', paddingBottom: '10px', marginBottom: '15px' }}>
                {editandoSec === nomeSec ? (
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <input type="text" value={novoNomeSec} onChange={(e) => setNovoNomeSec(e.target.value)} style={{ marginBottom: 0 }} />
                    <button onClick={() => handleUpdateSec(nomeSec)} style={{ background: 'green', border: 0, padding: '5px', borderRadius: '4px' }}><FiCheck color="#FFF" /></button>
                    <button onClick={() => setEditandoSec(null)} style={{ background: 'gray', border: 0, padding: '5px', borderRadius: '4px' }}><FiX color="#FFF" /></button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: 0 }}>{nomeSec}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setEditandoSec(nomeSec); setNovoNomeSec(nomeSec); }} style={{ background: 'none', border: 0, cursor: 'pointer' }}><FiEdit2 size={18} color="#181c2e" /></button>
                      <button onClick={() => handleDeleteSec(nomeSec)} style={{ background: 'none', border: 0, cursor: 'pointer' }}><FiTrash2 size={18} color="#FD441B" /></button>
                    </div>
                  </>
                )}
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th scope="col">Departamento</th>
                    <th scope="col" style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {setoresAgrupados[nomeSec].map((item) => (
                    <tr key={item.id}>
                      <td data-label="Departamento">
                        {editandoId === item.id ? (
                          <input type="text" value={novoNomeDep} onChange={(e) => setNovoNomeDep(e.target.value)} style={{ marginBottom: 0, padding: '5px' }} />
                        ) : item.departamento}
                      </td>
                      <td data-label="Ações">
                        {editandoId === item.id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleUpdateDep(item.id)} className="action" style={{ backgroundColor: '#1fcc44' }}><FiCheck size={15} color="#FFF" /></button>
                            <button onClick={() => setEditandoId(null)} className="action" style={{ backgroundColor: '#CCC' }}><FiX size={15} color="#FFF" /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => { setEditandoId(item.id); setNovoNomeDep(item.departamento); }} className="action" style={{ backgroundColor: '#F6A935' }}><FiEdit2 size={15} color="#FFF" /></button>
                            <button onClick={() => handleDeleteDep(item.id)} className="action" style={{ backgroundColor: '#FD441B' }}><FiTrash2 size={15} color="#FFF" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
