import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserData = {
  id: undefined,
  name: undefined,
  email: undefined,
  createdAt: undefined,
  role: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state: UserData, action: PayloadAction<UserData>) =>
      action.payload,
  },
});

export const { addUser } = userSlice.actions;
export default userSlice.reducer;
