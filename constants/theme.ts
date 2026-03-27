export const Colors = {
    // Warm primary palette
    primary: '#E07A5F',       // terracotta
    primaryLight: '#F2A98A',  // peach
    primaryDark: '#C4614A',   // deep terracotta
  
    secondary: '#3D405B',     // deep slate navy
    secondaryLight: '#5C6080',
  
    accent: '#F2CC8F',        // warm golden sand
    accentDark: '#D4A96A',
  
    // Backgrounds
    background: '#FDF8F3',    // warm cream
    surface: '#FFFFFF',
    surfaceWarm: '#FFF5EC',   // light peach tint
    card: '#FFFAF6',
  
    // Greens for health/nature
    green: '#81B29A',
    greenLight: '#A8C5B5',
    greenDark: '#5E8F78',
  
    // Text
    textPrimary: '#2C2416',   // dark warm brown
    textSecondary: '#7A6954', // medium warm brown
    textMuted: '#B8A99A',     // light warm brown
    textLight: '#FFFFFF',
  
    // UI
    border: '#EDE3D9',
    borderLight: '#F5EFE8',
    divider: '#F0E8DF',
  
    // Status
    success: '#81B29A',
    warning: '#F2CC8F',
    error: '#E07A5F',
    info: '#8FA4C4',
  
    // Tab bar
    tabActive: '#E07A5F',
    tabInactive: '#B8A99A',
    tabBackground: '#FFFFFF',
  
    // Tracker colors
    potty: '#8FA4C4',         // calm blue
    walk: '#81B29A',          // green
    meal: '#F2CC8F',          // golden
    diary: '#C9B8E8',         // soft lavender
  };
  
  export const Typography = {
    // Display - Playfair Display for warmth & personality
    display: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 36,
      lineHeight: 44,
      color: Colors.textPrimary,
    },
    displayMedium: {
      fontFamily: 'PlayfairDisplay_600SemiBold',
      fontSize: 28,
      lineHeight: 36,
      color: Colors.textPrimary,
    },
  
    // Headings
    h1: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 24,
      lineHeight: 32,
      color: Colors.textPrimary,
    },
    h2: {
      fontFamily: 'Nunito_700Bold',
      fontSize: 20,
      lineHeight: 28,
      color: Colors.textPrimary,
    },
    h3: {
      fontFamily: 'Nunito_600SemiBold',
      fontSize: 17,
      lineHeight: 24,
      color: Colors.textPrimary,
    },
  
    // Body - Nunito for friendly readability
    bodyLarge: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 17,
      lineHeight: 26,
      color: Colors.textPrimary,
    },
    body: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 15,
      lineHeight: 22,
      color: Colors.textSecondary,
    },
    bodySmall: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 13,
      lineHeight: 18,
      color: Colors.textMuted,
    },
  
    label: {
      fontFamily: 'Nunito_600SemiBold',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.5,
      color: Colors.textSecondary,
    },
  
    caption: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 12,
      lineHeight: 16,
      color: Colors.textMuted,
    },
  };
  
  export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  };
  
  export const Shadow = {
    sm: {
      shadowColor: '#2C2416',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#2C2416',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#2C2416',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  };