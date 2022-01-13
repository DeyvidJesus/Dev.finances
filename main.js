const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const MyStorage = {

    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
} 

 const Transaction = {

    all: MyStorage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const transactionClass = transaction.amount >= 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

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

    updateBalance() {
        document.getElementById('incomes').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenses').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('total').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {    
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

    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#value'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Preencha todos os campos")
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

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

    submit(event) {
        event.preventDefault()

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

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        MyStorage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()