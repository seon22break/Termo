export interface Translation {
  app: {
    name: string;
    welcome: string;
  };
  auth: {
    masterPassword: string;
    enterMasterPassword: string;
    confirmPassword: string;
    passwordsDoNotMatch: string;
    pleaseCompleteAllFields: string;
    saveMasterPassword: string;
    saving: string;
    masterPasswordSaved: string;
    errorSavingPassword: string;
    send: string;
    attempts: string;
    tooManyAttempts: string;
  };
  welcome: {
    needMasterPassword: string;
    introduceMasterPassword: string;
    systemNotCompatible: string;
    sorryNotCompatible: string;
    closeApplication: string;
    checkingCompatibility: string;
  };
  navigation: {
    closeTab: string;
  };
  search: {
    searchConnections: string;
    connections: string;
    noConnectionsFound: string;
    tryAnotherSearchTerm: string;
    noFolder: string;
    actions: string;
    newConnection: string;
    newFolder: string;
    toggleSidebar: string;
    openSettings: string;
    newConnectionDesc: string;
    newFolderDesc: string;
    toggleSidebarDesc: string;
    openSettingsDesc: string;
  };
  terminal: {
    doubleClickToOpen: string;
  };
  settings: {
    title: string;
    subtitle: string;
    noSettingsAvailable: string;
    settingsWillAppear: string;
    options: string;
    key: string;
    defaultValue: string;
    configured: string;
    default: string;
    configurationUpdated: string;
    settingSavedSuccessfully: string;
    configurationError: string;
    couldNotSaveSetting: string;
    tools: string;
    additionalFunctions: string;
    importFromOtherClient: string;
    importConnections: string;
    importConnectionsBtn: string;
    factoryReset: string;
    factoryResetDescription: string;
    actionCannotBeUndone: string;
    factoryResetBtn: string;
    resetting: string;
    factoryResetConfirmTitle: string;
    factoryResetConfirmText: string;
    factoryResetList: string[];
    factoryResetWarning: string;
    yesFactoryReset: string;
    cancel: string;
    factoryResetCompleted: string;
    databaseDeleted: string;
    factoryResetError: string;
    couldNotCompleteReset: string;
  };
  sidebar: {
    loadingConnections: string;
    createConnection: string;
    hideSidebar: string;
    showSidebar: string;
    settings: string;
    connections: string;
    updatingConnections: string;
    noConnections: string;
    testConnection: string;
    testingConnection: string;
    connectionSuccessful: string;
    connectionSuccessfulDesc: string;
    connectionError: string;
    deleteError: string;
    connectionTo: string;
    successful: string;
    failed: string;
    deleteConnection: string;
    deleteConnectionMessage: string;
    deleting: string;
    delete: string;
    cancel: string;
    deleteConnectionError: string;
    edit: string;
    testConnectionAction: string;
    error: string;
    newFolder: string;
    editFolder: string;
    deleteFolder: string;
    renameFolder: string;
    defaultFolder: string;
    folderName: string;
    enterFolderName: string;
    createFolder: string;
    updateFolder: string;
    saving: string;
  };
  connections: {
    add: {
      title: string;
      displayName: string;
      displayNamePlaceholder: string;
      host: string;
      hostPlaceholder: string;
      user: string;
      userPlaceholder: string;
      port: string;
      portPlaceholder: string;
      authType: string;
      password: string;
      passwordPlaceholder: string;
      sshKey: string;
      sshKeyPlaceholder: string;
      authTypes: {
        password: string;
        sshkey: string;
      };
      save: string;
      saving: string;
      cancel: string;
      requiredFields: string;
      completeAllFields: string;
      passwordRequired: string;
      enterPassword: string;
      sshKeyRequired: string;
      enterSshKey: string;
      connectionCreated: string;
      connectionCreatedSuccess: string;
      errorCreating: string;
    };
    edit: {
      title: string;
      save: string;
      saving: string;
      connectionUpdated: string;
      connectionUpdatedSuccess: string;
      errorUpdating: string;
    };
    import: {
      title: string;
      description: string;
      selectFile: string;
      fileSelected: string;
      provider: string;
      previewConnections: string;
      noFile: string;
      pleaseSelect: string;
      processing: string;
      fileProcessed: string;
      connectionsFound: string;
      processingError: string;
      errorProcessing: string;
      preview: string;
      foundConnections: string;
      importing: string;
      importInProgress: string;
      cancel: string;
      import: string;
      connectionImported: string;
      connectionImportedSuccess: string;
      connectionError: string;
      connectionErrorDetail: string;
      importCompleted: string;
      importedSuccess: string;
      goBack: string;
      tryAnother: string;
      unknownError: string;
      reset: string;
      configFile: string;
      selectFileXML: string;
      fileDescription: string;
      appType: string;
      selectAppDescription: string;
      previewTitle: string;
      importConnections: string;
      importingConnections: string;
      importingDescription: string;
    };
  };
  modal: {
    save: string;
    displayName: string;
    host: string;
    user: string;
    password: string;
    newConnection: string;
  };
  common: {
    yes: string;
    no: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    goBack: string;
  };
  pageSystem: {
    pages: {
      principal: string;
      security: string;
      welcome: string;
    };
    tabs: {
      terminal: string;
      addConnection: string;
      importConnections: string;
      settings: string;
      editConnection: string;
      placeholder: string;
      help: string;
      notFound: string;
      notAllowed: string;
      newTab: string;
    };
    errors: {
      connectionNotFound: string;
      contentNotFound: string;
    };
  };
  placeholder: {
    appName: string;
    tagline: string;
    tip1: string;
    tip2: string;
    tip3: string;
  };
  errors: {
    processingError: string;
    folderNameRequired: string;
    folderNameTooLong: string;
    invalidFolderChars: string;
    notFound: {
      title: string;
      subtitle: string;
      tip1: string;
      tip2: string;
    };
    notAllowed: {
      title: string;
      subtitle: string;
      message: string;
      tip1: string;
      tip2: string;
    };
  };
  settingsKeys: {
    cipher_password: string;
    cipher_password_description: string;
    language: string;
    language_description: string;
  };
  languages: {
    es: string;
    en: string;
  };
  folders: {
    folderName: string;
    enterFolderName: string;
    createFolder: string;
    editFolder: string;
    folderNameRequired: string;
    folderNameTooLong: string;
    invalidCharacters: string;
    creating: string;
    updating: string;
    create: string;
    update: string;
    save: string;
    cancel: string;
    deleteFolderTitle: string;
    deleteFolderMessage: string;
    deleting: string;
    cannotDeleteFolder: string;
    folderHasConnections: string;
    folderCreated: string;
    folderCreatedSuccess: string;
    folderUpdated: string;
    folderUpdatedSuccess: string;
    folderDeleted: string;
    folderDeletedSuccess: string;
    errorCreatingFolder: string;
    errorUpdatingFolder: string;
    errorDeletingFolder: string;
    folder: string;
    selectFolder: string;
    noConnections: string;
  };
}

export type Language = 'es' | 'en';

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
  isLoading: boolean;
}
