import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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

  // Estados de Edição
  const [editandoId, setEditandoId] = useState(null);
  const [novoNomeDep, setNovoNomeDep] = useState('');
  const [editandoSec, setEditandoSec] = useState(null);
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

  // Estilo padrão para células de texto para evitar sobreposição
  const cellTextStyle = {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    padding: '10px'
  };

  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione departamentos!");
      return;
    }
    try {
      const promises = listaDepartamentos.map(dep => 
        addDoc(collection(db, 'setores'), { 
          secretaria: secretaria.trim(), 
          departamento: dep.trim() 
        })
      );
      await Promise.all(promises);
      toast.success("Unidade cadastrada!");
      setSecretaria('');
      setListaDepartamentos([]);
      loadSetores();
    } catch (error) { toast.error("Erro ao salvar."); }
  }

  async function handleDeleteSec(nomeSec) {
    if(!window.confirm(`Excluir a secretaria "${nomeSec}" e TODOS os seus departamentos?`)) return;
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === nomeSec);
      itens.forEach(item => batch.delete(doc(db, 'setores', item.id)));
      await batch.commit();
      toast.success("Secretaria excluída!");
      loadSetores();
    } catch (error) { toast.error("Erro ao excluir."); }
  }

  async function handleUpdateSec(antigoNome) {
    if(novoNomeSec === '' || novoNomeSec === antigoNome) {
      setEditandoSec(null);
      return;
    }
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === antigoNome);
      itens.forEach(item => batch.update(doc(db, 'setores', item.id), { secretaria: novoNomeSec }));
      await batch.commit();
      toast.success("Secretaria atualizada!");
      setEditandoSec(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar."); }
  }

  async function handleUpdateDep(id) {
    if(novoNomeDep === '') return;
    try {
      await updateDoc(doc(db, 'setores', id), { departamento: novoNomeDep });
      toast.success("Departamento atualizado!");
      setEditandoId(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar."); }
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

        <div className="container">
          <div className="form-profile">
            <label>Secretaria ou Autarquia</label>
            <input type="text" value={secretaria} onChange={(e) => setSecretaria(e.target.value)} placeholder="Ex: Secretaria de Saúde" />
            
            <div style={{ marginTop: '15px' }}>
              <label>Novo Departamento</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={departamentoInput} onChange={(e) => setDepartamentoInput(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                <button onClick={(e) => { e.preventDefault(); setListaDepartamentos([...listaDepartamentos, departamentoInput]); setDepartamentoInput(''); }} style={{ width: '50px', height: '43px', backgroundColor: '#181c2e' }}>
                  <FiPlus size={20} color="#FFF" />
                </button>
              </div>
            </div>
            
            <button onClick={handleSaveAll} style={{ marginTop: '20px', backgroundColor: '#1fcc44' }}>Salvar Unidade Completa</button>
          </div>
        </div>

        <div className="container">
          <Title name="Lista de Unidades"><FiList size={22} /></Title>
          {loading ? <span>Carregando...</span> : Object.keys(setoresAgrupados).map((nomeSec) => (
            <div key={nomeSec} style={{ marginBottom: '40px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
              
              {/* Cabeçalho da Secretaria com Opção de Editar/Excluir */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #181c2e', paddingBottom: '10px', marginBottom: '15px' }}>
                {editandoSec === nomeSec ? (
                  <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                    <input type="text" value={novoNomeSec} onChange={(e) => setNovoNomeSec(e.target.value)} style={{ marginBottom: 0 }} />
                    <button onClick={() => handleUpdateSec(nomeSec)} style={{ background: '#1fcc44', border: 0, padding: '8px', borderRadius: '4px' }}><FiCheck color="#FFF" /></button>
                    <button onClick={() => setEditandoSec(null)} style={{ background: '#999', border: 0, padding: '8px', borderRadius: '4px' }}><FiX color="#FFF" /></button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: 0, ...cellTextStyle }}>{nomeSec}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <FiEdit2 size={18} color="#181c2e" cursor="pointer" onClick={() => { setEditandoSec(nomeSec); setNovoNomeSec(nomeSec); }} />
                      <FiTrash2 size={18} color="#FD441B" cursor="pointer" onClick={() => handleDeleteSec(nomeSec)} />
                    </div>
                  </>
                )}
              </div>

              {/* Tabela de Departamentos */}
              <table style={{ tableLayout: 'auto', width: '100%' }}>
                <thead>
                  <tr>
                    <th scope="col">Departamento</th>
                    <th scope="col" style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {setoresAgrupados[nomeSec].map((item) => (
                    <tr key={item.id}>
                      <td data-label="Departamento" style={cellTextStyle}>
                        {editandoId === item.id ? (
                          <input type="text" value={novoNomeDep} onChange={(e) => setNovoNomeDep(e.target.value)} style={{ marginBottom: 0 }} />
                        ) : item.departamento}
                      </td>
                      <td data-label="Ações">
                        {editandoId === item.id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleUpdateDep(item.id)} className="action" style={{ backgroundColor: '#1fcc44' }}><FiCheck size={15} color="#FFF" /></button>
                            <button onClick={() => setEditandoId(null)} className="action" style={{ backgroundColor: '#999' }}><FiX size={15} color="#FFF" /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => { setEditandoId(item.id); setNovoNomeDep(item.departamento); }} className="action" style={{ backgroundColor: '#F6A935' }}><FiEdit2 size={15} color="#FFF" /></button>
                            <button onClick={() => deleteDoc(doc(db, 'setores', item.id)).then(() => loadSetores())} className="action" style={{ backgroundColor: '#FD441B' }}><FiTrash2 size={15} color="#FFF" /></button>
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
