const { ipcRenderer } = require('electron')

function todoAppData() {
    return {
        todoInput: '',
        todos: [],
        editingId: 0,

        editingInput: '',

        editTodo(id, task) {
            this.editingId = id
            this.editingInput = task
        },
        async init() {
            this.todos = await ipcRenderer.invoke('get-todos')
        },

        toggleTodoCompleted(todoId) {
            this.todos = this.todos.map((todo) => {
                if (todo.id === todoId) {
                    todo.completed = !todo.completed
                }
                return todo
            })
            this.saveTodos()
        },

        addTodo() {
            const task = this.todoInput.trim()
            if (task) {
                const date = new Date()
                this.todos.push({
                    id: this.todos.length + 1,
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    date: date.getDate(),
                    hour: date.getHours(),
                    minutes: date.getMinutes(),
                    task,
                    completed: false,
                })
                this.saveTodos()
                this.todoInput = ''
            }
        },

        saveTodos() {
            const list = this.todos.map((e) => Object.assign({}, e))
            ipcRenderer.invoke('save-todos', list)
        },
    }
}
