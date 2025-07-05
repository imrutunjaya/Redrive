import React, { useState } from 'react';
import { 
  Calculator, 
  BookOpen, 
  Calendar, 
  PenTool, 
  Target, 
  GraduationCap,
  Clock,
  Brain,
  FileText,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';

export const StudentTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [gpaEntries, setGpaEntries] = useState([
    { course: '', credits: '', grade: '' }
  ]);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const tools = [
    { id: 'calculator', icon: Calculator, label: 'Calculator', color: 'blue' },
    { id: 'gpa', icon: GraduationCap, label: 'GPA Calculator', color: 'green' },
    { id: 'pomodoro', icon: Clock, label: 'Pomodoro Timer', color: 'red' },
    { id: 'flashcards', icon: Brain, label: 'Flashcards', color: 'purple' },
    { id: 'templates', icon: FileText, label: 'Note Templates', color: 'indigo' },
    { id: 'goals', icon: Target, label: 'Goal Tracker', color: 'orange' },
  ];

  const addGpaEntry = () => {
    setGpaEntries([...gpaEntries, { course: '', credits: '', grade: '' }]);
  };

  const updateGpaEntry = (index: number, field: string, value: string) => {
    const updated = gpaEntries.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    );
    setGpaEntries(updated);
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    gpaEntries.forEach(entry => {
      if (entry.credits && entry.grade) {
        const credits = parseFloat(entry.credits);
        const gradePoints = getGradePoints(entry.grade);
        totalPoints += credits * gradePoints;
        totalCredits += credits;
      }
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const getGradePoints = (grade: string) => {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[grade] || 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const noteTemplates = [
    {
      title: 'Cornell Notes',
      description: 'Structured note-taking system with cues, notes, and summary',
      template: `# Cornell Notes - [Subject] - [Date]

## Cue Column
- Key points
- Questions
- Keywords

## Note-Taking Area
### Main Topic
- Detailed notes
- Examples
- Explanations

### Subtopic
- Supporting details
- Important facts

## Summary
[Write a brief summary of the main points covered]

---
**Review Date:** [Date]
**Next Review:** [Date]`
    },
    {
      title: 'Study Guide',
      description: 'Comprehensive study guide template',
      template: `# Study Guide - [Subject] - [Exam Date]

## Key Concepts
1. **Concept 1**
   - Definition:
   - Examples:
   - Applications:

2. **Concept 2**
   - Definition:
   - Examples:
   - Applications:

## Formulas & Equations
- Formula 1: 
- Formula 2:

## Practice Problems
1. Problem:
   Solution:

2. Problem:
   Solution:

## Review Checklist
- [ ] Read chapter notes
- [ ] Complete practice problems
- [ ] Review flashcards
- [ ] Take practice quiz`
    },
    {
      title: 'Lecture Notes',
      description: 'Standard lecture note template',
      template: `# Lecture Notes - [Course] - [Date]

**Professor:** [Name]
**Topic:** [Lecture Topic]

## Main Points
### Point 1
- Details
- Examples

### Point 2
- Details
- Examples

## Questions
- Question 1?
- Question 2?

## Action Items
- [ ] Review reading assignment
- [ ] Complete homework
- [ ] Prepare for next class

## Additional Resources
- Textbook pages:
- Online resources:
- Study group notes:`
    }
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Tools</h2>
        <p className="text-gray-600">Productivity tools designed specifically for students</p>
      </div>

      {/* Tool Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTab(tool.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tool.id
                ? `bg-${tool.color}-100 text-${tool.color}-700 border-2 border-${tool.color}-300`
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <tool.icon className="h-4 w-4" />
            <span className="font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
        {activeTab === 'calculator' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Scientific Calculator
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 text-white font-mono">
              <div className="text-right text-2xl mb-4 bg-gray-800 p-3 rounded">0</div>
              <div className="grid grid-cols-4 gap-2">
                {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn) => (
                  <button
                    key={btn}
                    className={`p-3 rounded font-semibold transition-colors ${
                      ['C', '±', '%'].includes(btn) ? 'bg-gray-600 hover:bg-gray-500' :
                      ['÷', '×', '-', '+', '='].includes(btn) ? 'bg-orange-600 hover:bg-orange-500' :
                      'bg-gray-700 hover:bg-gray-600'
                    } ${btn === '0' ? 'col-span-2' : ''}`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gpa' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
              GPA Calculator
            </h3>
            <div className="space-y-4">
              {gpaEntries.map((entry, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={entry.course}
                    onChange={(e) => updateGpaEntry(index, 'course', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={entry.credits}
                    onChange={(e) => updateGpaEntry(index, 'credits', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={entry.grade}
                    onChange={(e) => updateGpaEntry(index, 'grade', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <button
                  onClick={addGpaEntry}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Course
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current GPA</p>
                  <p className="text-2xl font-bold text-green-600">{calculateGPA()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-red-600" />
              Pomodoro Timer
            </h3>
            <div className="text-center space-y-6">
              <div className="text-6xl font-mono font-bold text-red-600">
                {formatTime(timeLeft)}
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isTimerRunning 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimeLeft(pomodoroTime * 60);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="flex justify-center space-x-4">
                {[25, 15, 5].map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setPomodoroTime(time);
                      setTimeLeft(time * 60);
                      setIsTimerRunning(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pomodoroTime === time
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Note Templates
            </h3>
            <div className="grid gap-4">
              {noteTemplates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{template.title}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(template.template);
                        alert('Template copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-32">
                    {template.template.substring(0, 200)}...
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Goal Tracker
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Academic Goals</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintain 3.5+ GPA</span>
                      <div className="w-20 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Complete all assignments</span>
                      <div className="w-20 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Study Goals</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Study 2 hours daily</span>
                      <div className="w-20 bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Read 1 chapter/week</span>
                      <div className="w-20 bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                Add New Goal
              </button>
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Flashcards
            </h3>
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl border-2 border-purple-200 min-h-48 flex items-center justify-center">
                <div>
                  <h4 className="text-xl font-semibold text-purple-800 mb-2">What is photosynthesis?</h4>
                  <p className="text-sm text-purple-600">Click to reveal answer</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Hard
                </button>
                <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  Medium
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Easy
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                Card 1 of 25 • Biology Chapter 3
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};