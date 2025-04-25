import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useUser } from '@clerk/nextjs';

// Define types for our Kanban board
interface Task {
  id: string;
  content: string;
  category?: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: [],
    },
    'column-2': {
      id: 'column-2',
      title: 'Doing',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export const KanbanBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [loading, setLoading] = useState(true);
  const { isLoaded, isSignedIn, user } = useUser();
  
  // Load board data on component mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadBoardData();
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Auto-save board data every 30 seconds
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const autoSaveInterval = setInterval(() => {
      saveBoardData();
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [boardData, isLoaded, isSignedIn]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kanban/load-board');
      
      if (response.ok) {
        const data = await response.json();
        if (data.boardData) {
          setBoardData(data.boardData);
        }
      }
    } catch (error) {
      console.error('Error loading board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBoardData = async () => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      const response = await fetch('/api/kanban/save-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save board data');
      }
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Return if dropped outside droppable area or in same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get source and destination columns
    const sourceColumn = boardData.columns[source.droppableId];
    const destColumn = boardData.columns[destination.droppableId];
    
    // If moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      
      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };
      
      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn,
        },
      };
      
      setBoardData(newBoardData);
      saveBoardData();
      return;
    }
    
    // Moving from one column to another
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };
    
    const destTaskIds = Array.from(destColumn.taskIds);
    destTaskIds.splice(destination.index, 0, draggableId);
    const newDestColumn = {
      ...destColumn,
      taskIds: destTaskIds,
    };
    
    const newBoardData = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn,
      },
    };
    
    setBoardData(newBoardData);
    saveBoardData();
  };

  const addTask = (content: string, category?: string) => {
    const taskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      content,
      category,
    };
    
    const newBoardData = {
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...boardData.columns,
        'column-1': {
          ...boardData.columns['column-1'],
          taskIds: [...boardData.columns['column-1'].taskIds, taskId],
        },
      },
    };
    
    setBoardData(newBoardData);
    saveBoardData();
  };

  const deleteTask = async (taskId: string) => {
    // Find which column contains this task
    let columnId = '';
    for (const [id, column] of Object.entries(boardData.columns)) {
      if (column.taskIds.includes(taskId)) {
        columnId = id;
        break;
      }
    }
    
    if (!columnId) return;
    
    // Create a copy of the tasks and columns
    const newTasks = { ...boardData.tasks };
    delete newTasks[taskId];
    
    const column = boardData.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);
    
    const newBoardData = {
      ...boardData,
      tasks: newTasks,
      columns: {
        ...boardData.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    };
    
    setBoardData(newBoardData);
    
    try {
      await fetch('/api/kanban/delete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
        }),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading your tasks...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Kanban Board</h1>
        <button 
          onClick={() => addTask('New Task')}
          className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Add Task
        </button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boardData.columnOrder.map(columnId => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
            
            return (
              <div key={column.id} className="bg-gray-100 p-4 rounded-lg">
                <h2 className="font-bold mb-4 text-lg">{column.title}</h2>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-100' : ''
                      }`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 mb-2 bg-white rounded shadow ${
                                snapshot.isDragging ? 'bg-gray-200 shadow-lg' : ''
                              }`}
                            >
                              <div className="flex justify-between">
                                <div>
                                  {task.category && (
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mb-2">
                                      {task.category}
                                    </span>
                                  )}
                                  <p>{task.content}</p>
                                </div>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};