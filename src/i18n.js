import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      settings: {
        title: 'Settings',
        description: 'Manage your application settings and preferences',
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
        notifications: {
          title: 'Notifications',
          email: {
            title: 'Email Notifications',
            description: 'Receive important updates via email'
          },
          push: {
            title: 'Push Notifications',
            description: 'Get instant notifications in your browser'
          },
          sms: {
            title: 'SMS Notifications',
            description: 'Receive notifications via text message'
          },
          marketingEmails: {
            title: 'Marketing Emails',
            description: 'Receive promotional emails and newsletters'
          }
        },
        buttons: {
          save: 'Save Changes'
        },
        savedSuccessfully: 'Settings saved successfully',
        failedToSave: 'Failed to save settings'
      },
      languages: {
        en: 'English',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        zh: '中文',
        ko: '한국어',
        ar: 'العربية',
        hi: 'हिंदी',
        pt: 'Português',
        ru: 'Русский'
      }
    }
  },
  es: {
    translation: {
      settings: {
        title: 'Configuración',
        description: 'Administra la configuración y preferencias de tu aplicación',
        appearance: {
          title: 'Apariencia',
          theme: {
            title: 'Tema',
            description: 'Elige entre modo claro y oscuro',
            light: 'Claro',
            dark: 'Oscuro'
          },
          language: {
            title: 'Idioma',
            description: 'Selecciona tu idioma preferido'
          }
        },
        notifications: {
          title: 'Notificaciones',
          email: {
            title: 'Notificaciones por correo',
            description: 'Recibe actualizaciones importantes por correo'
          },
          push: {
            title: 'Notificaciones push',
            description: 'Recibe notificaciones instantáneas en tu navegador'
          },
          sms: {
            title: 'Notificaciones SMS',
            description: 'Recibe notificaciones por mensaje de texto'
          },
          marketingEmails: {
            title: 'Correos de marketing',
            description: 'Recibe correos promocionales y boletines'
          }
        },
        buttons: {
          save: 'Guardar cambios'
        },
        savedSuccessfully: 'Configuración guardada exitosamente',
        failedToSave: 'Error al guardar la configuración'
      },
      languages: {
        en: 'Inglés',
        es: 'Español',
        fr: 'Francés',
        de: 'Alemán',
        zh: 'Chino',
        ko: 'Coreano',
        ar: 'Árabe',
        hi: 'Hindi',
        pt: 'Portugués',
        ru: 'Ruso'
      }
    }
  },
  fr: {
    translation: {
      settings: {
        title: 'Paramètres',
        description: 'Gérez les paramètres et les préférences de votre application',
        appearance: {
          title: 'Apparence',
          theme: {
            title: 'Thème',
            description: 'Choisissez entre le mode clair et sombre',
            light: 'Clair',
            dark: 'Sombre'
          },
          language: {
            title: 'Langue',
            description: 'Sélectionnez votre langue préférée'
          }
        },
        notifications: {
          title: 'Notifications',
          email: {
            title: 'Notifications par email',
            description: 'Recevez des mises à jour importantes par email'
          },
          push: {
            title: 'Notifications push',
            description: 'Recevez des notifications instantanées dans votre navigateur'
          },
          sms: {
            title: 'Notifications SMS',
            description: 'Recevez des notifications par message texte'
          },
          marketingEmails: {
            title: 'Emails marketing',
            description: 'Recevez des emails promotionnels et des newsletters'
          }
        },
        buttons: {
          save: 'Enregistrer les modifications'
        },
        savedSuccessfully: 'Paramètres enregistrés avec succès',
        failedToSave: 'Échec de l\'enregistrement des paramètres'
      },
      languages: {
        en: 'Anglais',
        es: 'Espagnol',
        fr: 'Français',
        de: 'Allemand',
        zh: 'Chinois',
        ko: 'Coréen',
        ar: 'Arabe',
        hi: 'Hindi',
        pt: 'Portugais',
        ru: 'Russe'
      }
    }
  },
  ru: {
    translation: {
      settings: {
        title: 'Настройки',
        description: 'Управление настройками и предпочтениями приложения',
        appearance: {
          title: 'Внешний вид',
          theme: {
            title: 'Тема',
            description: 'Выберите между светлой и темной темой',
            light: 'Светлая',
            dark: 'Темная'
          },
          language: {
            title: 'Язык',
            description: 'Выберите предпочитаемый язык'
          }
        },
        notifications: {
          title: 'Уведомления',
          email: {
            title: 'Уведомления по email',
            description: 'Получайте важные обновления по электронной почте'
          },
          push: {
            title: 'Push-уведомления',
            description: 'Получайте мгновенные уведомления в браузере'
          },
          sms: {
            title: 'SMS-уведомления',
            description: 'Получайте уведомления по SMS'
          },
          marketingEmails: {
            title: 'Маркетинговые письма',
            description: 'Получайте рекламные письма и новости'
          }
        },
        buttons: {
          save: 'Сохранить изменения'
        },
        savedSuccessfully: 'Настройки успешно сохранены',
        failedToSave: 'Не удалось сохранить настройки'
      },
      languages: {
        en: 'Английский',
        es: 'Испанский',
        fr: 'Французский',
        de: 'Немецкий',
        zh: 'Китайский',
        ko: 'Корейский',
        ar: 'Арабский',
        hi: 'Хинди',
        pt: 'Португальский',
        ru: 'Русский'
      }
    }
  },
  de: {
    translation: {
      settings: {
        title: 'Einstellungen',
        description: 'Verwalten Sie Ihre Anwendungseinstellungen und Präferenzen',
        appearance: {
          title: 'Erscheinungsbild',
          theme: {
            title: 'Design',
            description: 'Wählen Sie zwischen hellem und dunklem Modus',
            light: 'Hell',
            dark: 'Dunkel'
          },
          language: {
            title: 'Sprache',
            description: 'Wählen Sie Ihre bevorzugte Sprache'
          }
        },
        notifications: {
          title: 'Benachrichtigungen',
          email: {
            title: 'E-Mail-Benachrichtigungen',
            description: 'Erhalten Sie wichtige Updates per E-Mail'
          },
          push: {
            title: 'Push-Benachrichtigungen',
            description: 'Erhalten Sie sofortige Benachrichtigungen in Ihrem Browser'
          },
          sms: {
            title: 'SMS-Benachrichtigungen',
            description: 'Erhalten Sie Benachrichtigungen per SMS'
          },
          marketingEmails: {
            title: 'Marketing-E-Mails',
            description: 'Erhalten Sie Werbe-E-Mails und Newsletter'
          }
        },
        buttons: {
          save: 'Änderungen speichern'
        },
        savedSuccessfully: 'Einstellungen erfolgreich gespeichert',
        failedToSave: 'Fehler beim Speichern der Einstellungen'
      },
      languages: {
        en: 'Englisch',
        es: 'Spanisch',
        fr: 'Französisch',
        de: 'Deutsch',
        zh: 'Chinesisch',
        ko: 'Koreanisch',
        ar: 'Arabisch',
        hi: 'Hindi',
        pt: 'Portugiesisch',
        ru: 'Russisch'
      }
    }
  },
  zh: {
    translation: {
      settings: {
        title: '设置',
        description: '管理应用程序设置和偏好',
        appearance: {
          title: '外观',
          theme: {
            title: '主题',
            description: '选择浅色或深色模式',
            light: '浅色',
            dark: '深色'
          },
          language: {
            title: '语言',
            description: '选择您偏好的语言'
          }
        },
        notifications: {
          title: '通知',
          email: {
            title: '邮件通知',
            description: '通过电子邮件接收重要更新'
          },
          push: {
            title: '推送通知',
            description: '在浏览器中接收即时通知'
          },
          sms: {
            title: '短信通知',
            description: '通过短信接收通知'
          },
          marketingEmails: {
            title: '营销邮件',
            description: '接收促销邮件和新闻通讯'
          }
        },
        buttons: {
          save: '保存更改'
        },
        savedSuccessfully: '设置保存成功',
        failedToSave: '保存设置失败'
      },
      languages: {
        en: '英语',
        es: '西班牙语',
        fr: '法语',
        de: '德语',
        zh: '中文',
        ko: '韩语',
        ar: '阿拉伯语',
        hi: '印地语',
        pt: '葡萄牙语',
        ru: '俄语'
      }
    }
  },
  ko: {
    translation: {
      settings: {
        title: '설정',
        description: '애플리케이션 설정 및 기본 설정 관리',
        appearance: {
          title: '외관',
          theme: {
            title: '테마',
            description: '라이트 모드와 다크 모드 중 선택',
            light: '라이트',
            dark: '다크'
          },
          language: {
            title: '언어',
            description: '선호하는 언어 선택'
          }
        },
        notifications: {
          title: '알림',
          email: {
            title: '이메일 알림',
            description: '이메일로 중요 업데이트 수신'
          },
          push: {
            title: '푸시 알림',
            description: '브라우저에서 즉시 알림 수신'
          },
          sms: {
            title: 'SMS 알림',
            description: 'SMS로 알림 수신'
          },
          marketingEmails: {
            title: '마케팅 이메일',
            description: '프로모션 이메일 및 뉴스레터 수신'
          }
        },
        buttons: {
          save: '변경사항 저장'
        },
        savedSuccessfully: '설정이 성공적으로 저장되었습니다',
        failedToSave: '설정 저장 실패'
      },
      languages: {
        en: '영어',
        es: '스페인어',
        fr: '프랑스어',
        de: '독일어',
        zh: '중국어',
        ko: '한국어',
        ar: '아랍어',
        hi: '힌디어',
        pt: '포르투갈어',
        ru: '러시아어'
      }
    }
  },
  ar: {
    translation: {
      settings: {
        title: 'الإعدادات',
        description: 'إدارة إعدادات وتفضيلات التطبيق',
        appearance: {
          title: 'المظهر',
          theme: {
            title: 'السمة',
            description: 'اختر بين الوضع الفاتح والداكن',
            light: 'فاتح',
            dark: 'داكن'
          },
          language: {
            title: 'اللغة',
            description: 'اختر لغتك المفضلة'
          }
        },
        notifications: {
          title: 'الإشعارات',
          email: {
            title: 'إشعارات البريد الإلكتروني',
            description: 'تلقي التحديثات المهمة عبر البريد الإلكتروني'
          },
          push: {
            title: 'الإشعارات الفورية',
            description: 'تلقي إشعارات فورية في المتصفح'
          },
          sms: {
            title: 'إشعارات الرسائل القصيرة',
            description: 'تلقي الإشعارات عبر الرسائل النصية'
          },
          marketingEmails: {
            title: 'رسائل تسويقية',
            description: 'تلقي رسائل ترويجية ونشرات إخبارية'
          }
        },
        buttons: {
          save: 'حفظ التغييرات'
        },
        savedSuccessfully: 'تم حفظ الإعدادات بنجاح',
        failedToSave: 'فشل حفظ الإعدادات'
      },
      languages: {
        en: 'الإنجليزية',
        es: 'الإسبانية',
        fr: 'الفرنسية',
        de: 'الألمانية',
        zh: 'الصينية',
        ko: 'الكورية',
        ar: 'العربية',
        hi: 'الهندية',
        pt: 'البرتغالية',
        ru: 'الروسية'
      }
    }
  },
  hi: {
    translation: {
      settings: {
        title: 'सेटिंग्स',
        description: 'एप्लिकेशन सेटिंग्स और प्राथमिकताएं प्रबंधित करें',
        appearance: {
          title: 'दिखावट',
          theme: {
            title: 'थीम',
            description: 'लाइट और डार्क मोड के बीच चुनें',
            light: 'लाइट',
            dark: 'डार्क'
          },
          language: {
            title: 'भाषा',
            description: 'अपनी पसंदीदा भाषा चुनें'
          }
        },
        notifications: {
          title: 'सूचनाएं',
          email: {
            title: 'ईमेल सूचनाएं',
            description: 'ईमेल द्वारा महत्वपूर्ण अपडेट प्राप्त करें'
          },
          push: {
            title: 'पुश सूचनाएं',
            description: 'ब्राउज़र में तत्काल सूचनाएं प्राप्त करें'
          },
          sms: {
            title: 'एसएमएस सूचनाएं',
            description: 'टेक्स्ट मैसेज द्वारा सूचनाएं प्राप्त करें'
          },
          marketingEmails: {
            title: 'मार्केटिंग ईमेल',
            description: 'प्रोमोशनल ईमेल और न्यूज़लेटर प्राप्त करें'
          }
        },
        buttons: {
          save: 'परिवर्तन सहेजें'
        },
        savedSuccessfully: 'सेटिंग्स सफलतापूर्वक सहेजी गईं',
        failedToSave: 'सेटिंग्स सहेजने में विफल'
      },
      languages: {
        en: 'अंग्रेज़ी',
        es: 'स्पेनिश',
        fr: 'फ्रेंच',
        de: 'जर्मन',
        zh: 'चीनी',
        ko: 'कोरियाई',
        ar: 'अरबी',
        hi: 'हिंदी',
        pt: 'पुर्तगाली',
        ru: 'रूसी'
      }
    }
  },
  pt: {
    translation: {
      settings: {
        title: 'Configurações',
        description: 'Gerencie as configurações e preferências do aplicativo',
        appearance: {
          title: 'Aparência',
          theme: {
            title: 'Tema',
            description: 'Escolha entre modo claro e escuro',
            light: 'Claro',
            dark: 'Escuro'
          },
          language: {
            title: 'Idioma',
            description: 'Selecione seu idioma preferido'
          }
        },
        notifications: {
          title: 'Notificações',
          email: {
            title: 'Notificações por e-mail',
            description: 'Receba atualizações importantes por e-mail'
          },
          push: {
            title: 'Notificações push',
            description: 'Receba notificações instantâneas no navegador'
          },
          sms: {
            title: 'Notificações SMS',
            description: 'Receba notificações por mensagem de texto'
          },
          marketingEmails: {
            title: 'E-mails de marketing',
            description: 'Receba e-mails promocionais e newsletters'
          }
        },
        buttons: {
          save: 'Salvar alterações'
        },
        savedSuccessfully: 'Configurações salvas com sucesso',
        failedToSave: 'Falha ao salvar configurações'
      },
      languages: {
        en: 'Inglês',
        es: 'Espanhol',
        fr: 'Francês',
        de: 'Alemão',
        zh: 'Chinês',
        ko: 'Coreano',
        ar: 'Árabe',
        hi: 'Hindi',
        pt: 'Português',
        ru: 'Russo'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
