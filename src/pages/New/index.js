// ... (imports permanecem iguais)

export default function New(){
  const { user } = useContext(AuthContext);
  // ... (outros estados)

  // FUNÇÃO CORRIGIDA COM ASYNC
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      if(editId){
        // Atualizando chamado existente (para o Admin TI mudar status)
        const docRef = doc(db, 'chamados', id);
        await updateDoc(docRef, {
          cliente: customers[customerSelected].nomeEmpresa,
          clienteId: customers[customerSelected].id,
          assunto: assunto,
          status: status,
          complemento: complemento,
          userId: user.uid,
        });

        toast.info('Chamado atualizado com sucesso!');
        navigate('/dashboard');
        return;
      }

      // Registro de novo chamado (apenas usuário comum)
      await addDoc(collection(db, 'chamados'), {
        created: new Date(),
        cliente: customers[customerSelected].nomeEmpresa,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        status: 'Em aberto',
        complemento: complemento,
        userId: user.uid,
        userName: user.nome, // Registra quem fez
        secretaria: user.secretaria, // Vincula secretaria no chamado
        departamento: user.departamento // Vincula departamento no chamado
      });

      toast.success('Chamado registrado!');
      setComplemento('');
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar.');
    }
  }

  return (
    // ... (o return permanece igual ao seu arquivo original)
  );
}
