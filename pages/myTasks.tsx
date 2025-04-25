import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import HeaderMenu from '../components/HeaderMenu';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string | null;
  completedAt: string | null;
  category: string;
  progress?: number;
}

export default function MyTasks() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  useEffect(() => {
    if (!isLoaded) return;
    
    // Add router.query check
    if (router.query.refresh === 'true') {
      // Clear localStorage to force API fetch
      localStorage.removeItem('kanban_tasks');
    }
    
    fetchTasks();
  }, [isLoaded, router.query]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Always fetch from API first
      const response = await fetch('/api/kanban/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        
        // Update localStorage with latest data
        localStorage.setItem('kanban_tasks', JSON.stringify(data.tasks || []));
        setLoading(false);
        return;
      }
      
      // Fallback to localStorage if API fails
      const localTasks = localStorage.getItem('kanban_tasks');
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Try localStorage as fallback
      const localTasks = localStorage.getItem('kanban_tasks');
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      // Save to localStorage
      localStorage.setItem('kanban_tasks', JSON.stringify(updatedTasks));
      
      // Save to API
      await fetch('/api/kanban/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // If dropped in the same place, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Create a copy of the tasks
    const updatedTasks = [...tasks];
    
    // Find the task that was dragged
    const draggedTask = updatedTasks.find(task => task.id === result.draggableId);
    
    if (!draggedTask) return;
    
    // Update the task's status based on the destination droppableId
    const oldStatus = draggedTask.status;
    draggedTask.status = destination.droppableId as 'todo' | 'doing' | 'done';
    
    // If moved to 'done', set completedAt
    if (draggedTask.status === 'done' && oldStatus !== 'done') {
      draggedTask.completedAt = new Date().toISOString();
    }
    
    // If moved from 'done' to another status, clear completedAt
    if (draggedTask.status !== 'done' && oldStatus === 'done') {
      draggedTask.completedAt = null;
    }
    
    // Save the updated tasks
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Add smooth animation
    const taskElement = document.getElementById(draggedTask.id);
    if (taskElement) {
      taskElement.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        if (taskElement) {
          taskElement.style.transition = '';
        }
      }, 300);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    const currentDate = new Date().toISOString();
    
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTask.title,
      description: newTask.description || newTask.title,
      status: 'todo',
      priority: newTask.priority,
      createdAt: currentDate,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      completedAt: null,
      category: 'Custom Task',
      progress: 0
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
    setIsAddingTask(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    );
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  const handleUpdateProgress = (taskId: string, progress: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, progress } : task
    );
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const getTasksByStatus = (status: 'todo' | 'doing' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const dueDateObj = parseISO(dueDate);
    
    if (isAfter(today, dueDateObj)) {
      return { color: 'text-red-600', label: 'Overdue' };
    }
    
    if (isAfter(today, addDays(dueDateObj, -2))) {
      return { color: 'text-yellow-600', label: 'Due soon' };
    }
    
    return { color: 'text-green-600', label: 'On track' };
  };

  const renderTaskCard = (task: Task, index: number) => {
    const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate) : null;
    
    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            id={task.id}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-lg shadow-sm p-4 mb-3 border-l-4 ${
              getPriorityColor(task.priority).split(' ')[0].replace('bg', 'border')
            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
            style={{
              ...provided.draggableProps.style,
              transition: snapshot.isDragging ? 'transform 0.1s ease' : 'transform 0.3s ease'
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800 break-words pr-2">{task.title}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            )}
            
            <div className="space-y-2">
              {task.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                
                {task.dueDate && dueDateStatus && (
                  <span className={`px-2 py-1 rounded-full bg-gray-100 ${dueDateStatus.color}`}>
                    {format(parseISO(task.dueDate), 'MMM d, yyyy')} - {dueDateStatus.label}
                  </span>
                )}
                
                {task.completedAt && (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Completed {format(parseISO(task.completedAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const renderContent = () => (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            My Tasks
          </h1>
          <button
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your tasks...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">To Do</h2>
              <Droppable droppableId="todo">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {getTasksByStatus('todo').map((task, index) => renderTaskCard(task, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Doing Column */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">In Progress</h2>
              <Droppable droppableId="doing">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {getTasksByStatus('doing').map((task, index) => renderTaskCard(task, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Done Column */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Done</h2>
              <Droppable droppableId="done">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {getTasksByStatus('done').map((task, index) => renderTaskCard(task, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate ? format(parseISO(editingTask.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingTask.progress || 0}
                  onChange={(e) => setEditingTask({...editingTask, progress: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{editingTask.progress || 0}%</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>My Tasks - HumbleMePlz</title>
        <meta name="description" content="Manage your resume improvement tasks" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <HeaderMenu />
      
      {isClerkEnabled ? (
        <>
          <SignedIn>
            {renderContent()}
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      ) : (
        renderContent()
      )}
    </div>
  );
}