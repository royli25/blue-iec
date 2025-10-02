import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  gradeLevel: string;
  demographic: string;
  school: string;
  gpa: string;
  sat: string;
  activities: {name: string, description: string}[];
  apExams: { exam: string; score: string }[];
  awards: { name: string; level: string }[];
}

export interface ProfileContext {
  profileData: ProfileData | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  getContextualSystemPrompt: (basePrompt: string) => string;
}

export const useProfileContext = (): ProfileContext => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileData = async () => {
    if (!user) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load profile details
      const { data: profileDetails } = await supabase
        .from('profile_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileDetails) {
        setProfileData({
          gradeLevel: profileDetails.grade_level || '',
          demographic: profileDetails.demographic || '',
          school: profileDetails.school || '',
          gpa: profileDetails.gpa || '',
          sat: profileDetails.sat || '',
          activities: profileDetails.activities || [{name: '', description: ''}],
          apExams: profileDetails.ap_exams || [{ exam: '', score: '' }],
          awards: profileDetails.awards || [{ name: '', level: '' }],
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfileData();
  };

  const getContextualSystemPrompt = (basePrompt: string): string => {
    if (!profileData) {
      return basePrompt;
    }

    let contextualPrompt = basePrompt;
    
    // Add profile data as JSON context
    const profileJson = JSON.stringify(profileData, null, 2);
    contextualPrompt += `\n\n## User Profile Context (JSON)\n\`\`\`json\n${profileJson}\n\`\`\`\n\n`;

    // Add instructions for using the context
    contextualPrompt += `\n\n## Instructions for Using Profile Context\n- Use the profile data above to provide personalized recommendations\n- Consider the student's academic level, demographics, and current activities\n- Reference specific details from their profile when relevant\n- Provide context-aware suggestions that match their profile\n- Analyze their academic strengths, extracurriculars, and achievements to give targeted advice\n\n`;

    return contextualPrompt;
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  return {
    profileData,
    isLoading,
    refreshProfile,
    getContextualSystemPrompt,
  };
};
