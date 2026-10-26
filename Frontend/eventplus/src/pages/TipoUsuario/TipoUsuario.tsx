import { useCallback, useEffect, useState, type FormEvent } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { tipoUsuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import ilustracaoUsuario from "../../assets/tela_tipoUsuario.svg";
import type { TipoUsuario as TipoUsuarioModel } from "../../types/api";
import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import "./TipoUsuario.css";

export default function TipoUsuario() {
  const [tipos, setTipos] = useState<TipoUsuarioModel[]>([]);
  const [titulo, setTitulo] = useState("");
  const [edicao, setEdicao] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<TipoUsuarioModel | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setTipos(await tipoUsuarioService.listar());
    } catch (error) {
      setMensagem(getApiErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  function limpar() {
    setTitulo("");
    setEdicao(null);
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nome = titulo.trim();
    if (!nome) return;
    setEnviando(true);
    setMensagem("");
    try {
      if (edicao) await tipoUsuarioService.atualizar(edicao, nome);
      else await tipoUsuarioService.cadastrar(nome);
      limpar();
      await carregar();
    } catch (error) {
      setMensagem(getApiErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }
  async function excluir() {
    if (!selecionado) return;
    setEnviando(true);
    try {
      await tipoUsuarioService.excluir(selecionado.idTipoUsuario);
      setSelecionado(null);
      await carregar();
    } catch (error) {
      setMensagem(getApiErrorMessage(error));
      setSelecionado(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tipo-evento-page">
      <Header />
      <main className="tipo-evento-main">
        <section className="tipo-evento-cadastro">
          <h1 className="tipo-evento-titulo-secao">
            ADMINISTRAÇÃO DE TIPOS DE USUÁRIO
          </h1>
          <div className="tipo-evento-conteudo">
            <div className="tipo-usuario-ilustracao">
              <img
                src={ilustracaoUsuario}
                alt="Ilustração de cadastro de usuário"
              />
            </div>
            <form className="tipo-evento-form" onSubmit={salvar}>
              <label htmlFor="titulo-tipo-usuario">Título</label>
              <input
                id="titulo-tipo-usuario"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Administrador"
                required
                maxLength={80}
              />
              <div className="tipo-evento-acoes-form">
                <button type="submit" disabled={enviando}>
                  {enviando
                    ? "Salvando..."
                    : edicao
                      ? "Salvar alterações"
                      : "Cadastrar"}
                </button>
                {edicao && (
                  <button
                    type="button"
                    className="tipo-evento-cancelar"
                    onClick={limpar}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
          {mensagem && (
            <p className="tipo-evento-mensagem" role="alert">
              {mensagem}
            </p>
          )}
        </section>
        <section className="tipo-evento-lista">
          <h2 className="tipo-evento-titulo-secao">
            LISTA DE TIPOS DE USUÁRIO
          </h2>
          <div className="tipo-evento-tabela-wrap">
            <table className="tipo-evento-tabela">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Editar</th>
                  <th>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={3} className="tipo-evento-vazio">
                      Carregando...
                    </td>
                  </tr>
                ) : tipos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="tipo-evento-vazio">
                      Nenhum tipo de usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  tipos.map((tipo) => (
                    <tr key={tipo.idTipoUsuario}>
                      <td>{tipo.titulo}</td>
                      <td className="tipo-evento-icone">
                        <button
                          type="button"
                          aria-label={`Editar ${tipo.titulo}`}
                          onClick={() => {
                            setTitulo(tipo.titulo);
                            setEdicao(tipo.idTipoUsuario);
                          }}
                        >
                          <img src={lapis} alt="" />
                        </button>
                      </td>
                      <td className="tipo-evento-icone">
                        <button
                          type="button"
                          aria-label={`Excluir ${tipo.titulo}`}
                          onClick={() => setSelecionado(tipo)}
                        >
                          <img src={lixeira} alt="" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
      {selecionado && (
        <ModalConfirmacao
          show={!!selecionado}
          titulo="Excluir tipo de usuário"
          mensagem={`Deseja excluir o tipo de usuário "${selecionado.titulo}"?`}
          onClose={() => setSelecionado(null)}
          onConfirm={() => void excluir()}
        />
      )}
    </div>
  );
}