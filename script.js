const modal = new bootstrap.Modal('#aviso', {
    // modal para erros.
    keyboard: false
})

const modalDelete = new bootstrap.Modal('#deletar', {
    // modal para confirmar o delete/apagar.
    keyboard: false,
    backdrop: "static"
})

const modalSucesso = new bootstrap.Modal('#sucesso', {
    // modal para sucesso.
    keyboard: false
})
document.querySelector("#sucesso").addEventListener('hidden.bs.modal', buscarDados)

window.addEventListener("load", buscarDados)

var usuarios = []

function buscarDados() {
    document.querySelector(".tabela").classList.add("oculto");
    document.querySelector(".graficos").classList.add("oculto");
    document.getElementById("loading").classList.remove("oculto");

    // Com o fetch realizaremos uma solicitção http para a api  
    fetch("https://api-curso-programacao-web.vercel.app/api/usuarios", {
            // deste modo estamos usando o método GET, e como  é necessário login e senha através de uma authentication, passamos as informações através do headers, onde passa as configurações de nossa API. 
            headers: {
                "Authorization": "Basic " + btoa("admin:admin") // com o método btoa ele vai ser usado para codificar uma string no formato base-64
            }
        })
        .then(resposta => resposta.json()) // Aqui após a solicitação HTTP, ele transforma a informação em .json para conseguirmos realizar a manipulação em javascript
        .then(resposta => {
            console.log(resposta)
            usuarios = resposta
            exibirDados(resposta)
        })
        .catch(error => {
            console.log(error.message)
            modal.show() // aqui mostramos o modal de erro com o bootstrap
        })
}

function montarTabela(usuarios) {
    // com os dados transformados em objeto json faremos a tabela
    let tbody = document.querySelector("tbody")
    tbody.innerHTML = ""

    // usuarios.foreach(usuario => {
    //     let tr = document.createElement("tr")
    //     let id = document.createElement("td")

    //     id.textContent =  usuario.id
    //     tr.appendChild(id)
    //     tbody.appendChild(tr)
    // })

    usuarios.forEach(usuario => {
        // Forma usual bem boa
        // let data = new Date(usuario.data_nascimento).toLocaleDateString("pt-br", {
        //     timeZone: "Europe/London"
        // })
        // outra forma
        let data = usuario.data_nascimento.split("-").reverse().join("/")
        let telefone = `(${usuario.ddd}) ${usuario.telefone}`
        let endereco = `${usuario.endereco}, ${usuario.bairro}, ${usuario.cidade} - ${usuario.estado}, ${usuario.cep} `
        // dados para preenchimento da tabela
        let linha = `<tr>
                        <td>
                        <button type="button" class="btn btn-dark" onclick="editar(this)">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        </td>
                        <td>
                        <button type="button" class="btn btn-dark" onclick="deletar(this)">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                        </td>
                        <td class="user-id">${usuario.id}</td>
                        <td class="user-name">${usuario.nome + " " + usuario.sobrenome} </td>
                        <td>${usuario.email}</td>
                        <td>${data}</td>
                        <td>${telefone}</td>
                        <td>${endereco}</td>
        </tr> `

        tbody.innerHTML += linha

    })

    if (!tbody.innerHTML) tbody.innerHTML = `    
    <tr>
        <td colspan="8">Não há dados</td>
    </tr>`

}

function editar(button) {
    let linha = button.parentElement.parentElement // primeiro parent element pega o td e o segundo pega o tr
    let id = linha.querySelector(".user-id").textContent

    window.location.href = "./formulario.html" + `?id=${id}` // usando a url params para editar o id selecionado.
}

function deletar(button) {
    let linha = button.parentElement.parentElement // primeiro parent element pega o td e o segundo pega o tr
    let id = linha.querySelector(".user-id").textContent
    let nome = linha.querySelector(".user-name").textContent

    document.getElementById("nomeUsuario").textContent = nome
    document.getElementById("idUsuario").textContent = id

    modalDelete.show()


}

function excluir() {
    let modalDeletar = document.querySelector("#deletar")
    modalDeletar.querySelector("span").classList.remove("oculto")
    modalDeletar.querySelectorAll("button").forEach(button => button.disabled = true)

    let id = document.getElementById("idUsuario").textContent

    fetch("https://api-curso-programacao-web.vercel.app/api/usuarios/" + id, {
            // deste modo estamos usando o método GET, e como  é necessário login e senha através de uma authentication, passamos as informações através do headers, onde passa as configurações de nossa API. 
            headers: {
                "Authorization": "Basic " + btoa("admin:admin") // com o método btoa ele vai ser usado para codificar uma string no formato base-64
            },
            method: 'DELETE'
        })
        .then(resposta => {
            console.log(resposta)
            if (resposta.ok && resposta.status === 204) {
                modalDelete.hide()
                modalSucesso.show()
                modalDeletar.querySelector("span").classList.add("oculto")
                modalDeletar.querySelectorAll("button").forEach(button => button.disabled = false)
            } else throw new Error("Erro na requisição!")
        })
        .catch(error => {
            console.log(error.message)
            modalDelete.hide()
            modal.show() // aqui mostramos o modal de erro com o bootstrap
            modalDeletar.querySelector("span").classList.add("oculto")
            modalDeletar.querySelectorAll("button").forEach(button => button.disabled = false)
        })
}

function filtrar() {
    let value = document.querySelector("#filtro").value
    let expressaoRegular = new RegExp(value, "i") // colocando a flat "i" ele vai ignorar o caseSensitive para dar continuidade na busca, através de uma Regex

    // usuarios.forEach(usuario => {
    //     console.log(expressaoRegular.test(usuario.nome))
    // })

    let novoArray = usuarios.filter(usuario => {
        let nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`

        return expressaoRegular.test(nomeCompleto)
    })
    console.log(novoArray)
    exibirDados(novoArray)
}

function exibirDados(dados) {
    montarTabela(dados)

    const options = {
        width: 500,
        height: 350,
        chartArea: {
            width: "100%",
            height: "80%"
        }
    }

    const cidades = gerarDados(dados, ["Cidade", "Qtd Usuários"], "cidade")

    criarGrafico(cidades, {
        ...options,
        title: "Cidade dos usuários"
    }, "grafico-cidades", "column")

    const estados = gerarDados(dados, ["Estado", "Qtd Usuários"], "estado")

    criarGrafico(estados, {
        ...options,
        title: "Estado dos usuários"
    }, "grafico-estados", "column")

    const provedoresEmail = dados.map(dado => {
        // bruno@mail.com
        // [(bruno),(mail.com)] aqui pega a posição 1 [0,1]
        // [(mail),(com)] aqui pega a posição 0 [0,1] para ficar apenas com a informação do provedor após o @ mail @BrunoAndradeDinis
        let provedor = dado.email.split("@")[1].split(".")[0]
        return {
            provedor: provedor
        }
    })
    const emails = gerarDados(provedoresEmail, ["Email", "Qtd Usuários"], "provedor")

    criarGrafico(emails, {
        ...options,
        title: "E-mail dos usuários"
    }, "grafico-emails", "pie")

    const idadeUsuarios = dados.map(dado => {
        let idade = getIdade(dado.data_nascimento).toString()
        console.log(idade)
        return {
            idade: idade
        }
    })

    const idades = gerarDados(idadeUsuarios, ["Idade", "Qtd Usuários"], "idade")
    criarGrafico(idades, {
        ...options,
        title: "Idade dos Usuários"
    }, "grafico-idades", "pie")

    document.querySelector(".tabela").classList.remove("oculto");
    document.querySelector(".pesquisa").classList.remove("oculto");
    document.querySelector(".graficos").classList.remove("oculto");
    document.getElementById("loading").classList.add("oculto");
}

function getIdade(data) {
    let hoje = new Date().getTime()
    let nascimento = new Date(data).getTime()
    let idade = (hoje - nascimento) / (86400000 * 365.25) // 86400000 é equivalente a quantidade de milisegundos de um dia completo de 24 horas. E o 365.25 é equivalente a um ano e 6 horas .25 = 1/4 de dia que é o somatório pelos anos bi-sextos
    return Math.floor(idade)
}

google.charts.load('current', {
    'packages': ['corechart']
});

function gerarDados(usuarios, header, campo) {
    let array = [header]
    let lista = usuarios.map(usuario => usuario[campo])
    let valores = [...new Set(lista)]

    valores.forEach(valor => {
        let contagem = 0
        lista.forEach(dado => {
            if (dado == valor) contagem++
        })
        array.push([valor, contagem])
    })
    return array

}

function criarGrafico(dados, options, id, tipo) {
    let elemento = document.getElementById(id)

    if (dados.length === 1 && tipo == "column") dados.push([null, 0])

    let data = google.visualization.arrayToDataTable(dados)

    let grafico

    if (tipo == "column") grafico = new google.visualization.ColumnChart(elemento)
    else if (tipo == "pie") grafico = new google.visualization.PieChart(elemento)

    grafico.draw(data, options)
}