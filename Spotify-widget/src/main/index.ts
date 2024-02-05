import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { store } from 'renderer/src/components/store'
import icon from '../../resources/icon.png?asset'

const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const expressApp = express()

const mediaController = require('node-media-controller')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 80,
    title: 'Spotify minified',
    frame: false,
    roundedCorners: true,
    resizable: false,
    x: screen.getPrimaryDisplay().workAreaSize.width - 310,
    y: screen.getPrimaryDisplay().workAreaSize.height - 90,
    // skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    darkTheme: true,
    movable: true,
    skipTaskbar: false,
    icon: icon,
    closable: true,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test

  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('play', () => {
    // Function to retrieve information about running processes

    // Send an IPC message to the renderer process to play the media
    mediaController.executeCommand('play', function (err: any, result: any) {
      if (!err) {
        console.log('done!')
      }
    })
  })
  ipcMain.on('pause', () => {
    // Send an IPC message to the renderer process to play the media
    mediaController.executeCommand('pause', function (err: any, result: any) {
      if (!err) {
        console.log('done!')
      }
    })
  })
  ipcMain.on('next', () => {
    // Send an IPC message to the renderer process to play the media
    mediaController.executeCommand('next', function (err: any, result: any) {
      if (!err) {
        console.log('done!')
      }
    })
  })
  ipcMain.on('previous', () => {
    // Send an IPC message to the renderer process to play the media
    mediaController.executeCommand('previous', function (err: any, result: any) {
      if (!err) {
        console.log('done!')
      }
    })
  })
  ipcMain.on('login', () => {
    loginWithSpotify()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

expressApp.get('/callback', async (req: any, res: any) => {
  const { code } = req.query
  console.log('code', code)
  const client_id = '2c1494e88d7b408fa613f6a43b395af4'
  const client_secret = '536c09fa548948d0a7ce9c401ac99b68'
  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/callback',
        client_id: client_id,
        client_secret: client_secret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    // Log the response from Spotify
    console.log('Token exchange response:', data)

    // Retrieve access token and refresh token
    const { access_token, refresh_token } = data
    store.dispatch({ type: 'accessToken', payload: access_token })
    store.dispatch({ type: 'refreshToken', payload: refresh_token })
    // Send the tokens to the renderer process (mainWindow)
    // event.sender.send('spotify-auth-reply', access_token);
    res.send('You can close this window now')
    store.dispatch({ type: 'loggedin' })
  } catch (error: any) {
    // Log and handle the error
    console.error('Error exchanging authorization code for access token:', error.message)
    res.send('Error getting access token')
    // event.sender.send('spotify-auth-reply', { error: error.message });
  }
})
expressApp.listen(3000, () => {
  console.log('Server listening on port 3000')
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
function loginWithSpotify() {
  // Open Spotify authorization page in default browser
  const authURL =
    'https://accounts.spotify.com/authorize?' +
    'client_id=2c1494e88d7b408fa613f6a43b395af4' +
    '&response_type=code' +
    '&redirect_uri=http://localhost:3000/callback' + // Adjust this to your actual redirect URI
    '&scope=user-read-private%20user-read-email%20user-read-currently-playing'
  require('electron').shell.openExternal(authURL)
}

// function randomString(length: number): string {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters.charAt(randomIndex);
//   }
//   return result;
// }
function getCurrentlyPlayingTrack(): void {
  interface songInfo {
    name: string
    artist: Array<string>
    album: string
    isplaying: boolean
    image: Array<string>
  }
  const access_token = store.getState().accessToken

  if (access_token === '') return
  if (access_token) {
    let accessToken = access_token
    const currentlyPlayingEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing'

    // Make authenticated request to Spotify API
    axios
      .get(currentlyPlayingEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}` // Include access token in the Authorization header
        }
      })
      .then((response) => {
        // Handle successful response
        // console.log('Currently Playing:', response.data)
        const info = response.data
        const data: songInfo = {
          name: info.item.name,
          artist: info.item.artists,
          album: info.item.album.name,
          isplaying: info.is_playing,
          image: info.item.album.images
        }
        store.dispatch({ type: 'songInfo', payload: data })
        // console.log(dyata);
        // Extract relevant information such as track name, artist, album, etc. from the response
      })
      .catch((error) => {
        // Handle error
        console.error('Error fetching currently playing track:', error)
      })
  }
}
const interval = setInterval(getCurrentlyPlayingTrack, 5000)

store.subscribe(() => {
  console.log(store.getState())
})
