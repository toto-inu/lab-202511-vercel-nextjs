import { NextAdminOptions } from "@premieroctet/next-admin";

export const options: NextAdminOptions = {
  model: {
    Todo: {
      toString: (todo) => `${todo.title}`,
      list: {
        display: ["id", "title", "description", "completed", "assignee", "createdAt"],
        search: ["title", "description"],
        includes: {
          assignee: true,
        },
        fields: {
          assignee: {
            formatter: (field, context) => {
              // context.rowからassignee関連データを取得
              const assignee = context?.row?.assignee;
              return assignee?.name ?? "未割り当て";
            },
          },
        },
      },
      edit: {
        display: ["title", "description", "completed", "assigneeId"],
      },
    },
    Assignee: {
      toString: (assignee) => `${assignee.name}`,
      list: {
        display: ["id", "name", "email", "createdAt"],
        search: ["name", "email"],
      },
    },
  },
};
