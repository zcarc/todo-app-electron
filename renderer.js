const { ipcRenderer } = require('electron')

function todoAppData() {
    return {
        todoInput: '',
        todos: [],

        editingId: 0,
        editingInput: '',

        edit(id, task) {
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
            this.saveJSON()
        },

        remove(id) {
            this.todos = this.todos.filter(todo => todo.id !== id)
            this.saveJSON()
        },

        add() {
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
                this.todoInput = ''
                this.saveJSON()
            } else {
                alert("추가할 일이 없습니다.")
            }
        },

        save() {
            this.todos = this.todos.map(todo => {
                if(todo.id === this.editingId) {
                    todo.task = this.editingInput
                }
                return todo;
            })
            this.editingId = 0
            this.editingInput = ''
            this.saveJSON()
        },

        saveJSON() {
            const list = this.todos.map((todo) => Object.assign({}, todo))
            ipcRenderer.invoke('save-todos', list).then()
        },
    }
}
