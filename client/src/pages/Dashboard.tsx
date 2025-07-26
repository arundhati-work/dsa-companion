import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProblem } from '../contexts/ProblemContext';
import { 
  Brain, 
  Code, 
  Target, 
  BarChart3, 
  Plus,
  Play,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { generateProblem, loading } = useProblem();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('');

  const handleGenerateProblem = async () => {
    try {
      const problem = await generateProblem(topic, difficulty, category);
      navigate(`/problem/${problem.id}`);
    } catch (error) {
      console.error('Failed to generate problem:', error);
    }
  };

  const stats = [
    { name: 'Problems Solved', value: '24', icon: CheckCircle, color: 'text-green-600' },
    { name: 'Current Streak', value: '7 days', icon: TrendingUp, color: 'text-blue-600' },
    { name: 'Time Spent', value: '12.5 hrs', icon: Clock, color: 'text-purple-600' },
    { name: 'Accuracy', value: '87%', icon: Target, color: 'text-orange-600' },
  ];

  const recentProblems = [
    { id: '1', title: 'Two Sum', difficulty: 'Easy', status: 'Completed', category: 'Arrays' },
    { id: '2', title: 'Valid Parentheses', difficulty: 'Medium', status: 'In Progress', category: 'Stacks' },
    { id: '3', title: 'Binary Tree Inorder Traversal', difficulty: 'Medium', status: 'Completed', category: 'Trees' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to tackle some algorithms? Let's continue your learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-50`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generate Problem Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-6">
            <Brain className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Generate New Problem</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., arrays, linked lists, dynamic programming"
                className="input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                >
                  <option value="">Any Category</option>
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked-lists">Linked Lists</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dynamic-programming">Dynamic Programming</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleGenerateProblem}
              disabled={loading || !topic}
              className="w-full btn btn-primary btn-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Generate Problem
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Recent Problems */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Code className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Problems</h2>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentProblems.map((problem) => (
              <div key={problem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">{problem.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`badge ${
                      problem.difficulty === 'Easy' ? 'badge-success' :
                      problem.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">{problem.category}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    problem.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {problem.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Target className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium">Practice Mode</span>
          </button>
          <button className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium">View Progress</span>
          </button>
          <button className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Brain className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium">Take Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 