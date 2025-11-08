import { Assignee } from '@prisma/client'
import AssigneeItem from './AssigneeItem'

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  assignees: AssigneeWithCount[]
}

export default function AssigneeList({ assignees }: Props) {
  if (assignees.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        担当者がまだいません。上のフォームから追加してください。
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignees.map((assignee) => (
        <AssigneeItem key={assignee.id} assignee={assignee} />
      ))}
    </div>
  )
}
