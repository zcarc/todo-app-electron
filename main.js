const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const dayjs = require('dayjs')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

function getFilePath(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const dirPath = path.join(__dirname, 'data', year.toString(), month)
    const filePath = path.join(dirPath, `${day}.json`)

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }

    return filePath
}

ipcMain.handle('get-todos', async (event, dateString) => {
    const filePath = getFilePath(dateString)

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
    } else {
        return []
    }
})

ipcMain.handle('save-todos', async (event, dateString, todos) => {
    const filePath = getFilePath(dateString)

    fs.writeFileSync(filePath, JSON.stringify(todos, null, 2))
    return { status: 'success' }
})
