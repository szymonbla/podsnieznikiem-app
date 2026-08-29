import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../../../core/api"
import { TASKS_QUERY_KEY, TASKS_STALE_TIME_MS } from "../configuration/query-settings"
import { draftTask } from "../domain/drafts"
import type { CreateTaskBody, Task, UpdateTaskBody } from "../domain/models"
import { useOptimisticWrite } from "./optimistic-writes"

const fetchTasks = async (): Promise<ReadonlyArray<Task>> => {
  const { data, error, response } = await apiClient.GET("/tasks")
  if (error !== undefined || data === undefined) throw new Error(`Failed to fetch tasks (HTTP ${response.status})`)
  return data
}

export const useTasks = () =>
  useQuery({ queryKey: TASKS_QUERY_KEY, queryFn: fetchTasks, staleTime: TASKS_STALE_TIME_MS })

export const useCreateTask = () =>
  useOptimisticWrite({
    send: (body: CreateTaskBody) => apiClient.POST("/tasks", { body }),
    preview: (tasks, body) => [...tasks, draftTask(body)]
  })

interface TaskUpdate { readonly id: string; readonly body: UpdateTaskBody }

export const useUpdateTask = () =>
  useOptimisticWrite({
    send: ({ id, body }: TaskUpdate) => apiClient.PATCH("/tasks/{id}", { params: { path: { id } }, body }),
    preview: (tasks, { id, body }) =>
      tasks.map((task) => (task.id === id ? { ...task, ...body, updatedAt: new Date().toISOString() } : task))
  })

export const useDeleteTask = () =>
  useOptimisticWrite({
    send: (id: string) => apiClient.DELETE("/tasks/{id}", { params: { path: { id } } }),
    preview: (tasks, id) => tasks.filter((task) => task.id !== id)
  })

export const useCompleteTask = () =>
  useOptimisticWrite({
    send: (id: string) => apiClient.POST("/tasks/{id}/complete", { params: { path: { id } } }),
    preview: (tasks, id) => tasks.map((task) => (task.id === id ? { ...task, done: true } : task))
  })

export const useUncompleteTask = () =>
  useOptimisticWrite({
    send: (id: string) => apiClient.POST("/tasks/{id}/uncomplete", { params: { path: { id } } }),
    preview: (tasks, id) => tasks.map((task) => (task.id === id ? { ...task, done: false } : task))
  })
