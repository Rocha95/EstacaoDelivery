import { STATUS_LABEL, STATUS_PILL_CLASS } from '../data/mock'

export default function StatusPill({ status }) {
  return <span className={`pill ${STATUS_PILL_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
}
