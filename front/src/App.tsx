
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dash from './Dash/Dash';
import FiliacaoForm from './form/FiliacaoForm';
import Login from './Login/Login';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <div className="App">
      <BrowserRouter> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<FiliacaoForm />} />
          <Route path="/dash" element={<PrivateRoute><Dash/></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;