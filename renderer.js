const { ipcRenderer } = require('electron')
const dayjs = require('dayjs')

const dateFormat = 'YYYY-MM-DD'
const dateTimeFormat = 'YYYY-MM-DD HH:mm'

const todayDateStr = dayjs().format('YYYY-MM-DD')

function todoAppData() {
    return {
        todoInput: '',
        todos: [],

        editingId: 0,
        editingInput: '',

        calendarDate: dayjs().format(dateTimeFormat),

        init() {
            flatpickr('#calendar', {
                defaultDate: this.calendarDate,
                dateFormat: 'Y-m-d',
                onChange: function (selectedDates, dateStr, instance) {
                    this.calendarDate = dayjs(dateStr)
                        .hour(dayjs().hour())
                        .minute(dayjs().minute())
                        .format(dateTimeFormat)
                }.bind(this),
            })
            this.getJSON(this.calendarDate)
        },

        getJSON(date) {
            ipcRenderer.invoke('get-todos', date).then((result) => {
                this.todos = result
            })
        },

        add() {
            const task = this.todoInput.trim()
            if (task) {
                const today = dayjs(this.calendarDate)

                const id = crypto.randomUUID()
                const year = today.year()
                const month = today.month() + 1
                const date = today.date()
                let hour = today.hour()
                let minutes = today.minute()
                if (
                    todayDateStr !== dayjs(this.calendarDate).format(dateFormat)
                ) {
                    hour = 0
                    minutes = 0
                }

                this.todos.push({
                    id,
                    year,
                    month,
                    date,
                    hour,
                    minutes,
                    task,
                    completed: false,
                })

                this.todoInput = ''
                this.saveJSON()
            } else {
                Swal.fire({
                    text: '추가할 일이 입력되지 않았습니다.',
                })
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
            ipcRenderer.invoke('save-todos', this.calendarDate, list).then()
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
