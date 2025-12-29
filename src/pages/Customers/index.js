import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import Title from "../../components/Title";
import { db } from "../../services/firebaseConnection";
import { 
  addDoc, 
  collection, 
  doc, 
  updateDoc, 
  writeBatch, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore"; // Importação das ferramentas de sincronização

export default function Customers() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');

  // Função original para cadastrar novo cliente
  const handleRegister = async (e) => {
    e.preventDefault();

    if (nome !== '' && cnpj !== '' && endereco !== '') {
      await addDoc(collection(db, 'customers'), {
        nomeEmpresa: nome,
        cnpj: cnpj,
        endereço: endereco,
      })
      .then(() => {
        setNome('');
        setCnpj('');
        setEndereco('');
        toast.success('Cliente Cadastrado com sucesso');
      })
      .catch((error) => {
        console.log(error);
        toast.error('Erro ao cadastrar');
      });
    } else {
      toast.info('Complete todos os campos!');
    }
  }

  /**
   * MELHORIA: Sincronização de Dados (Desnormalização)
   * Esta função deve ser chamada em um cenário de EDIÇÃO de cliente.
   * Ela utiliza writeBatch para garantir que a atualização seja atômica (tudo ou nada).
   */
  async function handleUpdateCustomer(id, novoNome, novoCnpj, novoEndereco) {
    const batch = writeBatch(db); // Inicializa o lote de operações
    
    // 1. Referência do documento do cliente e preparação da atualização básica
    const customerRef = doc(db, "customers", id);
    batch.update(customerRef, { 
      nomeEmpresa: novoNome,
      cnpj: novoCnpj,
      endereço: novoEndereco
    });

    // 2. Busca todos os chamados vinculados a este cliente (clienteId)
    // Isso resolve o problema do nome da empresa ficar desatualizado nos chamados antigos
    const chamadosRef = collection(db, "chamados");
    const q = query(chamadosRef, where("clienteId", "==", id));
    
    try {
      const snapshot = await getDocs(q);

      snapshot.forEach((docItem) => {
        const chamadoRef = doc(db, "chamados", docItem.id);
        // Adiciona a atualização do nome do cliente no lote para cada chamado encontrado
        batch.update(chamadoRef, { cliente: novoNome });
      });

      // 3. Executa todas as operações (Update do cliente + Updates dos chamados) simultaneamente
      await batch.commit();
      toast.success("Cliente e chamados sincronizados com sucesso!");
    } catch (error) {
      console.log("Erro ao sincronizar:", error);
      toast.error("Erro ao atualizar dados vinculados.");
    }
  }

  return (
    <div>
      <Header />
    
      <div className="content">
        <Title name='Clientes'>
          <FiUser size={25} />
        </Title>
      
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
          
            <label>Nome do Cliente</label>
            <input 
              type='text'
              placeholder="Nome da Empresa" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label>CNPJ</label>
            <input 
              type='text' 
              placeholder="Digite o CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />

            <label>Endereço</label>
            <input 
              type='text' 
              placeholder="Endereço da Empresa"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <button type="submit">Salvar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
