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

function buscarDados() {
    document.querySelector(".tabela").classList.add("oculto");
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
            montarTabela(resposta)
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

    document.querySelector(".tabela").classList.remove("oculto");
    document.getElementById("loading").classList.add("oculto");

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