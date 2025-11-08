'use client'

import { useState } from 'react'
import { Todo, Assignee } from '@prisma/client'
import { toggleTodo, deleteTodo, createTodo, updateTodo } from '@/actions/todo'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus } from 'lucide-react'

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

export default function TodoTable({ todos, assignees }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<TodoWithAssignee | null>(null)

  const handleToggle = async (todo: TodoWithAssignee) => {
    await toggleTodo(todo.id, !todo.completed)
  }

  const handleEditClick = (todo: TodoWithAssignee) => {
    setSelectedTodo(todo)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (todo: TodoWithAssignee) => {
    setSelectedTodo(todo)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedTodo) {
      await deleteTodo(selectedTodo.id)
      setSelectedTodo(null)
    }
  }

  const handleCreateSubmit = async (formData: FormData) => {
    await createTodo(formData)
    setIsCreateModalOpen(false)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (selectedTodo) {
      await updateTodo(selectedTodo.id, formData)
      setIsEditModalOpen(false)
      setSelectedTodo(null)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          新しいTodoを追加
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>説明</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Todoがまだありません
                </TableCell>
              </TableRow>
            ) : (
              todos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span
                      className={todo.completed ? 'line-through text-muted-foreground' : ''}
                    >
                      {todo.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {todo.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {todo.assignee?.name ? (
                      <Badge variant="secondary">{todo.assignee.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(todo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(todo)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新しいTodoを追加"
      >
        <form action={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              タイトル
            </label>
            <Input
              type="text"
              id="title"
              name="title"
              required
              placeholder="買い物に行く"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="野菜と果物を買う"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium mb-2">
              担当者
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">なし</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">
              追加
            </Button>
          </div>
        </form>
      </Modal>

      {/* 編集モーダル */}
      {selectedTodo && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTodo(null)
          }}
          title="Todoを編集"
        >
          <form action={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                タイトル
              </label>
              <Input
                type="text"
                id="edit-title"
                name="title"
                defaultValue={selectedTodo.title}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                説明
              </label>
              <textarea
                id="edit-description"
                name="description"
                defaultValue={selectedTodo.description || ''}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-assigneeId" className="block text-sm font-medium mb-2">
                担当者
              </label>
              <select
                id="edit-assigneeId"
                name="assigneeId"
                defaultValue={selectedTodo.assigneeId || ''}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">なし</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <Checkbox
                  name="completed"
                  value="true"
                  defaultChecked={selectedTodo.completed}
                />
                <span className="text-sm font-medium">完了</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedTodo(null)
                }}
              >
                キャンセル
              </Button>
              <Button type="submit">
                保存
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 削除確認モーダル */}
      {selectedTodo && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedTodo(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Todoを削除"
          message={`「${selectedTodo.title}」を削除してもよろしいですか？この操作は取り消せません。`}
        />
      )}
    </>
  )
}
