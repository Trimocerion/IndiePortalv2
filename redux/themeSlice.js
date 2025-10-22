import {createSlice} from "@reduxjs/toolkit";

const cachedTheme =
  typeof window !== "undefined" && window.localStorage.getItem("darkMode");

const initialState = {
  darkMode: !!JSON.parse(cachedTheme),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleColorMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload;
    },
  },
});

// The function below is called a thunk and allows us to perform async logic.
// It can be dispatched like a regular action: `dispatch(toggleColorMode())`.
// This will call the thunk with the `dispatch` function as the first argument.
// Async code can then be executed and other actions can be dispatched
export const asyncToggleTheme = () => (dispatch) => {
  if (typeof window !== "undefined") {
    const isDarkMode = !!JSON.parse(window.localStorage.getItem("darkMode"));
    window.localStorage.setItem("darkMode", !isDarkMode);
  }
  dispatch(toggleColorMode());
};

// Action creators are generated for each case reducer function
export const { toggleColorMode, setTheme } = themeSlice.actions;

export default themeSlice.reducer;