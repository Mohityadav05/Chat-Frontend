import { useState } from 'react'
import Login from './Components/Login'
import Home from './Components/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './Components/Signup'
import Profile from './Components/Profile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/home' element={<Home/>} />
      <Route path='/profile' element={<Profile/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;
