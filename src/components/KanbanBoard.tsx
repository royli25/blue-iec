import React, { useState } from 'react';
import { Plus, FileText, Calendar, Tag } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  priority?: 'Highest Priority' | 'High Priority' | 'Medium Priority' | 'Low Priority';
  course?: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'ACAD 406: Queens entrepreneurship competition.',
      description: 'requires 5 page business plan',
      date: 'October 18, 2025',
      status: 'not-started'
    },
    {
      id: '2',
      title: 'coffee chat with top consulting club members (high/medium/low tier)',
      description: 'make sure to leave good impression on e-board. look for the director of recruitment.',
      status: 'not-started'
    },
    {
      id: '3',
      title: 'ACAD 406: Marshall Veterbi Pitch Mixer',
      date: 'November 24, 2025',
      status: 'not-started'
    },
    {
      id: '4',
      title: 'gesm120 readings',
      status: 'completed'
    },
    {
      id: '5',
      title: 'make template for abbie',
      status: 'completed'
    },
    {
      id: '6',
      title: 'blueprint feature',
      status: 'completed'
    },
    {
      id: '7',
      title: 'information mini-site',
      date: 'September 30, 2025',
      priority: 'Medium Priority',
      course: 'ACAD 274',
      status: 'completed'
    },
    {
      id: '8',
      title: 'a7 mom test',
      priority: 'Highest Priority',
      course: 'ACAD 406',
      status: 'completed'
    },
    {
      id: '9',
      title: 'a9 seven generation thinking',
      date: 'September 16, 2025',
      priority: 'Highest Priority',
      course: 'ACAD 183',
      status: 'completed'
    },
    {
      id: '10',
      title: 'MSG Calvin cheong',
      status: 'completed'
    }
  ]);

  const columns = [
    { id: 'not-started', title: 'Not started', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In progress', color: 'bg-blue-100' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100' }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Highest Priority': return 'bg-red-500 text-white';
      case 'High Priority': return 'bg-orange-500 text-white';
      case 'Medium Priority': return 'bg-yellow-500 text-white';
      case 'Low Priority': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCourseColor = (course?: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500'];
    if (!course) return 'bg-muted text-muted-foreground';
    const hash = course.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length] + ' text-white';
  };

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ));
  };

  const addNewTask = (status: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New task',
      status: status as Task['status']
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <>
      {/* Title aligned with page padding (same as site) */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-foreground">My BluePrint</h1>
      </div>
      
      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto scale-75 origin-left">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-border/70 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-foreground/40 rounded-full"></div>
                <h3 className="text-foreground font-semibold">{column.title}</h3>
              </div>
              
              <div className="space-y-3">
                {tasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/70 p-4 cursor-pointer hover:bg-card/90 transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData('text/plain');
                        moveTask(taskId, column.id);
                      }}
                    >
                      <h4 className="text-foreground font-medium mb-2">{task.title}</h4>
                      
                      {task.description && (
                        <p className="text-muted-foreground text-sm mb-2">{task.description}</p>
                      )}
                      
                      {task.date && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{task.date}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {task.priority && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.course && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCourseColor(task.course)}`}>
                            {task.course}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                
                <button
                  onClick={() => addNewTask(column.id)}
                  className="w-full bg-card/80 backdrop-blur-md hover:bg-card/90 rounded-2xl border-2 border-dashed border-border/70 p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New page</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default KanbanBoard;
