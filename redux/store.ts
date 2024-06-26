import {configureStore} from "@reduxjs/toolkit";
import theme from "./themeSlice";
import userProfileReducer from './userProfileSlice';

export const store = configureStore({
    reducer: {
        theme,
        userProfile: userProfileReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;