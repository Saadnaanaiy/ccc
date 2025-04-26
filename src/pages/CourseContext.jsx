import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlusCircle, FiEdit, FiTrash2, FiMove, FiGrid, FiLayers, FiPlayCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isInstructor } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  
  // Section form state
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  
  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [lessonData, setLessonData] = useState({
    titre: '',
    dureeMinutes: 5,
    estGratuite: false
  });

  useEffect(() => {
    // Redirect if not instructor
    if (user && !isInstructor()) {
      navigate('/');
      return;
    }

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/instructor/courses/${id}`);
        setCourse(response.data.course);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourse();
    }
  }, [user, isInstructor, navigate, id]);

  const refreshCourse = async () => {
    try {
      const response = await axios.get(`/instructor/courses/${id}`);
      setCourse(response.data.course);
    } catch (err) {
      console.error('Error refreshing course data:', err);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    
    if (!sectionTitle.trim()) {
      return;
    }
    
    try {
      if (editingSectionId) {
        // Update existing section
        await axios.put(`/instructor/sections/${editingSectionId}`, {
          titre: sectionTitle
        });
      } else {
        // Add new section
        await axios.post(`/instructor/courses/${id}/sections`, {
          titre: sectionTitle,
          ordre: course.sections ? course.sections.length + 1 : 1
        });
      }
      
      // Reset form and refresh course data
      setSectionTitle('');
      setEditingSectionId(null);
      setShowSectionForm(false);
      await refreshCourse();
    } catch (err) {
      console.error('Error saving section:', err);
      setError('Failed to save section. Please try again.');
    }
  };

  const handleEditSection = (section) => {
    setSectionTitle(section.titre);
    setEditingSectionId(section.id);
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section and all its lessons?')) {
      return;
    }
    
    try {
      await axios.delete(`/instructor/sections/${sectionId}`);
      await refreshCourse();
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Failed to delete section. Please try again.');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    if (!lessonData.titre.trim()) {
      return;
    }
    
    try {
      // Get section's current lesson count for ordering
      const section = course.sections.find(s => s.id === currentSectionId);
      const lessonOrder = section.lecons ? section.lecons.length + 1 : 1;
      
      await axios.post(`/instructor/sections/${currentSectionId}/lessons`, {
        ...lessonData,
        ordre: lessonOrder
      });
      
      // Reset form and refresh course data
      setLessonData({
        titre: '',
        dureeMinutes: 5,
        estGratuite: false
      });
      setShowLessonForm(false);
      await refreshCourse();
    } catch (err) {
      console.error('Error adding lesson:', err);
      setError('Failed to add lesson. Please try again.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      await axios.delete(`/instructor/lessons/${lessonId}`);
      await refreshCourse();
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson. Please try again.');
    }
  };

  const openAddLessonForm = (sectionId) => {
    setCurrentSectionId(sectionId);
    setShowLessonForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Content</h2>
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate('/instructor/dashboard')}
              className="mr-4 text-neutral-600 hover:text-neutral-800"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{course.titre}</h1>
              <p className="text-neutral-600">Course Content Management</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Link 
              to={`/instructor/courses/${id}/edit`}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-neutral-700 flex items-center"
            >
              <FiEdit className="mr-2" /> Edit Course Details
            </Link>
            <Link 
              to={`/instructor/courses/${id}/preview`}
              className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md flex items-center"
            >
              <FiPlayCircle className="mr-2" /> Preview Course
            </Link>
          </div>
        </div>
        
        {/* Add Section Button */}
        <div className="mb-6">
          {showSectionForm ? (
            <form onSubmit={handleAddSection} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">
                {editingSectionId ? 'Edit Section' : 'Add New Section'}
              </h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Introduction to the Course"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionForm(false);
                    setSectionTitle('');
                    setEditingSectionId(null);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary text-white rounded-md"
                >
                  {editingSectionId ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowSectionForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlusCircle /> Add New Section
            </button>
          )}
        </div>
        
        {/* Sections List */}
        <div className="space-y-6">
          {course.sections && course.sections.length > 0 ? (
            course.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-semibold flex items-center">
                    <FiLayers className="mr-2 text-primary" />
                    {section.titre}
                  </h3>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="text-neutral-500 hover:text-primary mr-2"
                      title="Edit section"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-neutral-500 hover:text-red-600"
                      title="Delete section"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Lessons List */}
                <div className="divide-y divide-gray-100">
                  {section.lecons && section.lecons.length > 0 ? (
                    section.lecons.map((lesson) => (
                      <div key={lesson.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <span className="mr-3 text-gray-400">
                            <FiMove size={14} />
                          </span>
                          <div>
                            <h4 className="font-medium">{lesson.titre}</h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>{lesson.dureeMinutes} min</span>
                              {lesson.estGratuite && (
                                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 rounded">Free</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link
                            to={`/instructor/lessons/${lesson.id}/edit`}
                            className="text-neutral-500 hover:text-primary mr-2"
                            title="Edit lesson content"
                          >
                            <FiEdit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-neutral-500 hover:text-red-600"
                            title="Delete lesson"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No lessons in this section yet
                    </div>
                  )}
                </div>
                
                {/* Add Lesson Button */}
                <div className="p-4">
                  {showLessonForm && currentSectionId === section.id ? (
                    <form onSubmit={handleAddLesson} className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-semibold mb-3">Add New Lesson</h3>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lesson Title
                        </label>
                        <input
                          type="text"
                          value={lessonData.titre}
                          onChange={(e) => setLessonData({...lessonData, titre: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="e.g. Getting Started with JavaScript"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={lessonData.dureeMinutes}
                          onChange={(e) => setLessonData({...lessonData, dureeMinutes: e.target.value})}
                          min="1"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`free-lesson-${section.id}`}
                            checked={lessonData.estGratuite}
                            onChange={(e) => setLessonData({...lessonData, estGratuite: e.target.checked})}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor={`free-lesson-${section.id}`} className="ml-2 block text-sm text-gray-700">
                            Make this a free preview lesson
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLessonForm(false);
                            setLessonData({
                              titre: '',
                              dureeMinutes: 5,
                              estGratuite: false
                            });
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-primary text-white rounded-md"
                        >
                          Add Lesson
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => openAddLessonForm(section.id)}
                      className="w-full py-2 border border-dashed border-gray-300 rounded-md hover:border-primary hover:text-primary flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                      <FiPlusCircle size={14} /> Add Lesson
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mb-4 text-gray-400">
                <FiGrid size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Sections Yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your course by adding sections and lessons
              </p>
              <button
                onClick={() => setShowSectionForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md inline-flex items-center"
              >
                <FiPlusCircle className="mr-2" /> Add Your First Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;