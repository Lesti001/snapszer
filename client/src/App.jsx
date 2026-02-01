import { useState } from 'react'
import Menu from './Menu'
import './css/App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Menu></Menu>
    </>
  )
}

export default App
