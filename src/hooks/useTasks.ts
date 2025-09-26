import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

const STORAGE_KEY = 'tasks';

// Mock data for demo purposes
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    description: 'Draft and finalize the project proposal for the Q4 initiative',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: '2',
    title: 'Review Code Changes',
    description: 'Review and approve pending pull requests from the team',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-02T10:30:00Z',
    updatedAt: '2024-01-02T10:30:00Z',
  },
  {
    id: '3',
    title: 'Update Documentation',
    description: 'Update API documentation with latest changes',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-10',
    createdAt: '2024-01-03T14:15:00Z',
    updatedAt: '2024-01-03T14:15:00Z',
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Use initial mock data if no stored tasks
      setTasks(initialTasks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    updateTask(id, { status });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
}