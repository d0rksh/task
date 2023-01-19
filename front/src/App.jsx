import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Routes, useNavigate } from 'react-router'
import './App.css'
import Layout from './Layout/Layout'
import Auth from './Pages/Auth/Auth'
import Question from './Pages/Calculation/Calc'
import Create from './Pages/Create/Create'
import { setToken } from './store/store'
import { parseJwt } from './utils'

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(()=>{
      const token = localStorage.getItem('token')
      if(token){
          dispatch(setToken(token))
          const token1 = parseJwt(token)
          if(token1.role === 'MASTER'){
                navigate('/create')
          }else{
            navigate('/questions')
          }

      }else{
        navigate('/')
      }

  },[])
  return (

    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/create" element={<Create />} />
          <Route path="/questions" element={<Question />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
