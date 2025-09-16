
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dash from './Dash/Dash';
import Login from './Login/Login';
import GerenciarFormularios from './form/GerenciarFormularios';
import PrivateRoute from './PrivateRoute';
import FormularioDinamico from './form/FormularioDinamico';

function App() {
  return (
    <div className="App">
      <BrowserRouter> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dash" element={<PrivateRoute><Dash/></PrivateRoute>} />
          <Route path='/gerenciarFormulario' element={<GerenciarFormularios/>}/>
          <Route path="/form/:id" element={<FormularioDinamico />} /> 
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;