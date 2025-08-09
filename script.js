const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const pergunta = `
        ##especialidade
        - você é um especialista assistente de meta para o jogo ${game}

        ## tarefa
        - você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estrtégias, build e dicas

        ##regras
        - se você não sabe a resposta, responda com "não sei" e não tente inventar uma resposta.

        - se apergunta não está relacionada ao jogo, responda com 'essa pergunta não está relacionada ao jogo'

        - considere a data atual ${new Date().toLocaleDateString()}

        - faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente

        - nunca responda itens que você não tenha certeza de que existe no patch atual.

        ##resposta
        - economize na resposta, seja direto e responda no máximo 500 caracteres. 
        - responda em markdown
        - não prescisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ##exemplo de resposta
        pergunta do usuário: melhor build rengar jungle
        resposta a build mais atual é: \n\n **itens** \n\n coloque os itens aqui. \n\n **runas:**\n\n exemplo de runas \n\n

        --- 
        aqui está a pergunta do usuário: ${question}
    `

    const contents = [{
        role:"user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search:{}
        }]

    
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game =gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert ('Por favor, preencha todos os campos!')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')
    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')

    } catch(error){
        console.log('Erro: ', error)

    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }

}

const validarCampos = () => {
    const apiKey = apiKeyInput.value.trim()
    const game = gameSelect.value.trim()
    const question = questionInput.value.trim()

    askButton.disabled = !(apiKey && game && question)
}


apiKeyInput.addEventListener('input', validarCampos)
gameSelect.addEventListener('change', validarCampos)
questionInput.addEventListener('input', validarCampos)


form.addEventListener('submit', enviarFormulario)