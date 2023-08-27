const modal = new bootstrap.Modal('#aviso', {
    // modal para erros.
    keyboard: false
})
document.getElementById("aviso").addEventListener('hidden.bs.modal', evento => {
    // Aqui vai ocultar o botão de loading
    document.getElementById("loading").classList.add("oculto")
})
window.addEventListener("load", buscarDados())

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

        let linha = `<tr> 
                        <td>${usuario.id}</td>
                        <td>${usuario.nome + " " + usuario.sobrenome} </td>
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