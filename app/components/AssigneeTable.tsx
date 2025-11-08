'use client'

import { useState } from 'react'
import { Assignee } from '@prisma/client'
import { deleteAssignee, createAssignee, updateAssignee } from '@/actions/assignee'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, User, Mail } from 'lucide-react'

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  assignees: AssigneeWithCount[]
}

export default function AssigneeTable({ assignees }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<AssigneeWithCount | null>(null)

  const handleEditClick = (assignee: AssigneeWithCount) => {
    setSelectedAssignee(assignee)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (assignee: AssigneeWithCount) => {
    setSelectedAssignee(assignee)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedAssignee) {
      await deleteAssignee(selectedAssignee.id)
      setSelectedAssignee(null)
    }
  }

  const handleCreateSubmit = async (formData: FormData) => {
    await createAssignee(formData)
    setIsCreateModalOpen(false)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (selectedAssignee) {
      await updateAssignee(selectedAssignee.id, formData)
      setIsEditModalOpen(false)
      setSelectedAssignee(null)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          新しい担当者を追加
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>担当Todo数</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  担当者がまだいません
                </TableCell>
              </TableRow>
            ) : (
              assignees.map((assignee) => (
                <TableRow key={assignee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {assignee.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {assignee.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {assignee._count.todos}件
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(assignee.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(assignee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(assignee)}
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
        title="新しい担当者を追加"
      >
        <form action={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              名前
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              placeholder="山田太郎"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              メールアドレス
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              placeholder="yamada@example.com"
            />
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
      {selectedAssignee && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedAssignee(null)
          }}
          title="担当者を編集"
        >
          <form action={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
                名前
              </label>
              <Input
                type="text"
                id="edit-name"
                name="name"
                defaultValue={selectedAssignee.name}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <Input
                type="email"
                id="edit-email"
                name="email"
                defaultValue={selectedAssignee.email}
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedAssignee(null)
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
      {selectedAssignee && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedAssignee(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="担当者を削除"
          message={
            selectedAssignee._count.todos > 0
              ? `「${selectedAssignee.name}」には${selectedAssignee._count.todos}件のTodoが割り当てられています。削除してもよろしいですか？この操作は取り消せません。`
              : `「${selectedAssignee.name}」を削除してもよろしいですか？この操作は取り消せません。`
          }
        />
      )}
    </>
  )
}
