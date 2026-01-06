import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/constants/app_constants.dart';
import 'core/providers/auth_provider.dart';
import 'core/services/api_client.dart';
import 'core/services/notification_service.dart';
import 'features/splash/splash_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/home/home_screen.dart';
import 'features/properties/property_details_screen.dart';
import 'features/bookings/booking_summary_screen.dart';
import 'features/bookings/booking_success_screen.dart';
import 'features/bookings/my_bookings_screen.dart';
import 'features/host/host_dashboard_screen.dart';
import 'features/host/host_earnings_screen.dart';
import 'features/host/host_bookings_screen.dart';
import 'features/host/add_property_screen.dart';
import 'features/chat/chat_list_screen.dart';
import 'features/chat/chat_detail_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/wallet/wallet_screen.dart';
import 'features/bookings/checkout_screen.dart';
import 'features/search/search_screen.dart';
import 'features/favorites/favorites_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/reviews/review_screen.dart';
import 'core/providers/property_provider.dart';
import 'core/providers/booking_provider.dart';
import 'core/providers/host_provider.dart';
import 'core/providers/chat_provider.dart';
import 'core/providers/ai_voice_provider.dart';
import 'core/providers/favorites_provider.dart';
import 'core/providers/review_provider.dart';
import 'features/voice_call/call_screen.dart';

/// Background message handler - must be top-level
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message received: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  try {
    await Firebase.initializeApp();
    
    // Setup background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Initialize notification service
    await NotificationService().initialize();
    
    debugPrint('✅ Firebase initialized successfully');
  } catch (e) {
    debugPrint('⚠️ Firebase initialization failed: $e');
    // App can still run without Firebase
  }
  
  runApp(const JustBackApp());
}

class JustBackApp extends StatelessWidget {
  const JustBackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => HostProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => AIVoiceProvider()),
        ChangeNotifierProvider(create: (_) => FavoritesProvider()),
        ChangeNotifierProvider(create: (_) => ReviewProvider()),
        Provider(create: (_) => ApiClient()),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.green,
          primaryColor: AppConstants.primaryColor,
          scaffoldBackgroundColor: Colors.white,
          fontFamily: 'Outfit',
          appBarTheme: const AppBarTheme(
            elevation: 0,
            backgroundColor: Colors.white,
            iconTheme: IconThemeData(color: Colors.black),
            titleTextStyle: TextStyle(
              color: Colors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/my-bookings': (context) => const MyBookingsScreen(),
          '/booking-success': (context) => const BookingSuccessScreen(),
          '/host-dashboard': (context) => const HostDashboardScreen(),
          '/host-earnings': (context) => const HostEarningsScreen(),
          '/host-bookings': (context) => const HostBookingsScreen(),
          '/add-property': (context) => const AddPropertyScreen(),
          '/chat-list': (context) => const ChatListScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/wallet': (context) => const WalletScreen(),
          '/ai-call': (context) => const CallScreen(),
          '/search': (context) => const SearchScreen(),
          '/favorites': (context) => const FavoritesScreen(),
          '/notifications': (context) => const NotificationsScreen(),
          '/settings': (context) => const SettingsScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/property-details') {
            final propertyId = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => PropertyDetailsScreen(propertyId: propertyId),
            );
          }
          if (settings.name == '/booking-summary') {
            final property = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => BookingSummaryScreen(property: property),
            );
          }
          if (settings.name == '/chat-detail') {
            final conversation = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ChatDetailScreen(conversation: conversation),
            );
          }
          if (settings.name == '/checkout') {
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => CheckoutScreen(bookingDetails: args),
            );
          }
          if (settings.name == '/search-filtered') {
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => SearchScreen(
                initialQuery: args?['query'],
                initialCategory: args?['category'],
              ),
            );
          }
          if (settings.name == '/review') {
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ReviewScreen(
                bookingId: args['bookingId'],
                propertyId: args['propertyId'],
                propertyName: args['propertyName'],
                propertyImage: args['propertyImage'],
              ),
            );
          }
          return null;
        },
      ),
    );
  }
}
