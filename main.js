// Objeto do modal
const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        // fechar o modal
        // remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

// Objeto para adicionar e pegar os dados do LocalStorage
const MyStorage = {

    // Método para pegar os dados do LocalStorage
    get() {
        // Retorna os dados do LocalStorage em forma de array (vetor)
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    // Método para adicionar os dados ao LocalStorage
    set(transactions) {
        // Adiciona os elementos da transação ao LocalStorage transformando em string
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
} 

// Objeto que gerencia as transações
 const Transaction = {

    // Todas as transações existentes
    all: MyStorage.get(),

    // Adiciona as transações ao nosso array e reinicia a aplicação
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    // Remove transações da tabela
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    // Soma dos valores das entradas
    incomes() {
        let income = 0;

        // Para cada transação será verificado se é uma entrada ou não, somente as entradas serão somadas
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },

    // Soma dos valores das saídas
    expenses() {
        let expense = 0;

        // Para cada transação será verificado se é uma saída ou não, somente as saídas serão somadas
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    // Soma as entradas e as saídas
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {

    // Tabela HTML
    transactionsContainer: document.querySelector('#data-table tbody'),

    // Método que adiciona a transação na tabela
    addTransaction(transaction, index) {

        // Criação do elemento linha
        const tr = document.createElement('tr')

        // Adiciona os dados à essa linha
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        // Adiciona a linha na tabela
        DOM.transactionsContainer.appendChild(tr)
    },

    // Cria os dados da tabela
    innerHTMLTransaction(transaction, index) {
        // Verifica qual classe a transação deverá receber
        const transactionClass = transaction.amount >= 0 ? "income" : "expense"

        // Formata a moeda
        const amount = Utils.formatCurrency(transaction.amount)

        // Cria os dados da linha
        const html = `
        <td class="description">${transaction.description}</td>
                <td class="${transactionClass}">${amount}</td>
                <td class="date">${transaction.date}</td>
        <td>
            <img class="remove-image" onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    // Atualiza o balanço financeiro
    updateBalance() {
        // Pega a soma das entradas e formata o valor das mesmas
        document.getElementById('incomes').innerHTML = Utils.formatCurrency(Transaction.incomes())

        // Pega a soma das saídas e formata o valor das mesmas
        document.getElementById('expenses').innerHTML = Utils.formatCurrency(Transaction.expenses())

        // Pega a soma total e formata a mesma
        document.getElementById('total').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // Limpa a tabela inteira
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Objeto para formatação de dados
const Utils = {    

    // Formata como moeda
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

       return signal + value
    },

    // Formata o montante corretamente
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    // Formata a data corretamente
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

// Objeto do formulário
const Form = {

    // Inputs
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#value'),
    date: document.querySelector('input#date'),

    // Pega os valores dos inputs
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // Verifica se todos os campos foram preenchidos
    validateFields() {
        const { description, amount, date } = Form.getValues()

        // Coloca uma mensagem de erro caso os campos não tenham sido preenchidos
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Preencha todos os campos")
        }
    },

    // Limpa os campos
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    // Formata os dados
    formatData() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }  
    },

    // Chama as principais funções que adicionam a nova transação
    submit(event) {

        // Previne o comportamenet padrão
        event.preventDefault()

        // Tenta executar o código a seguir, caso falhe trata o erro.
        try {
            Form.validateFields()

            const transaction = Form.formatData()

            Transaction.add(transaction)
            
            Form.clearFields()
            
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

// Comandos principais da aplicação
const App = {

    // Inicia a aplicação
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        MyStorage.set(Transaction.all)
    },

    // Reinicia a aplicação
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()