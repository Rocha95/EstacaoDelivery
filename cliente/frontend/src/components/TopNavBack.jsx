import { useNavigate } from 'react-router-dom'

export default function TopNavBack({ title, to }) {
  const navigate = useNavigate()
  return (
    <div className="top-nav-back">
      <button onClick={() => (to ? navigate(to) : navigate(-1))}>←</button>
      <h1>{title}</h1>
    </div>
  )
}
