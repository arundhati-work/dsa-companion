import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Code, 
  Target, 
  BarChart3, 
  Settings,
  Plus,
  Zap
} from 'lucide-react';
import { useProblem } from '../contexts/ProblemContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { generateProblem } = useProblem();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Problems', href: '/problems', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleGenerateProblem = async () => {
    try {
      await generateProblem('arrays', 'medium', 'data-structures');
    } catch (error) {
      console.error('Failed to generate problem:', error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleGenerateProblem}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Problem</span>
              </button>
              <Link
                to="/practice"
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Zap className="h-4 w-4" />
                <span>Quick Practice</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {[
                'Arrays & Strings',
                'Linked Lists',
                'Trees & Graphs',
                'Dynamic Programming',
                'Sorting & Searching',
                'Greedy Algorithms',
              ].map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Levels */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Difficulty
            </h3>
            <div className="space-y-1">
              {[
                { name: 'Easy', color: 'text-green-600' },
                { name: 'Medium', color: 'text-yellow-600' },
                { name: 'Hard', color: 'text-red-600' },
              ].map((level) => (
                <button
                  key={level.name}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors ${level.color}`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 