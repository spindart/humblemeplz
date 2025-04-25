import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Head from 'next/head';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import HeaderMenu from "../components/HeaderMenu";

// Define the card interface
interface TipCard {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'Doing' | 'Done';
}

export default function MyTips() {
  const { userId } = useAuth();
  const [cards, setCards] = useState<TipCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCard, setNewCard] = useState<Partial<TipCard>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'To Do'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<TipCard | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Load cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('tipCards');
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }
    setLoading(false);
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tipCards', JSON.stringify(cards));
    }
  }, [cards, loading]);

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Create a copy of the cards array
    const updatedCards = [...cards];
    
    // Find the card that was dragged
    const draggedCard = updatedCards.find(card => card.id === result.draggableId);
    
    if (draggedCard) {
      // Update the card's status based on the destination column
      draggedCard.status = destination.droppableId as 'To Do' | 'Doing' | 'Done';
      
      // Save the updated cards
      setCards(updatedCards);
    }
  };

  // Create a new card
  const handleCreateCard = () => {
    if (!newCard.title || !newCard.dueDate) return;
    
    const card: TipCard = {
      id: Date.now().toString(),
      title: newCard.title || '',
      description: newCard.description || '',
      dueDate: newCard.dueDate || '',
      createdAt: new Date().toISOString(),
      priority: newCard.priority as 'Low' | 'Medium' | 'High',
      status: newCard.status as 'To Do' | 'Doing' | 'Done'
    };
    
    setCards([...cards, card]);
    setNewCard({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      status: 'To Do'
    });
    setIsFormOpen(false);
  };

  // Update an existing card
  const handleUpdateCard = () => {
    if (!editingCard) return;
    
    const updatedCards = cards.map(card => 
      card.id === editingCard.id ? editingCard : card
    );
    
    setCards(updatedCards);
    setEditingCard(null);
  };

  // Delete a card
  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  // Get cards for a specific column
  const getColumnCards = (status: 'To Do' | 'Doing' | 'Done') => {
    return cards.filter(card => card.status === status);
  };

  // Determine card urgency based on due date
  const getCardUrgency = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    if (diffDays <= 7) return 'upcoming';
    return 'normal';
  };

  // Get color for priority level
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color for urgency level
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'text-red-600';
      case 'due-soon': return 'text-orange-600';
      case 'upcoming': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Head>
        <title>My Tips - HumbleMePlz</title>
        <meta name="description" content="Manage your resume improvement tips" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <HeaderMenu />
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-title text-red-800 text-center mb-3 tracking-wide">
            My Tips
          </h1>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Organize your resume improvement tasks
          </p>
          
          {/* Add new card button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Tip
            </button>
          </div>
          
          {/* Card form modal */}
          {(isFormOpen || editingCard) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  {editingCard ? 'Edit Tip' : 'Add New Tip'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingCard ? editingCard.title : newCard.title}
                      onChange={(e) => editingCard 
                        ? setEditingCard({...editingCard, title: e.target.value})
                        : setNewCard({...newCard, title: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingCard ? editingCard.description : newCard.description}
                      onChange={(e) => editingCard 
                        ? setEditingCard({...editingCard, description: e.target.value})
                        : setNewCard({...newCard, description: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editingCard ? editingCard.dueDate.substring(0, 10) : newCard.dueDate}
                      onChange={(e) => editingCard 
                        ? setEditingCard({...editingCard, dueDate: e.target.value})
                        : setNewCard({...newCard, dueDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editingCard ? editingCard.priority : newCard.priority}
                      onChange={(e) => editingCard 
                        ? setEditingCard({...editingCard, priority: e.target.value as 'Low' | 'Medium' | 'High'})
                        : setNewCard({...newCard, priority: e.target.value as 'Low' | 'Medium' | 'High'})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  {!editingCard && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newCard.status}
                        onChange={(e) => setNewCard({...newCard, status: e.target.value as 'To Do' | 'Doing' | 'Done'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="To Do">To Do</option>
                        <option value="Doing">Doing</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingCard(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingCard ? handleUpdateCard : handleCreateCard}
                      className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
                    >
                      {editingCard ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">To Do</h2>
                  <Droppable droppableId="To Do">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[200px]"
                      >
                        {getColumnCards('To Do').map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-md p-3 mb-3 shadow-sm border-l-4 border-gray-300 hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-gray-800">{card.title}</h3>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setEditingCard(card)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCard(card.id)}
                                      className="text-gray-500 hover:text-red-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(card.priority)}`}>
                                    {card.priority}
                                  </span>
                                  <span className={`text-xs ${getUrgencyColor(getCardUrgency(card.dueDate))}`}>
                                    Due: {new Date(card.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {card.description && (
                                  <div className="mt-2">
                                    {expandedCardId === card.id ? (
                                      <div>
                                        <p className="text-sm text-gray-600">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(null)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-sm text-gray-600 truncate">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(card.id)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show more
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                
                {/* Doing Column */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Doing</h2>
                  <Droppable droppableId="Doing">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[200px]"
                      >
                        {getColumnCards('Doing').map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-md p-3 mb-3 shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-gray-800">{card.title}</h3>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setEditingCard(card)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCard(card.id)}
                                      className="text-gray-500 hover:text-red-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(card.priority)}`}>
                                    {card.priority}
                                  </span>
                                  <span className={`text-xs ${getUrgencyColor(getCardUrgency(card.dueDate))}`}>
                                    Due: {new Date(card.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {card.description && (
                                  <div className="mt-2">
                                    {expandedCardId === card.id ? (
                                      <div>
                                        <p className="text-sm text-gray-600">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(null)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-sm text-gray-600 truncate">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(card.id)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show more
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                
                {/* Done Column */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Done</h2>
                  <Droppable droppableId="Done">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[200px]"
                      >
                        {getColumnCards('Done').map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-md p-3 mb-3 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-gray-800 line-through opacity-70">{card.title}</h3>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setEditingCard(card)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCard(card.id)}
                                      className="text-gray-500 hover:text-red-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(card.priority)} opacity-70`}>
                                    {card.priority}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Completed
                                  </span>
                                </div>
                                {card.description && (
                                  <div className="mt-2">
                                    {expandedCardId === card.id ? (
                                      <div>
                                        <p className="text-sm text-gray-500 opacity-70">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(null)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-sm text-gray-500 truncate opacity-70">{card.description}</p>
                                        <button 
                                          onClick={() => setExpandedCardId(card.id)}
                                          className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                          Show more
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-6">
        <p>Your data is saved locally in your browser.</p>
        <p className="mt-2">© {new Date().getFullYear()} HumbleMePlz.com</p>
      </footer>
    </div>
  );
}