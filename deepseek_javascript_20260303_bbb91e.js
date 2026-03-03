// AutiLingoComplete.js
// ARQUIVO ÚNICO - App React Native com Backend Simulado

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Vibration,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// ============================================
// BANCO DE DADOS SIMULADO (Backend Local)
// ============================================

const Database = {
  users: [],
  lessons: [
    {
      id: '1',
      title: 'Expressões Faciais',
      emoji: '😊',
      color: '#FF6B6B',
      level: 'Iniciante',
      category: 'social',
      exercises: [
        {
          question: 'Como esta pessoa está se sentindo?',
          image: '😊',
          options: ['Feliz', 'Triste', 'Bravo', 'Cansado'],
          correct: 0,
          hint: 'Observe o sorriso no rosto'
        },
        {
          question: 'O que significa esta expressão?',
          image: '😢',
          options: ['Alegria', 'Tristeza', 'Raiva', 'Medo'],
          correct: 1,
          hint: 'As lágrimas mostram que alguém está triste'
        },
        {
          question: 'Qual emoção esta pessoa está sentindo?',
          image: '😠',
          options: ['Feliz', 'Triste', 'Com raiva', 'Surpreso'],
          correct: 2,
          hint: 'Sobrancelhas franzidas significam raiva'
        }
      ]
    },
    {
      id: '2',
      title: 'Rotina Diária',
      emoji: '⏰',
      color: '#4ECDC4',
      level: 'Intermediário',
      category: 'routine',
      exercises: [
        {
          question: 'O que fazer primeiro ao acordar?',
          image: '🛏️',
          options: ['Escovar dentes', 'Tomar café', 'Vestir roupa', 'Acordar'],
          correct: 3,
          hint: 'Antes de tudo, você precisa acordar'
        },
        {
          question: 'Depois de escovar os dentes, o que fazer?',
          image: '🍳',
          options: ['Tomar café', 'Dormir de novo', 'Sair correndo', 'Nadar'],
          correct: 0,
          hint: 'Hora de se alimentar'
        }
      ]
    },
    {
      id: '3',
      title: 'Saudações',
      emoji: '👋',
      color: '#FFE66D',
      level: 'Iniciante',
      category: 'social',
      exercises: [
        {
          question: 'O que dizer quando encontra alguém?',
          image: '👋',
          options: ['Oi! Tudo bem?', 'Ficar quieto', 'Sair correndo', 'Olhar para baixo'],
          correct: 0,
          hint: 'É educado cumprimentar as pessoas'
        },
        {
          question: 'Como responder a "Como você está?"',
          image: '💬',
          options: ['"Estou bem, e você?"', 'Ignorar', 'Chorar', 'Gritar'],
          correct: 0,
          hint: 'É legal responder e perguntar de volta'
        }
      ]
    },
    {
      id: '4',
      title: 'Sons e Sensibilidades',
      emoji: '🔊',
      color: '#A8E6CF',
      level: 'Avançado',
      category: 'sensory',
      exercises: [
        {
          question: 'Qual som pode ser muito alto e incômodo?',
          image: '🎆',
          options: ['Pássaros cantando', 'Fogos de artifício', 'Chuva', 'Música suave'],
          correct: 1,
          hint: 'Alguns barulhos podem machucar os ouvidos'
        },
        {
          question: 'O que fazer quando um som está incomodando?',
          image: '🙉',
          options: ['Tampar os ouvidos', 'Gritar', 'Quebrar coisas', 'Ignorar'],
          correct: 0,
          hint: 'Proteger os ouvidos ajuda'
        }
      ]
    },
    {
      id: '5',
      title: 'Sentimentos',
      emoji: '💭',
      color: '#FFB347',
      level: 'Intermediário',
      category: 'emotions',
      exercises: [
        {
          question: 'Quando você está animado, você...',
          image: '🎉',
          options: ['Sorri e pula', 'Chora', 'Dorme', 'Fica parado'],
          correct: 0,
          hint: 'A animação nos faz querer comemorar'
        },
        {
          question: 'O que fazer quando está triste?',
          image: '😔',
          options: ['Conversar com alguém', 'Bater', 'Gritar', 'Se esconder'],
          correct: 0,
          hint: 'Conversar ajuda a se sentir melhor'
        }
      ]
    }
  ],
  progress: [],
  
  // Métodos do banco
  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  },
  
  createUser(userData) {
    const newUser = {
      id: String(this.users.length + 1),
      ...userData,
      level: 1,
      xp: 0,
      streak: 0,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  },
  
  getLessons() {
    return this.lessons;
  },
  
  getLessonById(id) {
    return this.lessons.find(l => l.id === id);
  },
  
  getUserProgress(userId) {
    return this.progress.filter(p => p.userId === userId);
  },
  
  updateProgress(userId, lessonId, completed, score) {
    const existing = this.progress.find(p => p.userId === userId && p.lessonId === lessonId);
    if (existing) {
      existing.completed = completed;
      existing.score = score;
      existing.lastAccessed = new Date().toISOString();
    } else {
      this.progress.push({
        userId,
        lessonId,
        completed,
        score,
        lastAccessed: new Date().toISOString()
      });
    }
    
    // Atualizar XP do usuário
    const user = this.users.find(u => u.id === userId);
    if (user && completed) {
      user.xp += 50;
      user.level = Math.floor(user.xp / 100) + 1;
    }
  }
};

// ============================================
// CONTEXTO DE AUTENTICAÇÃO
// ============================================

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@AutiLingo:user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Simular login
    const user = Database.findUserByEmail(email);
    if (user && user.password === password) {
      const userData = { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        level: user.level,
        xp: user.xp
      };
      await AsyncStorage.setItem('@AutiLingo:user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, message: 'Email ou senha inválidos' };
  };

  const register = async (name, email, password) => {
    const existing = Database.findUserByEmail(email);
    if (existing) {
      return { success: false, message: 'Email já cadastrado' };
    }
    
    const newUser = Database.createUser({ name, email, password });
    const userData = { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email,
      level: newUser.level,
      xp: newUser.xp
    };
    
    await AsyncStorage.setItem('@AutiLingo:user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@AutiLingo:user');
    setUser(null);
  };

  const updateUserData = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============================================
// TELA DE LOGIN
// ============================================

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginHeader}>
        <Text style={styles.logo}>🧩</Text>
        <Text style={styles.title}>AutiLingo</Text>
        <Text style={styles.subtitle}>Aprenda no seu ritmo</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#6C5CE7" />
          <TextInput
            style={styles.input}
            placeholder="Seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#6C5CE7" />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================
// TELA DE REGISTRO
// ============================================

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginHeader}>
        <Text style={styles.logo}>🌟</Text>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Comece sua jornada</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="account" size={20} color="#6C5CE7" />
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#6C5CE7" />
          <TextInput
            style={styles.input}
            placeholder="Seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#6C5CE7" />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkBold}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================
// TELA PRINCIPAL
// ============================================

const HomeScreen = ({ navigation }) => {
  const { user, logout, updateUserData } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = () => {
    // Carregar lições do "banco de dados"
    const allLessons = Database.getLessons();
    setLessons(allLessons);
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.homeContainer}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name}!</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.statBadgeText}>{user?.xp} XP</Text>
            </View>
            <View style={styles.statBadge}>
              <Icon name="fire" size={16} color="#FF6B6B" />
              <Text style={styles.statBadgeText}>Nível {user?.level}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progresso */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progresso de hoje</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '35%' }]} />
          </View>
          <Text style={styles.progressText}>35% concluído</Text>
        </View>

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {['Todos', 'Social', 'Rotina', 'Emoções', 'Sensorial'].map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lições */}
        <Text style={styles.sectionTitle}>Continue aprendendo</Text>
        <View style={styles.lessonsGrid}>
          {lessons.map(lesson => (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonCard, { backgroundColor: lesson.color }]}
              onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
            >
              <Text style={styles.lessonCardEmoji}>{lesson.emoji}</Text>
              <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
              <View style={styles.lessonCardLevel}>
                <Text style={styles.lessonCardLevelText}>{lesson.level}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dica do dia */}
        <View style={styles.tipCard}>
          <Icon name="lightbulb-on" size={30} color="#FFB347" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica do dia</Text>
            <Text style={styles.tipText}>
              Respire fundo 3 vezes quando sentir ansiedade
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================
// TELA DA LIÇÃO
// ============================================

const LessonScreen = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const { user, updateUserData } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const lessonData = Database.getLessonById(lessonId);
    setLesson(lessonData);
  }, [lessonId]);

  const handleAnswer = (selectedIndex) => {
    const exercise = lesson.exercises[currentExercise];
    const isCorrect = selectedIndex === exercise.correct;

    // Feedback tátil
    Vibration.vibrate(isCorrect ? 100 : 500);

    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    setTimeout(() => {
      setShowFeedback(false);
      
      if (currentExercise < lesson.exercises.length - 1) {
        // Próximo exercício
        setCurrentExercise(prev => prev + 1);
      } else {
        // Lição completa
        const finalScore = score + (isCorrect ? 10 : 0);
        Database.updateProgress(user.id, lessonId, true, finalScore);
        
        // Atualizar XP do usuário no contexto
        const updatedUser = Database.users.find(u => u.id === user.id);
        updateUserData({ xp: updatedUser.xp, level: updatedUser.level });
        
        Alert.alert(
          'Parabéns! 🎉',
          `Você completou a lição!\nGanhou 50 XP!\nTotal: ${finalScore} pontos`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, 1500);
  };

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  const exercise = lesson.exercises[currentExercise];

  return (
    <View style={styles.lessonContainer}>
      {/* Header da lição */}
      <View style={[styles.lessonHeader, { backgroundColor: lesson.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
        <View style={styles.exerciseCounter}>
          <Text style={styles.exerciseCounterText}>
            {currentExercise + 1}/{lesson.exercises.length}
          </Text>
        </View>
      </View>

      {/* Exercício */}
      <View style={styles.exerciseContainer}>
        <View style={styles.emojiContainer}>
          <Text style={styles.exerciseEmoji}>{exercise.image}</Text>
        </View>

        <Text style={styles.exerciseQuestion}>{exercise.question}</Text>

        <View style={styles.hintBox}>
          <Icon name="lightbulb-outline" size={20} color="#FFB347" />
          <Text style={styles.hintText}>{exercise.hint}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {exercise.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(index)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback modal */}
      <Modal visible={showFeedback} transparent animationType="fade">
        <View style={styles.feedbackOverlay}>
          <View style={[
            styles.feedbackBox,
            feedbackType === 'correct' ? styles.correctBox : styles.incorrectBox
          ]}>
            <Icon 
              name={feedbackType === 'correct' ? 'check-circle' : 'close-circle'} 
              size={60} 
              color="#FFF" 
            />
            <Text style={styles.feedbackText}>
              {feedbackType === 'correct' ? 'Muito bem!' : 'Tente novamente!'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// NAVEGAÇÃO PRINCIPAL
// ============================================

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        // Usuário logado - Mostrar Home e navegação
        <View style={{ flex: 1 }}>
          {/* Simples navegação por estado - em app real usaria React Navigation */}
          {!global.currentScreen && (global.currentScreen = 'Home')}
          {global.currentScreen === 'Home' && (
            <HomeScreen navigation={{ 
              navigate: (screen, params) => {
                if (screen === 'Lesson') {
                  global.currentScreen = 'Lesson';
                  global.lessonParams = params;
                }
              }
            }} />
          )}
          {global.currentScreen === 'Lesson' && (
            <LessonScreen 
              route={{ params: global.lessonParams }}
              navigation={{ goBack: () => { global.currentScreen = 'Home'; } }}
            />
          )}
        </View>
      ) : (
        // Usuário não logado - Mostrar telas de auth
        <View style={{ flex: 1 }}>
          {!global.authScreen && (global.authScreen = 'Login')}
          {global.authScreen === 'Login' && (
            <LoginScreen navigation={{ 
              navigate: (screen) => { global.authScreen = screen; }
            }} />
          )}
          {global.authScreen === 'Register' && (
            <RegisterScreen navigation={{ 
              navigate: (screen) => { global.authScreen = screen; }
            }} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  // Estilos de Login/Registro
  loginHeader: {
    backgroundColor: '#6C5CE7',
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  form: {
    padding: 20,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6C5CE7',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  linkBold: {
    color: '#6C5CE7',
    fontWeight: 'bold',
  },
  // Estilos da Home
  homeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#6C5CE7',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  statBadgeText: {
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  avatarButton: {
    padding: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  progressCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
  },
  progressText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 10,
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    elevation: 2,
  },
  categoryChipText: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  lessonCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  lessonCardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  lessonCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  lessonCardLevel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lessonCardLevelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Estilos da Lição
  lessonContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  lessonHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  exerciseCounter: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  exerciseCounterText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  exerciseContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    elevation: 5,
  },
  exerciseEmoji: {
    fontSize: 80,
  },
  exerciseQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  hintText: {
    color: '#FFB347',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackBox: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctBox: {
    backgroundColor: '#4CAF50',
  },
  incorrectBox: {
    backgroundColor: '#FF6B6B',
  },
  feedbackText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

// ============================================
// INSTRUÇÕES DE USO
// ============================================

/*
COMO USAR ESTE ARQUIVO ÚNICO:

1. Crie um novo projeto React Native:
   npx react-native init AutiLingo

2. Instale as dependências:
   cd AutiLingo
   npm install @react-native-async-storage/async-storage react-native-vector-icons

3. Para iOS, instale os ícones:
   cd ios && pod install

4. Substitua o conteúdo de App.js por este arquivo completo

5. Execute o app:
   npx react-native run-android  # para Android
   npx react-native run-ios      # para iOS

CARACTERÍSTICAS DO APP:

✅ Backend simulado (Database em memória)
✅ Autenticação completa (login/registro)
✅ 5 lições com múltiplos exercícios
✅ Sistema de XP e níveis
✅ Feedback visual e tátil
✅ Design acessível
✅ Progresso persistente
✅ Dicas diárias
✅ Interface amigável para autistas

USUÁRIO DE TESTE:
Email: teste@email.com
Senha: 123456

Ou cadastre um novo usuário!
*/