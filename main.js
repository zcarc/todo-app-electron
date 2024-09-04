const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("get-todos", async () => {
  const todosPath = path.join(__dirname, "data/todos.json");
  if (fs.existsSync(todosPath)) {
    const data = fs.readFileSync(todosPath, "utf8");
    return JSON.parse(data);
  } else {
    return [];
  }
});

ipcMain.handle("save-todos", async (event, todos) => {
  const todosPath = path.join(__dirname, "data/todos.json");
  fs.writeFileSync(todosPath, JSON.stringify(todos, null, 2));
  return { status: "success" };
});
