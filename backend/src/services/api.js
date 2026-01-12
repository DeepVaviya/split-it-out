import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const createGroup = (data) => API.post('/groups', data);
export const getGroup = (id) => API.get(`/groups/${id}`);
export const addExpense = (data) => API.post('/expenses', data);
// Settlement is calculated on the backend and sent with group details