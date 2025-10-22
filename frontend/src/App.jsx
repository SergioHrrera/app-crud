import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/tasks` 
  : 'https://app-crud-production.up.railway.app/api/tasks';
  
function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await axios.post(API_URL, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updates);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
      setEditingTask(null);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const toggleComplete = async (task) => {
    await updateTask(task._id, { completed: !task.completed });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient flex-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient py-8 px-4">
      <div className="container">
        <div className="header">
          <h1>📋 Gestor de Tareas</h1>
          <p>Organiza tu día de manera eficiente</p>
        </div>

        <div className="card form-card">
          <form onSubmit={createTask}>
            <input
              type="text"
              placeholder="Título de la tarea *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input"
              required
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="textarea"
              rows="3"
            />
            <button type="submit" className="btn btn-primary">
              ➕ Agregar Tarea
            </button>
          </form>
        </div>

        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="card empty-state">
              <p>No hay tareas. ¡Crea tu primera tarea! 🚀</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className={`card task-card ${task.completed ? 'completed' : ''}`}>
                {editingTask === task._id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      defaultValue={task.title}
                      onBlur={(e) => updateTask(task._id, { title: e.target.value })}
                      className="input"
                      autoFocus
                    />
                    <textarea
                      defaultValue={task.description}
                      onBlur={(e) => updateTask(task._id, { description: e.target.value })}
                      className="textarea"
                      rows="2"
                    />
                    <button onClick={() => setEditingTask(null)} className="save-btn">
                      ✓ Guardar
                    </button>
                  </div>
                ) : (
                  <div className="task-content">
                    <div className="task-main">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task)}
                        className="checkbox"
                      />
                      <div className="task-info">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        <span className="task-date">
                          {new Date(task.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => setEditingTask(task._id)} className="btn btn-edit">
                        ✏️ Editar
                      </button>
                      <button onClick={() => deleteTask(task._id)} className="btn btn-delete">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <div className="card stats-card">
            <div className="stats">
              <div className="stat">
                <p className="stat-number">{tasks.length}</p>
                <p className="stat-label">Total</p>
              </div>
              <div className="stat">
                <p className="stat-number green">{tasks.filter(t => t.completed).length}</p>
                <p className="stat-label">Completadas</p>
              </div>
              <div className="stat">
                <p className="stat-number orange">{tasks.filter(t => !t.completed).length}</p>
                <p className="stat-label">Pendientes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;