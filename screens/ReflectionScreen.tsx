import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import PointsSummary from '../components/PointsSummary';
import { MOOD_EMOJIS, MOOD_COLORS } from '../constants';
import { MoodEntry, ReflectionEntry, StoryEntry } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const ReflectionScreen: React.FC = () => {
  const { moodHistory, reflections, stories, addReflection, ageGroup } = useAppContext();
  const { t } = useTranslation();
  const [newReflection, setNewReflection] = useState('');
  const [expandedStoryDate, setExpandedStoryDate] = useState<string | null>(null);

  const screenTitle = t(`home.age_${ageGroup}.reflections_title`);

  const prompt = useMemo(() => {
    const promptsArray = t('reflections_screen.prompts');
    if (Array.isArray(promptsArray) && promptsArray.length > 0) {
        return promptsArray[Math.floor(Math.random() * promptsArray.length)];
    }
    // Fallback in case translation fails
    return "What was the best part of your day?";
  }, [t]);

  const handleAddReflection = () => {
    if (newReflection.trim()) {
      addReflection({
        prompt,
        text: newReflection,
        date: new Date().toISOString(),
      });
      setNewReflection('');
    }
  };

  const toggleStoryExpansion = (date: string) => {
    setExpandedStoryDate(currentDate => currentDate === date ? null : date);
  };

  const combinedEntries = useMemo(() => {
    return [...moodHistory, ...reflections, ...stories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [moodHistory, reflections, stories]);

  const getTheme = () => {
    switch (ageGroup) {
        case '10-12':
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                accent: 'gray',
                button: 'bg-gray-600 hover:bg-gray-700'
            };
        case '7-9':
        default:
            return {
                bg: 'bg-violet-100',
                text: 'text-violet-800',
                accent: 'violet',
                button: 'bg-violet-500 hover:bg-violet-600'
            };
    }
  }
  const theme = getTheme();


  const renderEntry = (entry: MoodEntry | ReflectionEntry | StoryEntry, index: number) => {
    if ('mood' in entry) {
        // Mood Entry
        return (
            <div className="flex items-start space-x-3">
            <span className={`text-3xl px-2 py-1 rounded-md ${MOOD_COLORS[entry.mood]}`}>{MOOD_EMOJIS[entry.mood]}</span>
            <div>
                <p className="font-bold text-gray-800">{t('reflections_screen.feeling_mood').replace('{mood}', t(`moods.${entry.mood}`))}</p>
                {entry.note && <p className="text-gray-600">"{ entry.note }"</p>}
            </div>
            </div>
        )
    }
    if ('content' in entry) {
        const isExpanded = expandedStoryDate === entry.date;
        // Story Entry
        return (
             <div className="cursor-pointer" onClick={() => toggleStoryExpansion(entry.date)}>
                <div className="flex items-start space-x-3">
                    <span className={`text-3xl px-2 py-1 rounded-md bg-purple-200`}>📖</span>
                    <div>
                        <p className="font-bold text-gray-800">{t('reflections_screen.story_wrote').replace('{title}', entry.title)}</p>
                        {!isExpanded ? (
                            <p className="text-gray-600 italic">"{entry.content[0]}..." <span className="font-semibold text-purple-600">{t('reflections_screen.story_click_to_read')}</span></p>
                        ) : (
                            <p className="text-gray-600 italic"><span className="font-semibold text-purple-600">{t('reflections_screen.story_click_to_collapse')}</span></p>
                        )}
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-2 story-content-reflections">
                        {entry.content.map((part, partIndex) => (
                            <div key={partIndex} className={`p-2 rounded-lg text-sm ${partIndex % 2 === 0 ? 'bg-purple-100 text-purple-800 text-left' : 'bg-amber-100 text-amber-800 text-right'}`}>
                               {partIndex % 2 === 0 && <span className="font-bold text-xs opacity-70 block">{t('story_creator_screen.buddy_says')}</span>}
                               {part}
                               {partIndex % 2 !== 0 && <span className="font-bold text-xs opacity-70 block text-right">{t('story_creator_screen.you_said')}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
     // Reflection Entry
    return (
        <div>
        {entry.prompt ? (
            <>
            <p className="text-sm text-gray-600 font-semibold italic mb-1">"{ entry.prompt }"</p>
            <p className="text-gray-800">{entry.text}</p>
            </>
        ) : (
            <>
            <p className="font-semibold text-gray-800">{t('reflections_screen.reflection_title')}</p>
            <p className="text-gray-700">{entry.text}</p>
            </>
        )}
        </div>
    )
  }

  return (
    <ScreenWrapper title={screenTitle}>
      <style>{`
        .story-content-reflections {
            scrollbar-width: thin;
            scrollbar-color: #C084FC #E9D5FF;
        }
      `}</style>
      <div className="flex flex-col justify-start pt-8 flex-grow">
        <div className="space-y-6">
          <PointsSummary />
          
          {/* New Reflection Section */}
          <div className={`${theme.bg} p-4 rounded-lg`}>
              <h2 className={`text-xl font-bold ${theme.text} mb-2`}>{t('reflections_screen.reflection_title')}</h2>
              <p className={`${theme.text} mb-2 italic`}>"{prompt}"</p>
              <textarea
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-${theme.accent}-400 text-gray-800 bg-white`}
                  rows={3}
                  placeholder={t('reflections_screen.reflection_placeholder')}
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
              />
              <button
                  onClick={handleAddReflection}
                  disabled={!newReflection.trim()}
                  className={`w-full mt-2 ${theme.button} text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300`}
              >
                  {t('reflections_screen.save_reflection_button')}
              </button>
          </div>

          {/* History Section */}
          <div>
            <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">{t('reflections_screen.journal_title')}</h2>
            <div className="space-y-4 max-h-[calc(100vh-30rem)] overflow-y-auto pr-2">
              {combinedEntries.length > 0 ? (
                combinedEntries.map((entry, index) => (
                  <div key={entry.date} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500 mb-2">{new Date(entry.date).toLocaleString('en-US')}</p>
                    {renderEntry(entry, index)}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">{t('reflections_screen.journal_empty')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default ReflectionScreen;
