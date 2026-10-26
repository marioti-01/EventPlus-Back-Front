import { useCallback, useEffect, useState, type FormEvent } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import type { TipoEvento as TipoEventoModel } from "../../types/api";
import ilustracao from "../../assets/visao-img.png";
import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import "./TipoEvento.css";

export default function TipoEvento() {
  const [tipos, setTipos] = useState<TipoEventoModel[]>([]);
  const [titulo, setTitulo] = useState("");
  const [edicao, setEdicao] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<TipoEventoModel | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try { setTipos(await tipoEventoService.listar()); }
    catch (error) { setMensagem(getApiErrorMessage(error)); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  function limpar() { setTitulo(""); setEdicao(null); }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nome = titulo.trim();
    if (!nome) return;
    setEnviando(true); setMensagem("");
    try {
      if (edicao) await tipoEventoService.atualizar(edicao, nome);
      else await tipoEventoService.cadastrar(nome);
      limpar(); await carregar();
    } catch (error) { setMensagem(getApiErrorMessage(error)); }
    finally { setEnviando(false); }
  }

  async function excluir() {
    if (!selecionado) return;
    setEnviando(true);
    try { await tipoEventoService.excluir(selecionado.idTipoEvento); setSelecionado(null); await carregar(); }
    catch (error) { setMensagem(getApiErrorMessage(error)); setSelecionado(null); }
    finally { setEnviando(false); }
  }

  return <div className="tipo-evento-page">
    <Header />
    <main className="tipo-evento-main">
      <section className="tipo-evento-cadastro">
        <h1 className="tipo-evento-titulo-secao">ADMINISTRAÇÃO TIPO DE EVENTOS</h1>
        <div className="tipo-evento-conteudo">
          <img className="tipo-evento-ilustracao" src={ilustracao} alt="Ilustração de administração de conteúdo" />
          <form className="tipo-evento-form" onSubmit={salvar}>
            <label htmlFor="tipo-evento-titulo">Título</label>
            <input id="tipo-evento-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" required maxLength={80} />
            <div className="tipo-evento-acoes-form">
              <button type="submit" disabled={enviando}>{enviando ? "Salvando..." : edicao ? "Salvar alterações" : "Cadastrar"}</button>
              {edicao && <button className="tipo-evento-cancelar" type="button" onClick={limpar}>Cancelar</button>}
            </div>
          </form>
        </div>
        {mensagem && <p className="tipo-evento-mensagem" role="alert">{mensagem}</p>}
      </section>
      <section className="tipo-evento-lista">
        <h2 className="tipo-evento-titulo-secao">LISTA TIPO DE EVENTOS</h2>
        <div className="tipo-evento-tabela-wrap">
          <table className="tipo-evento-tabela">
            <thead><tr><th>Título</th><th>Editar</th><th>Deletar</th></tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={3} className="tipo-evento-vazio">Carregando tipos de evento...</td></tr> : tipos.length === 0 ? <tr><td colSpan={3} className="tipo-evento-vazio">Nenhum tipo de evento cadastrado.</td></tr> : tipos.map(tipo => <tr key={tipo.idTipoEvento}>
                <td>{tipo.titulo}</td>
                <td className="tipo-evento-icone"><button aria-label={`Editar ${tipo.titulo}`} onClick={() => { setEdicao(tipo.idTipoEvento); setTitulo(tipo.titulo); setMensagem(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><img src={lapis} alt="" /></button></td>
                <td className="tipo-evento-icone"><button aria-label={`Excluir ${tipo.titulo}`} onClick={() => setSelecionado(tipo)}><img src={lixeira} alt="" /></button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </main>
    <Footer />
    {selecionado && <ModalConfirmacao show={true} titulo="Excluir tipo de evento" mensagem={`Deseja excluir o tipo de evento "${selecionado.titulo}"?`} onConfirm={excluir} onClose={() => setSelecionado(null)} />}
  </div>;
}