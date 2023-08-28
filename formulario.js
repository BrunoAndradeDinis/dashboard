// classes de validação de input do bootstrap: is-valid e is-invalid

const modal = new bootstrap.Modal('#aviso', {
    // modal para erros.
    keyboard: false
})
const modalSucesso = new bootstrap.Modal('#sucesso', {
    // modal para sucesso.
    keyboard: false
})

document.getElementById("sucesso").addEventListener('hidden.bs.modal', evento => {
    // Aqui vai ocultar o botão de loading
    window.location.href = "./index.html" // Aqui ele vai direcionar após a criação de usuário o cliente para a página inicial.
})

var usuario = null

window.addEventListener("load", ()=> {
    let id = new URLSearchParams(window.location.search).get("id")

    if(!id) return

    fetch("https://api-curso-programacao-web.vercel.app/api/usuarios/"+id, {
            // deste modo estamos usando o método GET, e como  é necessário login e senha através de uma authentication, passamos as informações através do headers, onde passa as configurações de nossa API. 
            headers: {
                "Authorization": "Basic " + btoa("admin:admin") // com o método btoa ele vai ser usado para codificar uma string no formato base-64
            }
        })
        .then(resposta => resposta.json()) // Aqui após a solicitação HTTP, ele transforma a informação em .json para conseguirmos realizar a manipulação em javascript
        .then(resposta => {
            console.log(resposta)
            usuario = resposta
        })
        .catch(error => {
            console.log(error.message)
            modal.show() // aqui mostramos o modal de erro com o bootstrap
        })
})

document.querySelector("#cep").addEventListener("input", evento => {
    document.getElementById("loadingCep").classList.remove("oculto") // Para aparecer o loading enquando carrega os dados passado para a API
    let value = evento.target.value // aqui pega o dado passado para o input do id cep

    if (value.length != 8) { // aqui valida se o mesmo tem 8 caracteres
        limpaEndereco()
        return
    }

    console.log(value)

    fetch(`https://viacep.com.br/ws/${value}/json/`) // Usando a API viacep
        .then(resposta => resposta.json()) // transformando o retorno em objeto para manipulação de array
        .then(resposta => {
            console.log(resposta)
            if (resposta.erro) throw new Error("Erro na requisição") // validando se o cep existe
            else preencheEndereco(resposta)

        })
        .catch(error => console.log(error.message))


})

function preencheEndereco(endereco) {

    document.getElementById("loadingCep").classList.add("oculto") // Para não aparecer o loading enquando carrega os dados passado para a API
    document.getElementById("cep").classList.add("is-valid")
    document.getElementById("cep").classList.remove("is-invalid")
    // Adicionando os valores nos campos de endereço através do retorno de dados da viacep
    document.getElementById("endereco").value = endereco.logradouro
    document.getElementById("bairro").value = endereco.bairro
    document.getElementById("cidade").value = endereco.localidade
    document.getElementById("estado").value = endereco.uf
}

function limpaEndereco() {
    document.getElementById("loadingCep").classList.add("oculto") // Para não aparecer o loading enquando carrega os dados passado para a API
    document.getElementById("cep").classList.remove("is-valid")
    document.getElementById("cep").classList.add("is-invalid")
    // limpando os campos de endereço 
    document.getElementById("endereco").value = ""
    document.getElementById("bairro").value = ""
    document.getElementById("cidade").value = ""
    document.getElementById("estado").value = ""
}

document.querySelector("form").addEventListener("submit", evento => {
    evento.preventDefault() // tirando o compartamento padrão enviado pelo submit após o click

    let respostas = {}
    let campos = ["nome", "sobrenome", "email", "data_nascimento", "ddd", "telefone", "cep", "endereco", "bairro", "cidade", "estado"]

    campos.forEach(campo => {
        let input = document.querySelector(`#${campo}`) // Aqui todo "campo" que ele chegar no forEach vai acessar o ID relacionado ao campo

        if (!input.value) input.classList.add("is-invalid") // Se o input for null vai adicionar a classe invalido
        else { // caso não seja, vai remover o inválido, adicionar o válido e adicionar o valor no nosso array de respostas na posição do campo.
            input.classList.remove("is-invalid")
            input.classList.add("is-valid")
            respostas[campo] = input.value
        }
    })

    if (document.querySelector(".is-invalid")) return // caso mesmo após tudo preenchido ainda tenha um campo inválido vai retornar para ser re-preenchido.

    console.log(respostas) // após tudo preenchido, vai imprimir o arry com todas as respostas preenchidas.

    let camposNumero = ["ddd", "telefone", "cep"] // os campos que devem ser do tipo Number
    camposNumero.forEach(campo => respostas[campo] = Number(respostas[campo])) // Transformando eles em tipo Number

    console.log(respostas)

    fetch('https://api-curso-programacao-web.vercel.app/api/usuarios', { // Realizado o POST através da API
            headers: {
                "Authorization": "Basic " + btoa("admin:admin")
            },
            method: 'POST', // Declarando o método 'POST
            body: JSON.stringify(respostas) // Transformando no body nosso objeto/array em string para o envido direto a API, para não retornar um status não esperado
        })
        .then(resposta => {
            console.log(resposta)
            if (resposta.ok && resposta.status === 201) { // comparando nossa resposta como ok e o status igual a 201 "Operação realizada com sucesso"
                modalSucesso.show() // mostrando o modal de sucesso ao criar o cadastro.
            } else throw new Error("Erro na requisição")
        })
        .catch(error => {
            console.log(error.message)
            modal.show() // mostrando o modal de erro ao criar o cadastro.
            return
        })
})