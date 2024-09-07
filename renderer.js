const { ipcRenderer } = require('electron')
const dayjs = require('dayjs')

function todoAppData() {
    return {
        todoInput: '',
        todos: [],

        editingId: 0,
        editingInput: '',

        currentDate: dayjs().format('YYYY-MM-DD'),

        async init() {
            flatpickr('#calendar', {
                defaultDate: this.currentDate,
            })
            this.todos = await ipcRenderer.invoke('get-todos', this.currentDate)
        },

        add() {
            const task = this.todoInput.trim()
            if (task) {
                const date = new Date()
                this.todos.push({
                    id: crypto.randomUUID(),
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
                alert('추가할 일이 입력되지 않았습니다.')
            }
        },

        edit(id, task) {
            this.editingId = id
            this.editingInput = task
        },

        save() {
            const editTask = this.editingInput.trim()
            if (editTask) {
                this.todos = this.todos.map((todo) => {
                    if (todo.id === this.editingId) {
                        todo.task = editTask
                    }
                    return todo
                })
                this.editingId = 0
                this.editingInput = ''
                this.saveJSON()
            } else {
                alert('수정할 일이 입력되지 않았습니다.')
            }
        },

        saveJSON() {
            const list = this.todos.map((todo) => Object.assign({}, todo))
            ipcRenderer.invoke('save-todos', this.currentDate, list).then()
        },

        remove(id) {
            this.todos = this.todos.filter((todo) => todo.id !== id)
            this.saveJSON()
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
    }
}
