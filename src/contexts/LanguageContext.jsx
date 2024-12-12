import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Create the context
const LanguageContext = createContext();

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          settings: {
            title: 'Settings',
            savedSuccessfully: 'Settings saved successfully',
            failedToSave: 'Failed to save settings',
            notifications: {
              title: 'Notifications',
              emailNotifications: {
                title: 'Email Notifications',
                description: 'Receive email notifications for important updates'
              },
              pushNotifications: {
                title: 'Push Notifications',
                description: 'Receive push notifications on your device'
              },
              marketingEmails: {
                title: 'Marketing Emails',
                description: 'Receive marketing and promotional emails'
              }
            },
            appearance: {
              title: 'Appearance',
              theme: {
                title: 'Theme',
                description: 'Choose between light and dark mode',
                light: 'Light',
                dark: 'Dark'
              },
              language: {
                title: 'Language',
                description: 'Select your preferred language'
              }
            },
            timezone: {
              title: 'Timezone',
              description: 'Select your timezone'
            },
            privacy: {
              title: 'Privacy & Security',
              twoFactorAuth: {
                title: 'Two-Factor Authentication',
                description: 'Add an extra layer of security to your account'
              },
              dataSharing: {
                title: 'Data Sharing',
                description: 'Allow sharing of usage data to improve our services'
              },
              activityLog: {
                title: 'Activity Log',
                description: 'Keep track of account activity'
              }
            },
            buttons: {
              save: 'Save Changes'
            }
          },
          languages: {
            en: 'English',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            zh: 'Chinese',
            ko: 'Korean',
            ar: 'Arabic',
            hi: 'Hindi',
            pt: 'Portuguese'
          }
        }
      }
      // Add other language translations here
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
