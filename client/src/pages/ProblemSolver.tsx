import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProblem } from '../contexts/ProblemContext';
import { 
  Play, 
  Lightbulb, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Send
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const ProblemSolver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProblem, validateSolution, getHint, getExplanation, loading } = useProblem();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai', message: string }>>([]);

  useEffect(() => {
    if (currentProblem?.solutionTemplate) {
      setCode(currentProblem.solutionTemplate);
    }
  }, [currentProblem]);

  const handleRunCode = async () => {
    if (!id || !code) return;
    
    try {
      const validation = await validateSolution(id, code);
      setResult(validation);
    } catch (error) {
      console.error('Failed to validate solution:', error);
    }
  };

  const handleGetHint = async () => {
    if (!id) return;
    
    try {
      const hintText = await getHint(id, 1);
      setHint(hintText);
      setShowHint(true);
    } catch (error) {
      console.error('Failed to get hint:', error);
    }
  };

  const handleGetExplanation = async () => {
    if (!id) return;
    
    try {
      const explanationData = await getExplanation(id, code);
      setExplanation(explanationData);
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to get explanation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: 'I understand your question. Let me help you with that...' 
      }]);
    }, 1000);
  };

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{currentProblem.title}</h1>
              <div className="flex items-center space-x-2">
                <span className={`badge ${
                  currentProblem.difficulty === 'Easy' ? 'badge-success' :
                  currentProblem.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                }`}>
                  {currentProblem.difficulty}
                </span>
                <span className="badge badge-secondary">{currentProblem.category}</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{currentProblem.description}</p>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h3>
            <div className="space-y-3">
              {currentProblem.testCases.map((testCase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input:</span>
                      <pre className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">{testCase.input}</pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expected Output:</span>
                      <pre className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">{testCase.output}</pre>
                    </div>
                  </div>
                  {testCase.explanation && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Explanation:</span>
                      <p className="mt-1 text-gray-600">{testCase.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask AI Assistant</h3>
            <div className="space-y-4">
              <div className="h-48 border rounded-lg p-3 overflow-y-auto bg-gray-50">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`mb-3 ${chat.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-lg ${
                      chat.type === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white border text-gray-700'
                    }`}>
                      {chat.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="btn btn-primary"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Your Solution</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGetHint}
                  className="btn btn-outline btn-sm"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Hint
                </button>
                <button
                  onClick={handleGetExplanation}
                  className="btn btn-outline btn-sm"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Explanation
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={loading}
                  className="btn btn-primary btn-sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {loading ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>
            
            <div className="h-96">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    result.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tests Passed:</span>
                    <span className="ml-2 text-gray-600">{result.passedTests}/{result.totalTests}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time Complexity:</span>
                    <span className="ml-2 text-gray-600">{result.timeComplexity}</span>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Errors:</span>
                    <ul className="mt-1 list-disc list-inside text-red-600">
                      {result.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Suggestions:</span>
                    <ul className="mt-1 list-disc list-inside text-blue-600">
                      {result.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hint Modal */}
          {showHint && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hint</h3>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-700">{hint}</p>
            </div>
          )}

          {/* Explanation Modal */}
          {showExplanation && explanation && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Explanation</h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Algorithm:</h4>
                  <p className="text-gray-700 mt-1">{explanation.algorithm}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Key Concepts:</h4>
                  <ul className="mt-1 list-disc list-inside text-gray-700">
                    {explanation.keyConcepts?.map((concept: string, index: number) => (
                      <li key={index}>{concept}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver; 