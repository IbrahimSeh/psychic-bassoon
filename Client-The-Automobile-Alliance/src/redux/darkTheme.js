import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isDarkTheme: false,
    flagIsDarkTheme: "dark",
};

const darkThemeSlice = createSlice({
    name: "darkTheme",
    initialState,
    reducers: {
        changeTheme(state) {
            if (state.isDarkTheme === true) {
                state.flagIsDarkTheme = "dark"
            } else {
                state.flagIsDarkTheme = "light"
            }
            state.isDarkTheme = !state.isDarkTheme;
        },
        setToDarkTheme(state) {
            state.isDarkTheme = true;
        },
        setToLightTheme(state) {
            state.isDarkTheme = false;
        },
    },
});

/*
  const [darkTheme, setDarkTheme] = useState(initialState)
  const [darkTheme, changeTheme, setToDarkTheme, setToLightTheme] = useStateRedux(initialState)
  darkThemeSlice.actions = {
    changeTheme, setToDarkTheme, setToLightTheme
  }
*/

export const darkThemeActions = darkThemeSlice.actions;

export default darkThemeSlice.reducer;
