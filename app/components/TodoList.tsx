import { Todo, Assignee } from '@prisma/client'
import TodoItem from './TodoItem'

type TodoWithAssignee = Todo & {
  assignee: Assignee | null
}

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  todos: TodoWithAssignee[]
  assignees: AssigneeWithCount[]
}

export default function TodoList({ todos, assignees }: Props) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Todoがまだありません。上のフォームから追加してください。
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} assignees={assignees} />
      ))}
    </div>
  )
}
