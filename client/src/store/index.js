import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../reducers/user';

const store = configureStore({
  reducer: {
    user: userReducer,  // Connect user reducer to the store
  },
});

export default store;