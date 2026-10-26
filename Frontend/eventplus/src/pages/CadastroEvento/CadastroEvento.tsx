import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Header from "../../components/header/Header";
import {
    eventoService,
    instituicaoService,
    tipoEventoService,
} from "../../services/eventPlusservice";
import type { Evento, Instituicao, TipoEvento } from "../../types/api";
import "./CadastroEvento.css";

interface FormularioEvento {
    nome: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
    arquivoImagem: File | null;
}

const inicial: FormularioEvento = {
    nome: "",
    dataEvento: "",
    descricao: "",
    idTipoEvento: "",
    idInstituicao: "",
    arquivoImagem: null,
};

function CadastroEvento() {
    const fotoInputRef = useRef<HTMLInputElement>(null);
    const [formulario, setFormulario] = useState<FormularioEvento>(inicial);
    const [tipos, setTipos] = useState<TipoEvento[]>([]);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        try {
            const [tiposApi, instituicoesApi, eventosApi] = await Promise.all([
                tipoEventoService.listar(),
                instituicaoService.listar(),
                eventoService.listar(),
            ]);

            setTipos(tiposApi);
            setInstituicoes(instituicoesApi);
            setEventos(eventosApi);

            setFormulario((value) => ({
                ...value,
                idTipoEvento: value.idTipoEvento || tiposApi[0]?.idTipoEvento || "",
                idInstituicao: value.idInstituicao || instituicoesApi[0]?.idInstituicao || "",
            }));
        } catch (erro) {
            console.error(erro);
            setMensagem("Não foi possível carregar os dados.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    function alterarCampo(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setFormulario((atual) => ({ ...atual, [name]: value }));
    }

    function alterarImagem(e: ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0] ?? null;
        setFormulario((atual) => ({ ...atual, arquivoImagem: arquivo }));
    }

    function limpar() {
        setFormulario({
            ...inicial,
            idTipoEvento: tipos[0]?.idTipoEvento || "",
            idInstituicao: instituicoes[0]?.idInstituicao || "",
        });
        setIdEmEdicao(null);
        if (fotoInputRef.current) {
            fotoInputRef.current.value = "";
        }
    }

    async function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setEnviando(true);
        setMensagem("");

        try {
            const dados = new FormData();
            dados.append("Nome", formulario.nome);
            dados.append("DataEvento", formulario.dataEvento);
            dados.append("Descricao", formulario.descricao);
            dados.append("IdTipoEvento", formulario.idTipoEvento);
            dados.append("IdInstituicao", formulario.idInstituicao);
            if (formulario.arquivoImagem) {
                dados.append("Arquivo", formulario.arquivoImagem);
            }

            if (idEmEdicao) {
                await eventoService.atualizar(idEmEdicao, dados);
                setMensagem("Evento atualizado com sucesso!");
            } else {
                await eventoService.cadastrar(dados);
                setMensagem("Evento cadastrado com sucesso!");
            }

            limpar();
            await carregar();
        } catch (erro) {
            console.error(erro);
            setMensagem("Não foi possível salvar o evento.");
        } finally {
            setEnviando(false);
        }
    }

    function editar(evento: Evento) {
    setIdEmEdicao(evento.idEvento);
    setFormulario({
        nome: evento.nome,
        dataEvento: evento.dataEvento?.slice(0, 16) ?? "",
        descricao: evento.descricao,
        idTipoEvento: evento.idTipoEvento ?? "",
        idInstituicao: evento.idInstituicao ?? "",
        arquivoImagem: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

    async function excluir(id: string) {
        if (!window.confirm("Deseja realmente excluir este evento?")) return;
        try {
            await eventoService.excluir(id);
            setMensagem("Evento excluído.");
            await carregar();
        } catch (erro) {
            console.error(erro);
            setMensagem("Não foi possível excluir o evento.");
        }
    }

    return (
        <>
            <Header />
            <main className="cadastro-evento">
                <h1>{idEmEdicao ? "Editar evento" : "Cadastrar evento"}</h1>

                {mensagem && <p className="mensagem">{mensagem}</p>}

                <form onSubmit={enviar}>
                    <label>
                        Nome
                        <input
                            type="text"
                            name="nome"
                            value={formulario.nome}
                            onChange={alterarCampo}
                            maxLength={100}
                            required
                        />
                    </label>

                    <label>
                        Data do evento
                        <input
                            type="datetime-local"
                            name="dataEvento"
                            value={formulario.dataEvento}
                            onChange={alterarCampo}
                            required
                        />
                    </label>

                    <label>
                        Descrição
                        <textarea
                            name="descricao"
                            value={formulario.descricao}
                            onChange={alterarCampo}
                            required
                        />
                    </label>

                    <label>
                        Tipo de evento
                        <select
                            name="idTipoEvento"
                            value={formulario.idTipoEvento}
                            onChange={alterarCampo}
                            required
                        >
                            {tipos.map((t) => (
                                <option key={t.idTipoEvento} value={t.idTipoEvento}>
                                    {t.titulo}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Instituição
                        <select
                            name="idInstituicao"
                            value={formulario.idInstituicao}
                            onChange={alterarCampo}
                            required
                        >
                            {instituicoes.map((i) => (
                                <option key={i.idInstituicao} value={i.idInstituicao}>
                                    {i.nomeFantasia}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Imagem
                        <input
                            type="file"
                            accept="image/*"
                            ref={fotoInputRef}
                            onChange={alterarImagem}
                        />
                    </label>

                    <div className="botoes">
                        <button type="submit" disabled={enviando}>
                            {enviando ? "Salvando..." : idEmEdicao ? "Atualizar" : "Cadastrar"}
                        </button>
                        {idEmEdicao && (
                            <button type="button" onClick={limpar}>
                                Cancelar edição
                            </button>
                        )}
                    </div>
                </form>

                <h2>Eventos cadastrados</h2>
                {carregando ? (
                    <p>Carregando...</p>
                ) : eventos.length === 0 ? (
                    <p>Nenhum evento cadastrado.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.map((ev) => (
                                <tr key={ev.idEvento}>
                                    <td>{ev.nome}</td>
                                    <td>{new Date(ev.dataEvento).toLocaleString("pt-BR")}</td>
                                    <td>
                                        <button type="button" onClick={() => editar(ev)}>
                                            Editar
                                        </button>
                                        <button type="button" onClick={() => excluir(ev.idEvento)}>
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </>
    );
}

export default CadastroEvento;