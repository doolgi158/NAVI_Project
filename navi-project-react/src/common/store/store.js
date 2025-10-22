import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import accReducer from "../slice/accSlice";
import roomReducer from "../slice/roomSlice";
import loginReducer from "../slice/loginSlice";

const rootReducer = combineReducers({
  acc: accReducer,
  room: roomReducer,
  login: loginReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["room"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);