import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserProfileState} from "./types"

const initialState: UserProfileState = {
  id:'',
  username: '',
  role: '',
  avatar_url: '',
  description:'',
  birthday:'',
  updated_at:'',
  created_at:''
};

/**
 * Redux slice for managing the user profile state.
 */
const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfileState>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearUserProfile: (state) => initialState,
  },
});

export const { setUserProfile, clearUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;
