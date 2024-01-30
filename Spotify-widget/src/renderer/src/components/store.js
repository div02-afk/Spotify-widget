import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import { configureStore } from '@reduxjs/toolkit';
import {produce} from 'immer'


const initialState = getInitialStateRenderer();

const keyReducer = (state = initialState, action) => {
    return produce(state, (draft) => {
      switch (action.type) {
        case 'accessToken':
          draft.accessToken = action.payload
          break
        case 'refreshToken':
          draft.refreshToken = action.payload
          break
        case 'songName':
          draft.songName = action.payload
          break
        case 'loggedin':
          draft.loggedin = true
          break
        case 'songInfo':
          const artistName = action.payload.artist.map((artist) => artist.name)
          draft.songName = action.payload.name
          draft.artist = artistName
          draft.album = action.payload.album
          draft.isPlaying = action.payload.isplaying
          draft.image = action.payload.image[2].url
          break
        default:
          break
      }
    })
  }
  const store = configureStore({
    reducer: keyReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(forwardToMain),
  })

  replayActionRenderer(store);


  export default store;